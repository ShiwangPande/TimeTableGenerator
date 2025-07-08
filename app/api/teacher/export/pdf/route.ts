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

    // Group entries by day
    const entriesByDay = entries.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) {
        acc[entry.dayOfWeek] = []
      }
      acc[entry.dayOfWeek].push(entry)
      return acc
    }, {} as Record<string, typeof entries>)

    // Sort entries by time within each day
    Object.keys(entriesByDay).forEach(day => {
      entriesByDay[day].sort((a, b) => {
        const timeA = a.timeSlot.startTime instanceof Date ? a.timeSlot.startTime : new Date(a.timeSlot.startTime)
        const timeB = b.timeSlot.startTime instanceof Date ? b.timeSlot.startTime : new Date(b.timeSlot.startTime)
        return timeA.getTime() - timeB.getTime()
      })
    })

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

    // Generate HTML for PDF
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${user.name} - Teaching Timetable</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }
        .stat {
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .day-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .day-title {
          background: #2563eb;
          color: white;
          padding: 10px 15px;
          font-weight: bold;
          border-radius: 5px 5px 0 0;
          margin: 0;
        }
        .day-content {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .entry {
          display: flex;
          padding: 15px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }
        .entry:last-child {
          border-bottom: none;
        }
        .time {
          width: 120px;
          font-weight: bold;
          color: #2563eb;
        }
        .subject {
          flex: 1;
          font-weight: bold;
        }
        .class {
          width: 150px;
          color: #666;
        }
        .room {
          width: 100px;
          color: #666;
        }
        .duration {
          width: 80px;
          text-align: right;
          color: #666;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .day-section { page-break-inside: avoid; }
        }
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

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${user.name.replace(/[^a-zA-Z0-9]/g, '_')}_Timetable_${new Date().toISOString().split('T')[0]}.html"`,
      },
    })
  } catch (error) {
    console.error("Teacher PDF export error:", error)
    return NextResponse.json(
      { error: "Failed to export teacher timetable" },
      { status: 500 }
    )
  }
} 