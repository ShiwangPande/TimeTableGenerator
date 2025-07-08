export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"
import * as XLSX from "xlsx"

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

    // Calculate statistics
    const totalClasses = entries.length
    const uniqueSubjects = new Set(entries.map(e => e.subject.name)).size
    const uniqueClasses = new Set(entries.map(e => e.class.id)).size
    const totalHours = entries.reduce((sum, entry) => {
      try {
        const startTime = entry.timeSlot.startTime instanceof Date 
          ? entry.timeSlot.startTime 
          : new Date(entry.timeSlot.startTime)
        const endTime = entry.timeSlot.endTime instanceof Date 
          ? entry.timeSlot.endTime 
          : new Date(entry.timeSlot.endTime)
        
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
          return sum + duration
        }
      } catch (error) {
        console.warn('Error calculating duration for entry:', entry.id)
      }
      return sum + 1
    }, 0)

    // Group by day and calculate daily statistics
    const dailyStats = entries.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) {
        acc[entry.dayOfWeek] = {
          classes: 0,
          hours: 0,
          subjects: new Set(),
          classes_list: new Set()
        }
      }
      
      acc[entry.dayOfWeek].classes++
      
      try {
        const startTime = entry.timeSlot.startTime instanceof Date 
          ? entry.timeSlot.startTime 
          : new Date(entry.timeSlot.startTime)
        const endTime = entry.timeSlot.endTime instanceof Date 
          ? entry.timeSlot.endTime 
          : new Date(entry.timeSlot.endTime)
        
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
          acc[entry.dayOfWeek].hours += duration
        } else {
          acc[entry.dayOfWeek].hours += 1
        }
      } catch (error) {
        acc[entry.dayOfWeek].hours += 1
      }
      
      acc[entry.dayOfWeek].subjects.add(entry.subject.name)
      acc[entry.dayOfWeek].classes_list.add(`${entry.class.name} ${entry.class.section}`)
      
      return acc
    }, {} as Record<string, { classes: number; hours: number; subjects: Set<string>; classes_list: Set<string> }>)

    // Group by subject
    const subjectStats = entries.reduce((acc, entry) => {
      if (!acc[entry.subject.name]) {
        acc[entry.subject.name] = {
          classes: 0,
          hours: 0,
          classes_list: new Set()
        }
      }
      
      acc[entry.subject.name].classes++
      
      try {
        const startTime = entry.timeSlot.startTime instanceof Date 
          ? entry.timeSlot.startTime 
          : new Date(entry.timeSlot.startTime)
        const endTime = entry.timeSlot.endTime instanceof Date 
          ? entry.timeSlot.endTime 
          : new Date(entry.timeSlot.endTime)
        
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
          acc[entry.subject.name].hours += duration
        } else {
          acc[entry.subject.name].hours += 1
        }
      } catch (error) {
        acc[entry.subject.name].hours += 1
      }
      
      acc[entry.subject.name].classes_list.add(`${entry.class.name} ${entry.class.section}`)
      
      return acc
    }, {} as Record<string, { classes: number; hours: number; classes_list: Set<string> }>)

    // Create workbook
    const wb = XLSX.utils.book_new()

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
    dailyWs['!cols'] = [
      { wch: 15 }, // Day
      { wch: 10 }, // Classes
      { wch: 10 }, // Hours
      { wch: 30 }, // Subjects
      { wch: 40 }, // Classes List
    ]

    // Subject breakdown sheet
    const subjectData = Object.entries(subjectStats).map(([subject, stats]) => ({
      Subject: subject,
      Classes: stats.classes,
      Hours: stats.hours.toFixed(2),
      Classes_List: Array.from(stats.classes_list).join(", ")
    }))
    const subjectWs = XLSX.utils.json_to_sheet(subjectData)
    subjectWs['!cols'] = [
      { wch: 25 }, // Subject
      { wch: 10 }, // Classes
      { wch: 10 }, // Hours
      { wch: 40 }, // Classes List
    ]

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")
    XLSX.utils.book_append_sheet(wb, dailyWs, "Daily Breakdown")
    XLSX.utils.book_append_sheet(wb, subjectWs, "Subject Breakdown")

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    // Create filename with teacher name and date
    const teacherName = user.name.replace(/[^a-zA-Z0-9]/g, '_')
    const date = new Date().toISOString().split('T')[0]
    const filename = `${teacherName}_Weekly_Summary_${date}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Teacher summary export error:", error)
    return NextResponse.json(
      { error: "Failed to export teacher summary" },
      { status: 500 }
    )
  }
} 