export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const weekStart = searchParams.get("weekStart")
    const classId = searchParams.get("classId")
    const teacherId = searchParams.get("teacherId")
    const curriculum = searchParams.get("curriculum")
    const section = searchParams.get("section")

    if (!weekStart) {
      return NextResponse.json(
        { error: "Week start date is required" },
        { status: 400 }
      )
    }

    // Parse the week start date
    const weekStartDate = new Date(weekStart)
    if (isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid week start date format" },
        { status: 400 }
      )
    }

    // Calculate week end date (7 days later)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekEndDate.getDate() + 6)

    const options: any = {
      weekStart: weekStartDate,
      weekEnd: weekEndDate,
    }

    if (user.role === "ADMIN") {
      // Admin can view any timetable with filters
      if (classId) options.classId = classId
      if (teacherId) options.teacherId = teacherId
      if (curriculum) options.curriculum = curriculum
      if (section) options.section = section
    } else if (user.role === "TEACHER") {
      // Teachers can only view their own timetable
      options.teacherId = user.teacherId
    } else if (user.role === "STUDENT") {
      // Students can only view their class timetable
      options.studentId = user.studentId
    }

    const timetable = await getTimetable(options)

    return NextResponse.json({
      weekStart: weekStartDate.toISOString(),
      weekEnd: weekEndDate.toISOString(),
      timetable,
    })
  } catch (error) {
    console.error("Get week timetable error:", error)
    return NextResponse.json(
      { error: "Failed to fetch week timetable" },
      { status: 500 }
    )
  }
} 