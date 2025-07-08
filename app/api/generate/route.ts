export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { generateTimetable } from "@/lib/timetable"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)

    const body = await request.json()
    const { classId, teacherId } = body

    const result = await generateTimetable({ classId, teacherId })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Generate timetable error:", error)
    return NextResponse.json({ error: "Failed to generate timetable" }, { status: 500 })
  }
}
