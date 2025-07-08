import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"
import * as XLSX from "xlsx"
import JSZip from "jszip"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(Role.STUDENT)
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || user.student?.classId
    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 })
    }
    const entries = await getTimetable({ classId })
    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No timetable entries found for this class" }, { status: 404 })
    }
    const zip = new JSZip()
    // Excel
    const excelData = entries.map((entry) => ({
      Day: entry.dayOfWeek,
      Time: entry.timeSlot.label,
      Start_Time: entry.timeSlot.startTime instanceof Date 
        ? entry.timeSlot.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : new Date(entry.timeSlot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      End_Time: entry.timeSlot.endTime instanceof Date 
        ? entry.timeSlot.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : new Date(entry.timeSlot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      Subject: entry.subject.name,
      Teacher: entry.subject.teacher.user.name,
      Room: entry.room.name,
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)
    ws['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
    ]
    XLSX.utils.book_append_sheet(wb, ws, "Timetable")
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    zip.file("ClassTimetable_Excel.xlsx", excelBuffer)
    // CSV
    const headers = Object.keys(excelData[0])
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')
    zip.file("ClassTimetable_CSV.csv", csvContent)
    // Summary
    const totalClasses = entries.length
    const uniqueSubjects = new Set(entries.map(e => e.subject.name)).size
    const uniqueTeachers = new Set(entries.map(e => e.subject.teacher.user.name)).size
    const totalHours = entries.length * 1
    const dailyStats = entries.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) acc[entry.dayOfWeek] = { classes: 0, hours: 0, subjects: new Set(), teachers: new Set() }
      acc[entry.dayOfWeek].classes++
      acc[entry.dayOfWeek].hours += 1
      acc[entry.dayOfWeek].subjects.add(entry.subject.name)
      acc[entry.dayOfWeek].teachers.add(entry.subject.teacher.user.name)
      return acc
    }, {} as Record<string, { classes: number; hours: number; subjects: Set<string>; teachers: Set<string> }>)
    const subjectStats = entries.reduce((acc, entry) => {
      if (!acc[entry.subject.name]) acc[entry.subject.name] = { classes: 0, teachers: new Set() }
      acc[entry.subject.name].classes++
      acc[entry.subject.name].teachers.add(entry.subject.teacher.user.name)
      return acc
    }, {} as Record<string, { classes: number; teachers: Set<string> }>)
    const summaryWb = XLSX.utils.book_new()
    const summaryData = [
      { Field: "Class Name", Value: user.student.class.name },
      { Field: "Section", Value: user.student.class.section },
      { Field: "Total Classes", Value: totalClasses },
      { Field: "Total Subjects", Value: uniqueSubjects },
      { Field: "Total Teachers", Value: uniqueTeachers },
      { Field: "Total Hours", Value: totalHours },
      { Field: "Export Date", Value: new Date().toLocaleDateString() },
      { Field: "Export Time", Value: new Date().toLocaleTimeString() },
    ]
    const summaryWs = XLSX.utils.json_to_sheet(summaryData)
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 30 }]
    const dailyData = Object.entries(dailyStats).map(([day, stats]) => ({
      Day: day,
      Classes: stats.classes,
      Hours: stats.hours,
      Subjects: Array.from(stats.subjects).join(", "),
      Teachers: Array.from(stats.teachers).join(", ")
    }))
    const dailyWs = XLSX.utils.json_to_sheet(dailyData)
    dailyWs['!cols'] = [
      { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 30 }
    ]
    const subjectData = Object.entries(subjectStats).map(([subject, stats]) => ({
      Subject: subject,
      Classes: stats.classes,
      Teachers: Array.from(stats.teachers).join(", ")
    }))
    const subjectWs = XLSX.utils.json_to_sheet(subjectData)
    subjectWs['!cols'] = [
      { wch: 25 }, { wch: 10 }, { wch: 30 }
    ]
    XLSX.utils.book_append_sheet(summaryWb, summaryWs, "Summary")
    XLSX.utils.book_append_sheet(summaryWb, dailyWs, "Daily Breakdown")
    XLSX.utils.book_append_sheet(summaryWb, subjectWs, "Subject Breakdown")
    const summaryBuffer = XLSX.write(summaryWb, { type: "buffer", bookType: "xlsx" })
    zip.file("ClassSummary.xlsx", summaryBuffer)
    // PDF/HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Class Timetable</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Class Timetable</h1>
      <p>Class: ${user.student.class.name} ${user.student.class.section}</p>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Subject</th>
            <th>Teacher</th>
            <th>Room</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(entry => `
            <tr>
              <td>${entry.dayOfWeek}</td>
              <td>${entry.timeSlot.label}</td>
              <td>${entry.subject.name}</td>
              <td>${entry.subject.teacher.user.name}</td>
              <td>${entry.room.name}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Generated by Timetable Generator System</p>
      </div>
    </body>
    </html>
    `
    zip.file("ClassTimetable_PDF.html", html)
    // README
    const readme = `
STUDENT TIMETABLE EXPORT PACKAGE
===============================

Generated for: ${user.email}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

FILES INCLUDED:
---------------
1. ClassTimetable_Excel.xlsx - Complete timetable in Excel format
2. ClassTimetable_CSV.csv - Simple CSV format
3. ClassSummary.xlsx - Detailed breakdown
4. ClassTimetable_PDF.html - Print-friendly HTML version

SUMMARY:
--------
- Total Classes: ${totalClasses}
- Total Subjects: ${uniqueSubjects}
- Total Teachers: ${uniqueTeachers}
- Total Hours: ${totalHours}

USAGE:
------
- Excel file: Open in Microsoft Excel or compatible spreadsheet software
- CSV file: Import into Google Sheets, Excel, or other spreadsheet applications
- Summary file: Contains detailed analysis and statistics
- HTML file: Open in web browser and use browser's print function to save as PDF

For questions or support, please contact the administration.
    `
    zip.file("README.txt", readme)
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })
    const filename = `ClassTimetable_Export_${classId}_${new Date().toISOString().split('T')[0]}.zip`
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Student all formats export error:", error)
    return NextResponse.json({ error: "Failed to export class timetable" }, { status: 500 })
  }
} 