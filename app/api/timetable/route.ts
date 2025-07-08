import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const classId = searchParams.get("classId")
    const teacherId = searchParams.get("teacherId")
    const curriculum = searchParams.get("curriculum")
    const section = searchParams.get("section")

    const options: any = {}

    if (user.role === "ADMIN") {
      // Admin can view any timetable with filters
      if (classId) options.classId = classId
      if (teacherId) options.teacherId = teacherId
      if (curriculum) options.curriculum = curriculum
      if (section) options.section = section
    } else if (user.role === "TEACHER" && user.teacher) {
      // Teacher can only view their own timetable
      options.teacherId = user.teacher.id
    } else if (user.role === "STUDENT" && user.student) {
      // Student can only view their class timetable
      options.classId = user.student.classId
    }

    const entries = await getTimetable(options)

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Get timetable error:", error)
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 })
  }
}
