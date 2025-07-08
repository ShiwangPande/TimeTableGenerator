import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - List all time slots
export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const dayOfWeek = searchParams.get("dayOfWeek")
    const label = searchParams.get("label")
    
    // Build where clause
    const whereClause: any = {}
    
    if (dayOfWeek) {
      whereClause.dayOfWeek = dayOfWeek
    }
    
    if (label) {
      whereClause.label = {
        contains: label,
        mode: 'insensitive',
      }
    }
    
    // Get all time slots with their details
    const timeSlots = await prisma.timeSlot.findMany({
      where: whereClause,
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
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
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

// POST - Create a new time slot
export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { label, startTime, endTime, dayOfWeek } = body

    // Validate required fields
    if (!label || !startTime || !endTime || !dayOfWeek) {
      return NextResponse.json(
        { error: "Label, startTime, endTime, and dayOfWeek are required" },
        { status: 400 }
      )
    }

    // Validate time format
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid time format" },
        { status: 400 }
      )
    }

    // Check if end time is after start time
    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      )
    }

    // Check if time slot already exists for this day and time
    const existingTimeSlot = await prisma.timeSlot.findFirst({
      where: {
        dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } },
            ],
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    })

    if (existingTimeSlot) {
      return NextResponse.json(
        { 
          error: "Time slot overlaps with existing time slot",
          conflictingSlot: {
            id: existingTimeSlot.id,
            label: existingTimeSlot.label,
            startTime: existingTimeSlot.startTime,
            endTime: existingTimeSlot.endTime,
          }
        },
        { status: 409 }
      )
    }

    // Create the time slot
    const newTimeSlot = await prisma.timeSlot.create({
      data: {
        label,
        startTime: start,
        endTime: end,
        dayOfWeek,
      },
      include: {
        timetableEntries: {
          include: {
            subject: true,
            room: true,
            class: true,
          },
        },
      },
    })

    return NextResponse.json(newTimeSlot, { status: 201 })
  } catch (error) {
    console.error("Create time slot error:", error)
    return NextResponse.json(
      { error: "Failed to create time slot" },
      { status: 500 }
    )
  }
}

// PUT - Update multiple time slots
export async function PUT(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { timeSlots } = body

    if (!Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: "Time slots array is required" },
        { status: 400 }
      )
    }

    const updatedTimeSlots = await Promise.all(
      timeSlots.map(async (timeSlotData: any) => {
        const { id, ...updateData } = timeSlotData
        
        // Validate time format if provided
        if (updateData.startTime) {
          const start = new Date(updateData.startTime)
          if (isNaN(start.getTime())) {
            throw new Error("Invalid start time format")
          }
          updateData.startTime = start
        }
        
        if (updateData.endTime) {
          const end = new Date(updateData.endTime)
          if (isNaN(end.getTime())) {
            throw new Error("Invalid end time format")
          }
          updateData.endTime = end
        }
        
        // Validate time order if both times are provided
        if (updateData.startTime && updateData.endTime) {
          if (updateData.endTime <= updateData.startTime) {
            throw new Error("End time must be after start time")
          }
        }
        
        return prisma.timeSlot.update({
          where: { id },
          data: updateData,
          include: {
            timetableEntries: {
              include: {
                subject: true,
                room: true,
                class: true,
              },
            },
          },
        })
      })
    )

    return NextResponse.json(updatedTimeSlots)
  } catch (error) {
    console.error("Update time slots error:", error)
    return NextResponse.json(
      { error: "Failed to update time slots" },
      { status: 500 }
    )
  }
}

// DELETE - Delete multiple time slots
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get("ids")

    if (!ids) {
      return NextResponse.json(
        { error: "Time slot IDs are required" },
        { status: 400 }
      )
    }

    const timeSlotIds = ids.split(",")

    // Check if time slots have associated timetable entries
    const timeSlotsWithEntries = await prisma.timeSlot.findMany({
      where: {
        id: { in: timeSlotIds },
        timetableEntries: { some: {} },
      },
    })

    if (timeSlotsWithEntries.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete time slots with associated timetable entries",
          timeSlots: timeSlotsWithEntries.map(ts => ({ 
            id: ts.id, 
            label: ts.label,
            dayOfWeek: ts.dayOfWeek,
          }))
        },
        { status: 409 }
      )
    }

    // Delete the time slots
    const deletedTimeSlots = await prisma.timeSlot.deleteMany({
      where: {
        id: { in: timeSlotIds },
      },
    })

    return NextResponse.json({
      message: `Successfully deleted ${deletedTimeSlots.count} time slots`,
      deletedCount: deletedTimeSlots.count,
    })
  } catch (error) {
    console.error("Delete time slots error:", error)
    return NextResponse.json(
      { error: "Failed to delete time slots" },
      { status: 500 }
    )
  }
} 