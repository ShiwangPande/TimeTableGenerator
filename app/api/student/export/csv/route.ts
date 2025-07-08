export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"

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
    const csvData = entries.map((entry) => ({
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
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')
    const filename = `ClassTimetable_${classId}_${new Date().toISOString().split('T')[0]}.csv`
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Student CSV export error:", error)
    return NextResponse.json({ error: "Failed to export class timetable" }, { status: 500 })
  }
} 