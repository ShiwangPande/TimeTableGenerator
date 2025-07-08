export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(Role.STUDENT)
    
    if (!user?.student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    const timetableEntries = await getTimetable({
      classId: user.student.classId,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        student: {
          id: user.student.id,
          classId: user.student.classId,
          class: user.student.class,
        }
      },
      timetableEntries
    })
  } catch (error) {
    console.error("Get student print data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    )
  }
} 