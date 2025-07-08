export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const entries = await getTimetable({})

    // Group entries by day and time slot
    const timetableGrid: any = {}
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
    const timeSlots = [...new Set(entries.map((e) => e.timeSlot.label))].sort()

    entries.forEach((entry) => {
      const key = `${entry.dayOfWeek}-${entry.timeSlot.label}`
      if (!timetableGrid[key]) {
        timetableGrid[key] = []
      }
      timetableGrid[key].push(entry)
    })

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Timetable</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .timetable { border-collapse: collapse; width: 100%; }
        .timetable th, .timetable td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        .timetable th { background-color: #f2f2f2; }
        .entry { margin: 2px 0; padding: 2px; border-radius: 3px; font-size: 10px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>School Timetable</h1>
      <table class="timetable">
        <thead>
          <tr>
            <th>Time</th>
            ${days.map((day) => `<th>${day}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${timeSlots
            .map(
              (slot) => `
            <tr>
              <td><strong>${slot}</strong></td>
              ${days
                .map((day) => {
                  const key = `${day}-${slot}`
                  const dayEntries = timetableGrid[key] || []
                  return `<td>
                  ${dayEntries
                    .map(
                      (entry: any) => `
                    <div class="entry" style="background-color: ${entry.colorCode || "#ccc"}; color: white;">
                      ${entry.subject.name}<br>
                      ${entry.class.name} ${entry.class.section}<br>
                      ${entry.room.name}
                    </div>
                  `,
                    )
                    .join("")}
                </td>`
                })
                .join("")}
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Print error:", error)
    return NextResponse.json({ error: "Failed to generate printable timetable" }, { status: 500 })
  }
}
