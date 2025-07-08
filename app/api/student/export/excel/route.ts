export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getTimetable } from "@/lib/timetable"
import { prisma } from "@/lib/prisma"
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
      // Check if the class exists and has subjects
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          subjects: true,
          timetableEntries: true,
        },
      })

      if (!classData) {
        return NextResponse.json({ 
          error: "Class not found",
          details: "The specified class does not exist in the system."
        }, { status: 404 })
      }

      if (classData.subjects.length === 0) {
        return NextResponse.json({ 
          error: "No subjects assigned to this class",
          details: "Please contact an administrator to assign subjects to your class."
        }, { status: 404 })
      }

      if (classData.timetableEntries.length === 0) {
        return NextResponse.json({ 
          error: "No timetable generated for this class",
          details: "Please contact an administrator to generate a timetable for your class."
        }, { status: 404 })
      }

      return NextResponse.json({ 
        error: "No timetable entries found for this class",
        details: "There are no timetable entries available for export."
      }, { status: 404 })
    }
    const excelData = entries.map((entry) => ({
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
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)
    ws['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
    ]
    XLSX.utils.book_append_sheet(wb, ws, "Timetable")
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    const filename = `ClassTimetable_${classId}_${new Date().toISOString().split('T')[0]}.xlsx`
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Student Excel export error:", error)
    return NextResponse.json({ error: "Failed to export class timetable" }, { status: 500 })
  }
} 