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
        { error: "You can only view your own timetable" },
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

    // Generate print-friendly HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${user.name} - Teaching Timetable</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 32px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0;
          color: #666;
          font-size: 16px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
        }
        .timetable-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .day-column {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .day-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 15px;
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .day-content {
          padding: 0;
        }
        .entry {
          padding: 15px;
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s;
        }
        .entry:hover {
          background-color: #f8fafc;
        }
        .entry:last-child {
          border-bottom: none;
        }
        .entry-time {
          font-weight: bold;
          color: #2563eb;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .entry-subject {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
          color: #1e293b;
        }
        .entry-class {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 3px;
        }
        .entry-room {
          color: #64748b;
          font-size: 12px;
          font-style: italic;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 2px solid #e2e8f0;
          padding-top: 20px;
        }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          transition: all 0.2s;
        }
        .print-button:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
        }
        @media print {
          .print-button { display: none; }
          body { margin: 0; padding: 10px; }
          .stats { break-inside: avoid; }
          .day-column { break-inside: avoid; }
        }
        @media (max-width: 768px) {
          .timetable-grid {
            grid-template-columns: 1fr;
          }
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">🖨️ Print Timetable</button>
      
      <div class="container">
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

        <div class="timetable-grid">
          ${['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map(day => `
            <div class="day-column">
              <div class="day-header">${day}</div>
              <div class="day-content">
                ${(entriesByDay[day] || []).map(entry => {
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
                      <div class="entry-time">${entry.timeSlot.label} (${duration.toFixed(1)}h)</div>
                      <div class="entry-subject">${entry.subject.name}</div>
                      <div class="entry-class">${entry.class.name} ${entry.class.section}</div>
                      <div class="entry-room">Room: ${entry.room.name}</div>
                    </div>
                  `
                }).join('')}
                ${(entriesByDay[day] || []).length === 0 ? '<div class="entry"><div class="entry-subject" style="color: #999; font-style: italic;">No classes</div></div>' : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p><strong>Generated by Timetable Generator System</strong></p>
          <p>This document contains confidential teaching schedule information</p>
          <p>For any questions, please contact the administration</p>
        </div>
      </div>
    </body>
    </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Teacher print view error:", error)
    return NextResponse.json(
      { error: "Failed to generate print view" },
      { status: 500 }
    )
  }
} 