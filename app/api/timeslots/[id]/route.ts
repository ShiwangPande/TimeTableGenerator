import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - Get a specific time slot by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Time slot ID is required" },
        { status: 400 }
      )
    }

    const timeSlotData = await prisma.timeSlot.findUnique({
      where: { id },
      include: {
        timetableEntries: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: {
                    user: true,
                  },
                },
                class: true,
              },
            },
            room: true,
            class: true,
          },
        },
      },
    })

    if (!timeSlotData) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(timeSlotData)
  } catch (error) {
    console.error("Get time slot error:", error)
    return NextResponse.json(
      { error: "Failed to fetch time slot" },
      { status: 500 }
    )
  }
}

// PUT - Update a specific time slot
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params
    const body = await request.json()
    const { label, startTime, endTime, dayOfWeek } = body

    if (!id) {
      return NextResponse.json(
        { error: "Time slot ID is required" },
        { status: 400 }
      )
    }

    // Check if time slot exists
    const existingTimeSlot = await prisma.timeSlot.findUnique({
      where: { id },
    })

    if (!existingTimeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (label) updateData.label = label
    if (dayOfWeek) updateData.dayOfWeek = dayOfWeek
    
    // Handle time updates
    let newStartTime = existingTimeSlot.startTime
    let newEndTime = existingTimeSlot.endTime
    
    if (startTime) {
      const start = new Date(startTime)
      if (isNaN(start.getTime())) {
        return NextResponse.json(
          { error: "Invalid start time format" },
          { status: 400 }
        )
      }
      newStartTime = start
      updateData.startTime = start
    }
    
    if (endTime) {
      const end = new Date(endTime)
      if (isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid end time format" },
          { status: 400 }
        )
      }
      newEndTime = end
      updateData.endTime = end
    }
    
    // Validate time order
    if (newEndTime <= newStartTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      )
    }

    // Check for overlapping time slots (excluding current slot)
    const overlappingTimeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: { not: id },
        dayOfWeek: dayOfWeek || existingTimeSlot.dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: newStartTime } },
              { endTime: { gt: newStartTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: newEndTime } },
              { endTime: { gte: newEndTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: newStartTime } },
              { endTime: { lte: newEndTime } },
            ],
          },
        ],
      },
    })

    if (overlappingTimeSlot) {
      return NextResponse.json(
        { 
          error: "Time slot overlaps with existing time slot",
          conflictingSlot: {
            id: overlappingTimeSlot.id,
            label: overlappingTimeSlot.label,
            startTime: overlappingTimeSlot.startTime,
            endTime: overlappingTimeSlot.endTime,
            dayOfWeek: overlappingTimeSlot.dayOfWeek,
          }
        },
        { status: 409 }
      )
    }

    // Update the time slot
    const updatedTimeSlot = await prisma.timeSlot.update({
      where: { id },
      data: updateData,
      include: {
        timetableEntries: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: {
                    user: true,
                  },
                },
                class: true,
              },
            },
            room: true,
            class: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTimeSlot)
  } catch (error) {
    console.error("Update time slot error:", error)
    return NextResponse.json(
      { error: "Failed to update time slot" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific time slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Time slot ID is required" },
        { status: 400 }
      )
    }

    // Check if time slot exists
    const existingTimeSlot = await prisma.timeSlot.findUnique({
      where: { id },
      include: {
        timetableEntries: true,
      },
    })

    if (!existingTimeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      )
    }

    // Check if time slot has associated timetable entries
    if (existingTimeSlot.timetableEntries.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete time slot with associated timetable entries",
          details: {
            timetableEntriesCount: existingTimeSlot.timetableEntries.length,
            entries: existingTimeSlot.timetableEntries.map(entry => ({
              id: entry.id,
              subject: entry.subject?.name,
              class: entry.class?.name,
            })),
          }
        },
        { status: 409 }
      )
    }

    // Delete the time slot
    await prisma.timeSlot.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Time slot deleted successfully",
      deletedTimeSlot: {
        id: existingTimeSlot.id,
        label: existingTimeSlot.label,
        dayOfWeek: existingTimeSlot.dayOfWeek,
        startTime: existingTimeSlot.startTime,
        endTime: existingTimeSlot.endTime,
      },
    })
  } catch (error) {
    console.error("Delete time slot error:", error)
    return NextResponse.json(
      { error: "Failed to delete time slot" },
      { status: 500 }
    )
  }
} 