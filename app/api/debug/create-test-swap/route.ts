export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role, SwapRequestStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Ensure the current user is an admin
    await requireRole(Role.ADMIN)

    // Get some existing timetable entries to create a swap request
    const entries = await prisma.timetableEntry.findMany({
      take: 2,
      include: {
        subject: {
          include: {
            teacher: {
              include: { user: true }
            }
          }
        }
      }
    })

    if (entries.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 timetable entries to create a swap request" },
        { status: 400 }
      )
    }

    const [entry1, entry2] = entries

    // Create a test swap request
    const swapRequest = await prisma.swapRequest.create({
      data: {
        requesterId: entry1.subject.teacher.user.id,
        targetId: entry2.subject.teacher.user.id,
        fromEntryId: entry1.id,
        toEntryId: entry2.id,
        reason: "Test swap request for notification system",
        status: SwapRequestStatus.PENDING
      },
      include: {
        requester: true,
        target: true,
        fromEntry: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: { user: true }
                }
              }
            },
            class: true,
            room: true,
            timeSlot: true
          }
        },
        toEntry: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: { user: true }
                }
              }
            },
            class: true,
            room: true,
            timeSlot: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Test swap request created successfully",
      swapRequest
    })

  } catch (error) {
    console.error("Error creating test swap request:", error)
    return NextResponse.json(
      { error: "Failed to create test swap request" },
      { status: 500 }
    )
  }
} 