import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(Role.STUDENT)
    
    if (!user?.student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    const classId = user.student.classId

    // Get class information with subjects and timetable entries
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        subjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        timetableEntries: {
          include: {
            subject: true,
            room: true,
            timeSlot: true,
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({
        status: "error",
        message: "Class not found",
        details: "The specified class does not exist in the system.",
        hasSubjects: false,
        hasTimetable: false,
        subjectCount: 0,
        timetableEntryCount: 0,
      })
    }

    const hasSubjects = classData.subjects.length > 0
    const hasTimetable = classData.timetableEntries.length > 0

    let status = "ready"
    let message = "Timetable is ready for export"
    let details = ""

    if (!hasSubjects) {
      status = "no_subjects"
      message = "No subjects assigned to this class"
      details = "Please contact an administrator to assign subjects to your class."
    } else if (!hasTimetable) {
      status = "no_timetable"
      message = "No timetable generated for this class"
      details = "Please contact an administrator to generate a timetable for your class."
    }

    return NextResponse.json({
      status,
      message,
      details,
      hasSubjects,
      hasTimetable,
      subjectCount: classData.subjects.length,
      timetableEntryCount: classData.timetableEntries.length,
      class: {
        id: classData.id,
        name: classData.name,
        section: classData.section,
        level: classData.level,
      },
      subjects: classData.subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        teacher: subject.teacher.user.name,
      })),
    })
  } catch (error) {
    console.error("Get timetable status error:", error)
    return NextResponse.json(
      { error: "Failed to get timetable status" },
      { status: 500 }
    )
  }
} 