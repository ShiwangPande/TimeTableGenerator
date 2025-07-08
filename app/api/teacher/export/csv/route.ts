export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"

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

    // Transform data for CSV export
    const csvData = entries.map((entry) => {
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

    // Convert to CSV
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    // Create filename with teacher name and date
    const teacherName = user.name.replace(/[^a-zA-Z0-9]/g, '_')
    const date = new Date().toISOString().split('T')[0]
    const filename = `${teacherName}_Timetable_${date}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Teacher CSV export error:", error)
    return NextResponse.json(
      { error: "Failed to export teacher timetable" },
      { status: 500 }
    )
  }
} 