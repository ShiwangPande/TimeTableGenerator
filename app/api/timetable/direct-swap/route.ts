import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { fromId, toId } = body

    if (!fromId || !toId) {
      return NextResponse.json(
        { error: "fromId and toId are required" },
        { status: 400 }
      )
    }

    // Get both entries with full details
    const [fromEntry, toEntry] = await Promise.all([
      prisma.timetableEntry.findUnique({
        where: { id: fromId },
        include: {
          subject: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          },
          room: true,
          timeSlot: true,
          class: true,
        },
      }),
      prisma.timetableEntry.findUnique({
        where: { id: toId },
        include: {
          subject: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          },
          room: true,
          timeSlot: true,
          class: true,
        },
      }),
    ])

    if (!fromEntry || !toEntry) {
      return NextResponse.json(
        { error: "One or both timetable entries not found" },
        { status: 404 }
      )
    }

    // Perform the swap using a transaction
    const [updatedFromEntry, updatedToEntry] = await prisma.$transaction([
      // Swap the subjects between entries
      prisma.timetableEntry.update({
        where: { id: fromId },
        data: { subjectId: toEntry.subjectId },
        include: {
          subject: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          },
          room: true,
          timeSlot: true,
          class: true,
        },
      }),
      prisma.timetableEntry.update({
        where: { id: toId },
        data: { subjectId: fromEntry.subjectId },
        include: {
          subject: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          },
          room: true,
          timeSlot: true,
          class: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "Timetable entries swapped successfully",
      data: {
        fromEntry: updatedFromEntry,
        toEntry: updatedToEntry,
      },
    })
  } catch (error) {
    console.error("Direct swap error:", error)
    return NextResponse.json(
      { error: "Failed to swap timetable entries" },
      { status: 500 }
    )
  }
} 