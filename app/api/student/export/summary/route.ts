import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"
import * as XLSX from "xlsx"

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
    // Calculate statistics
    const totalClasses = entries.length
    const uniqueSubjects = new Set(entries.map(e => e.subject.name)).size
    const uniqueTeachers = new Set(entries.map(e => e.subject.teacher.user.name)).size
    const totalHours = entries.length * 1
    // Daily breakdown
    const dailyStats = entries.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) acc[entry.dayOfWeek] = { classes: 0, hours: 0, subjects: new Set(), teachers: new Set() }
      acc[entry.dayOfWeek].classes++
      acc[entry.dayOfWeek].hours += 1
      acc[entry.dayOfWeek].subjects.add(entry.subject.name)
      acc[entry.dayOfWeek].teachers.add(entry.subject.teacher.user.name)
      return acc
    }, {} as Record<string, { classes: number; hours: number; subjects: Set<string>; teachers: Set<string> }>)
    // Subject breakdown
    const subjectStats = entries.reduce((acc, entry) => {
      if (!acc[entry.subject.name]) acc[entry.subject.name] = { classes: 0, teachers: new Set() }
      acc[entry.subject.name].classes++
      acc[entry.subject.name].teachers.add(entry.subject.teacher.user.name)
      return acc
    }, {} as Record<string, { classes: number; teachers: Set<string> }>)
    // Create workbook
    const wb = XLSX.utils.book_new()
    // Summary sheet
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
    // Daily breakdown sheet
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
    // Subject breakdown sheet
    const subjectData = Object.entries(subjectStats).map(([subject, stats]) => ({
      Subject: subject,
      Classes: stats.classes,
      Teachers: Array.from(stats.teachers).join(", ")
    }))
    const subjectWs = XLSX.utils.json_to_sheet(subjectData)
    subjectWs['!cols'] = [
      { wch: 25 }, { wch: 10 }, { wch: 30 }
    ]
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")
    XLSX.utils.book_append_sheet(wb, dailyWs, "Daily Breakdown")
    XLSX.utils.book_append_sheet(wb, subjectWs, "Subject Breakdown")
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    const filename = `ClassSummary_${classId}_${new Date().toISOString().split('T')[0]}.xlsx`
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Student summary export error:", error)
    return NextResponse.json({ error: "Failed to export class summary" }, { status: 500 })
  }
} 