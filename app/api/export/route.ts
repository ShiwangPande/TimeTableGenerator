export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const entries = await getTimetable({})

    // Transform data for Excel export
    const excelData = entries.map((entry) => ({
      Day: entry.dayOfWeek,
      Time: entry.timeSlot.label,
      Class: `${entry.class.name} ${entry.class.section}`,
      Subject: entry.subject.name,
      Teacher: entry.subject.teacher.user.name,
      Room: entry.room.name,
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    XLSX.utils.book_append_sheet(wb, ws, "Timetable")

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="timetable.xlsx"',
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export timetable" }, { status: 500 })
  }
}
