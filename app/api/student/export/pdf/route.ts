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
    // Group and sort entries by day and time
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
    // Generate HTML
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
    const filename = `ClassTimetable_${classId}_${new Date().toISOString().split('T')[0]}.html`
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Student PDF export error:", error)
    return NextResponse.json({ error: "Failed to export class timetable" }, { status: 500 })
  }
} 