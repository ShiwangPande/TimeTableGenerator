export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"
import { getCurrentUser } from "@/lib/auth"
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

    // Transform data for Excel export
    const excelData = entries.map((entry) => {
      // Calculate duration
      let duration = 1
      try {
        const startTime = entry.timeSlot.startTime instanceof Date 
          ? entry.timeSlot.startTime 
          : new Date(entry.timeSlot.startTime)
        const endTime = entry.timeSlot.endTime instanceof Date 
          ? entry.timeSlot.endTime 
          : new Date(entry.timeSlot.endTime)
        
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        }
      } catch (error) {
        console.warn('Error calculating duration for entry:', entry.id)
      }

      return {
        Day: entry.dayOfWeek,
        Time: entry.timeSlot.label,
        Start_Time: entry.timeSlot.startTime instanceof Date 
          ? entry.timeSlot.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : new Date(entry.timeSlot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        End_Time: entry.timeSlot.endTime instanceof Date 
          ? entry.timeSlot.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : new Date(entry.timeSlot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Day
      { wch: 15 }, // Time
      { wch: 10 }, // Start_Time
      { wch: 10 }, // End_Time
      { wch: 12 }, // Duration_Hours
      { wch: 20 }, // Subject
      { wch: 15 }, // Class
      { wch: 12 }, // Class_Level
      { wch: 15 }, // Room
      { wch: 12 }, // Room_Capacity
      { wch: 20 }, // Teacher
      { wch: 25 }, // Teacher_Email
    ]
    ws['!cols'] = colWidths

    // Add teacher info sheet
    const teacherInfo = [
      { Field: "Teacher Name", Value: user.name },
      { Field: "Teacher Email", Value: user.email },
      { Field: "Total Classes", Value: entries.length },
      { Field: "Total Subjects", Value: new Set(entries.map(e => e.subject.name)).size },
      { Field: "Total Classes", Value: new Set(entries.map(e => e.class.id)).size },
      { Field: "Export Date", Value: new Date().toLocaleDateString() },
      { Field: "Export Time", Value: new Date().toLocaleTimeString() },
    ]
    const infoWs = XLSX.utils.json_to_sheet(teacherInfo)
    infoWs['!cols'] = [{ wch: 20 }, { wch: 30 }]

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Timetable")
    XLSX.utils.book_append_sheet(wb, infoWs, "Teacher Info")

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    // Create filename with teacher name and date
    const teacherName = user.name.replace(/[^a-zA-Z0-9]/g, '_')
    const date = new Date().toISOString().split('T')[0]
    const filename = `${teacherName}_Timetable_${date}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Teacher Excel export error:", error)
    return NextResponse.json(
      { error: "Failed to export teacher timetable" },
      { status: 500 }
    )
  }
} 