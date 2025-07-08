import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { timeslotId, dayOfWeek, subjectIds, roomId } = body

    if (!timeslotId || !dayOfWeek || !subjectIds || !Array.isArray(subjectIds)) {
      return NextResponse.json(
        { error: "timeslotId, dayOfWeek, and subjectIds array are required" },
        { status: 400 }
      )
    }

    // Validate time slot exists
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeslotId },
    })

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      )
    }

    // Validate subjects exist
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      include: {
        class: true,
        teacher: true,
      },
    })

    if (subjects.length !== subjectIds.length) {
      return NextResponse.json(
        { error: "One or more subjects not found" },
        { status: 404 }
      )
    }

    // Get or create a room if not provided
    let targetRoomId = roomId
    if (!targetRoomId) {
      const defaultRoom = await prisma.room.findFirst()
      if (!defaultRoom) {
        return NextResponse.json(
          { error: "No rooms available and no roomId provided" },
          { status: 400 }
        )
      }
      targetRoomId = defaultRoom.id
    }

    // Clear existing entries for this time slot and day
    await prisma.timetableEntry.deleteMany({
      where: {
        timeSlotId: timeslotId,
        dayOfWeek,
      },
    })

    // Create new entries for each subject
    const entries = await Promise.all(
      subjects.map(async (subject) => {
        return prisma.timetableEntry.create({
          data: {
            classId: subject.classId,
            subjectId: subject.id,
            roomId: targetRoomId,
            timeSlotId: timeslotId,
            dayOfWeek,
            colorCode: getSubjectColor(subject.category),
          },
          include: {
            subject: {
              include: {
                teacher: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            room: true,
            timeSlot: true,
            class: true,
          },
        })
      })
    )

    return NextResponse.json({
      success: true,
      message: "Subjects assigned successfully",
      data: entries,
    })
  } catch (error) {
    console.error("Assign subjects error:", error)
    return NextResponse.json(
      { error: "Failed to assign subjects" },
      { status: 500 }
    )
  }
}

function getSubjectColor(category: string): string {
  switch (category) {
    case "Individual":
      return "#3B82F6" // Blue
    case "Societies":
      return "#10B981" // Green
    case "Sciences":
      return "#F59E0B" // Amber
    default:
      return "#6B7280" // Gray
  }
} 