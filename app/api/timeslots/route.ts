import { type NextRequest, NextResponse } from "next/server"
import { requireRole, requireAuth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { label, startTime, endTime, dayOfWeek } = body

    // Validate required fields
    if (!label || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Label, startTime, and endTime are required" },
        { status: 400 }
      )
    }

    // Create time slot
    const timeSlot = await prisma.timeSlot.create({
      data: {
        label,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    })

    // If dayOfWeek is provided, also create a timetable entry
    if (dayOfWeek) {
      // Get the first available class and room for demonstration
      const [firstClass, firstRoom] = await Promise.all([
        prisma.class.findFirst(),
        prisma.room.findFirst(),
      ])

      if (firstClass && firstRoom) {
        // Get or create a sample subject
        const subject = await prisma.subject.upsert({
          where: { 
            name_classId: { 
              name: "Sample Subject", 
              classId: firstClass.id 
            } 
          },
          update: {},
          create: {
            name: "Sample Subject",
            category: "Individual",
            teacherId: (await prisma.teacher.findFirst())?.id || "temp",
            classId: firstClass.id,
          },
        })

        // Create timetable entry
        await prisma.timetableEntry.create({
          data: {
            classId: firstClass.id,
            subjectId: subject.id,
            roomId: firstRoom.id,
            timeSlotId: timeSlot.id,
            dayOfWeek,
            colorCode: "#3B82F6", // Blue
          },
        })
      }
    }

    return NextResponse.json(timeSlot, { status: 201 })
  } catch (error) {
    console.error("Create time slot error:", error)
    return NextResponse.json(
      { error: "Failed to create time slot" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(timeSlots)
  } catch (error) {
    console.error("Get time slots error:", error)
    return NextResponse.json(
      { error: "Failed to fetch time slots" },
      { status: 500 }
    )
  }
} 