export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"
import * as XLSX from "xlsx"
import JSZip from "jszip"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(Role.TEACHER)
    const { searchParams } = new URL(request.url)
    
    // Get teacher ID from query params or use current user
    const teacherId = searchParams.get("teacherId")
    
    // Verify the teacher is accessing their own data
    if (teacherId && teacherId !== user.teacher?.id) {
      return NextResponse.json(
        { error: "You can only export your own timetable" },
        { status: 403 }
      )
    }

    // Get teacher's timetable entries
    const entries = await getTimetable({
      teacherId: user.teacher?.id
    })

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "No timetable entries found for this teacher" },
        { status: 404 }
      )
    }

    // Create a new ZIP file
    const zip = new JSZip()

    // Helper function to calculate duration
    const calculateDuration = (entry: any) => {
      try {
        const startTime = entry.timeSlot.startTime instanceof Date 
          ? entry.timeSlot.startTime 
          : new Date(entry.timeSlot.startTime)
        const endTime = entry.timeSlot.endTime instanceof Date 
          ? entry.timeSlot.endTime 
          : new Date(entry.timeSlot.endTime)
        
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        }
      } catch (error) {
        console.warn('Error calculating duration for entry:', entry.id)
      }
      return 1
    }

    // Helper function to format time
    const formatTime = (time: any) => {
      const date = time instanceof Date ? time : new Date(time)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    // 1. Excel Export
    const excelData = entries.map((entry) => {
      const duration = calculateDuration(entry)
      return {
        Day: entry.dayOfWeek,
        Time: entry.timeSlot.label,
        Start_Time: formatTime(entry.timeSlot.startTime),
        End_Time: formatTime(entry.timeSlot.endTime),
        Duration_Hours: duration.toFixed(2),
        Subject: entry.subject.name,
        Class: `${entry.class.name} ${entry.class.section}`,
        Class_Level: entry.class.level,
        Room: entry.room.name,
        Room_Capacity: entry.room.capacity,
        Teacher: entry.subject.teacher.user.name,
        Teacher_Email: entry.subject.teacher.user.email,
      }
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)
    ws['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      { wch: 20 }, { wch: 25 }
    ]
    XLSX.utils.book_append_sheet(wb, ws, "Timetable")
    
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    zip.file("Timetable_Excel.xlsx", excelBuffer)

    // 2. CSV Export
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
    zip.file("Timetable_CSV.csv", csvContent)

    // 3. Summary Export
    const totalClasses = entries.length
    const uniqueSubjects = new Set(entries.map(e => e.subject.name)).size
    const uniqueClasses = new Set(entries.map(e => e.class.id)).size
    const totalHours = entries.reduce((sum, entry) => sum + calculateDuration(entry), 0)

    // Daily breakdown
    const dailyStats = entries.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) {
        acc[entry.dayOfWeek] = { classes: 0, hours: 0, subjects: new Set(), classes_list: new Set() }
      }
      acc[entry.dayOfWeek].classes++
      acc[entry.dayOfWeek].hours += calculateDuration(entry)
      acc[entry.dayOfWeek].subjects.add(entry.subject.name)
      acc[entry.dayOfWeek].classes_list.add(`${entry.class.name} ${entry.class.section}`)
      return acc
    }, {} as Record<string, { classes: number; hours: number; subjects: Set<string>; classes_list: Set<string> }>)

    // Subject breakdown
    const subjectStats = entries.reduce((acc, entry) => {
      if (!acc[entry.subject.name]) {
        acc[entry.subject.name] = { classes: 0, hours: 0, classes_list: new Set() }
      }
      acc[entry.subject.name].classes++
      acc[entry.subject.name].hours += calculateDuration(entry)
      acc[entry.subject.name].classes_list.add(`${entry.class.name} ${entry.class.section}`)
      return acc
    }, {} as Record<string, { classes: number; hours: number; classes_list: Set<string> }>)

    const summaryWb = XLSX.utils.book_new()
    
    // Summary sheet
    const summaryData = [
      { Field: "Teacher Name", Value: user.name },
      { Field: "Teacher Email", Value: user.email },
      { Field: "Total Classes", Value: totalClasses },
      { Field: "Total Subjects", Value: uniqueSubjects },
      { Field: "Total Classes", Value: uniqueClasses },
      { Field: "Total Hours", Value: totalHours.toFixed(2) },
      { Field: "Average Classes per Day", Value: (totalClasses / 5).toFixed(1) },
      { Field: "Average Hours per Day", Value: (totalHours / 5).toFixed(2) },
      { Field: "Export Date", Value: new Date().toLocaleDateString() },
      { Field: "Export Time", Value: new Date().toLocaleTimeString() },
    ]
    const summaryWs = XLSX.utils.json_to_sheet(summaryData)
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 30 }]

    // Daily breakdown sheet
    const dailyData = Object.entries(dailyStats).map(([day, stats]) => ({
      Day: day,
      Classes: stats.classes,
      Hours: stats.hours.toFixed(2),
      Subjects: Array.from(stats.subjects).join(", "),
      Classes_List: Array.from(stats.classes_list).join(", ")
    }))
    const dailyWs = XLSX.utils.json_to_sheet(dailyData)
    dailyWs['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 40 }]

    // Subject breakdown sheet
    const subjectData = Object.entries(subjectStats).map(([subject, stats]) => ({
      Subject: subject,
      Classes: stats.classes,
      Hours: stats.hours.toFixed(2),
      Classes_List: Array.from(stats.classes_list).join(", ")
    }))
    const subjectWs = XLSX.utils.json_to_sheet(subjectData)
    subjectWs['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 40 }]

    XLSX.utils.book_append_sheet(summaryWb, summaryWs, "Summary")
    XLSX.utils.book_append_sheet(summaryWb, dailyWs, "Daily Breakdown")
    XLSX.utils.book_append_sheet(summaryWb, subjectWs, "Subject Breakdown")
    
    const summaryBuffer = XLSX.write(summaryWb, { type: "buffer", bookType: "xlsx" })
    zip.file("Weekly_Summary.xlsx", summaryBuffer)

    // 4. PDF/HTML Export
    const entriesByDay = entries.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) acc[entry.dayOfWeek] = []
      acc[entry.dayOfWeek].push(entry)
      return acc
    }, {} as Record<string, typeof entries>)

    Object.keys(entriesByDay).forEach(day => {
      entriesByDay[day].sort((a, b) => {
        const timeA = a.timeSlot.startTime instanceof Date ? a.timeSlot.startTime : new Date(a.timeSlot.startTime)
        const timeB = b.timeSlot.startTime instanceof Date ? b.timeSlot.startTime : new Date(b.timeSlot.startTime)
        return timeA.getTime() - timeB.getTime()
      })
    })

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${user.name} - Teaching Timetable</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .stats { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
        .day-section { margin-bottom: 30px; page-break-inside: avoid; }
        .day-title { background: #2563eb; color: white; padding: 10px 15px; font-weight: bold; border-radius: 5px 5px 0 0; margin: 0; }
        .day-content { border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 5px 5px; }
        .entry { display: flex; padding: 15px; border-bottom: 1px solid #f3f4f6; align-items: center; }
        .entry:last-child { border-bottom: none; }
        .time { width: 120px; font-weight: bold; color: #2563eb; }
        .subject { flex: 1; font-weight: bold; }
        .class { width: 150px; color: #666; }
        .room { width: 100px; color: #666; }
        .duration { width: 80px; text-align: right; color: #666; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        @media print { body { margin: 0; } .day-section { page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Teaching Timetable</h1>
        <p><strong>Teacher:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-number">${totalClasses}</div>
          <div class="stat-label">Total Classes</div>
        </div>
        <div class="stat">
          <div class="stat-number">${uniqueSubjects}</div>
          <div class="stat-label">Subjects</div>
        </div>
        <div class="stat">
          <div class="stat-number">${uniqueClasses}</div>
          <div class="stat-label">Classes</div>
        </div>
        <div class="stat">
          <div class="stat-number">${totalHours.toFixed(1)}</div>
          <div class="stat-label">Hours</div>
        </div>
      </div>

      ${Object.entries(entriesByDay).map(([day, dayEntries]) => `
        <div class="day-section">
          <h2 class="day-title">${day}</h2>
          <div class="day-content">
            ${dayEntries.map(entry => {
              const duration = calculateDuration(entry)
              return `
                <div class="entry">
                  <div class="time">${entry.timeSlot.label}</div>
                  <div class="subject">${entry.subject.name}</div>
                  <div class="class">${entry.class.name} ${entry.class.section}</div>
                  <div class="room">${entry.room.name}</div>
                  <div class="duration">${duration.toFixed(1)}h</div>
                </div>
              `
            }).join('')}
          </div>
        </div>
      `).join('')}

      <div class="footer">
        <p>Generated by Timetable Generator System</p>
        <p>This document contains confidential teaching schedule information</p>
      </div>
    </body>
    </html>
    `
    zip.file("Timetable_PDF.html", html)

    // 5. README file
    const readme = `
TEACHER TIMETABLE EXPORT PACKAGE
================================

Generated for: ${user.name}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

FILES INCLUDED:
---------------
1. Timetable_Excel.xlsx - Complete timetable in Excel format with multiple sheets
2. Timetable_CSV.csv - Simple CSV format for importing into other applications
3. Weekly_Summary.xlsx - Detailed breakdown with summary, daily stats, and subject analysis
4. Timetable_PDF.html - Print-friendly HTML version (open in browser and print to PDF)

SUMMARY:
--------
- Total Classes: ${totalClasses}
- Total Subjects: ${uniqueSubjects}
- Total Classes: ${uniqueClasses}
- Total Hours: ${totalHours.toFixed(2)}
- Average Classes per Day: ${(totalClasses / 5).toFixed(1)}
- Average Hours per Day: ${(totalHours / 5).toFixed(2)}

USAGE:
------
- Excel file: Open in Microsoft Excel or compatible spreadsheet software
- CSV file: Import into Google Sheets, Excel, or other spreadsheet applications
- Summary file: Contains detailed analysis and statistics
- HTML file: Open in web browser and use browser's print function to save as PDF

For questions or support, please contact the administration.
    `
    zip.file("README.txt", readme)

    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    // Create filename
    const teacherName = user.name.replace(/[^a-zA-Z0-9]/g, '_')
    const date = new Date().toISOString().split('T')[0]
    const filename = `${teacherName}_Complete_Timetable_Export_${date}.zip`

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Teacher all formats export error:", error)
    return NextResponse.json(
      { error: "Failed to export teacher timetable" },
      { status: 500 }
    )
  }
} 