import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Role, SwapRequestStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { NotificationService } from "@/lib/notifications"

// GET - List swap requests for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get("status")
    const type = searchParams.get("type") // "sent" or "received"
    
    let whereClause: any = {}
    
    if (status) {
      whereClause.status = status as SwapRequestStatus
    }
    
    if (type === "sent") {
      whereClause.requesterId = user.id
    } else if (type === "received") {
      whereClause.targetId = user.id
    } else {
      // Show both sent and received for admins, only relevant for teachers
      if (user.role === Role.ADMIN) {
        // Admin sees all
      } else {
        whereClause.OR = [
          { requesterId: user.id },
          { targetId: user.id }
        ]
      }
    }
    
    const swapRequests = await prisma.swapRequest.findMany({
      where: whereClause,
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
      },
      orderBy: { createdAt: "desc" }
    })
    
    return NextResponse.json(swapRequests)
  } catch (error) {
    console.error("Get swap requests error:", error)
    return NextResponse.json(
      { error: "Failed to fetch swap requests" },
      { status: 500 }
    )
  }
}

// POST - Create a new swap request
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Only teachers can create swap requests
    if (user.role !== Role.TEACHER) {
      return NextResponse.json(
        { error: "Only teachers can create swap requests" },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { fromEntryId, toEntryId, reason } = body
    
    if (!fromEntryId || !toEntryId) {
      return NextResponse.json(
        { error: "fromEntryId and toEntryId are required" },
        { status: 400 }
      )
    }
    
    // Verify the entries exist
    const [fromEntry, toEntry] = await Promise.all([
      prisma.timetableEntry.findUnique({
        where: { id: fromEntryId },
        include: {
          subject: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          }
        }
      }),
      prisma.timetableEntry.findUnique({
        where: { id: toEntryId },
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
    ])
    
    if (!fromEntry || !toEntry) {
      return NextResponse.json(
        { error: "One or both timetable entries not found" },
        { status: 404 }
      )
    }
    
    // Verify the requester owns the fromEntry
    if (fromEntry.subject.teacher.user.id !== user.id) {
      return NextResponse.json(
        { error: "You can only request swaps for your own subjects" },
        { status: 403 }
      )
    }
    
    // Prevent swapping with yourself
    if (fromEntry.subject.teacher.user.id === toEntry.subject.teacher.user.id) {
      return NextResponse.json(
        { error: "You cannot swap with yourself" },
        { status: 400 }
      )
    }
    
    // Check if there's already a pending request for these entries
    const existingRequest = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          { fromEntryId, toEntryId },
          { fromEntryId: toEntryId, toEntryId: fromEntryId }
        ],
        status: SwapRequestStatus.PENDING
      }
    })
    
    if (existingRequest) {
      return NextResponse.json(
        { error: "A pending swap request already exists for these entries" },
        { status: 409 }
      )
    }
    
    // Create the swap request
    const swapRequest = await prisma.swapRequest.create({
      data: {
        requesterId: user.id,
        targetId: toEntry.subject.teacher.user.id,
        fromEntryId,
        toEntryId,
        reason: reason || null,
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
    
    // Send notification to target teacher
    await NotificationService.sendSwapRequestNotification({
      requesterEmail: user.email,
      requesterName: user.name,
      targetTeacherEmail: toEntry.subject.teacher.user.email,
      targetTeacherName: toEntry.subject.teacher.user.name,
      className: fromEntry.class.name,
      subjectName: fromEntry.subject.name,
      dayOfWeek: fromEntry.dayOfWeek,
      timeSlot: fromEntry.timeSlot.label,
      roomName: fromEntry.room.name
    })
    
    // Send confirmation to requester
    await NotificationService.sendSwapRequestConfirmation({
      requesterEmail: user.email,
      requesterName: user.name,
      targetTeacherEmail: toEntry.subject.teacher.user.email,
      targetTeacherName: toEntry.subject.teacher.user.name,
      className: fromEntry.class.name,
      subjectName: fromEntry.subject.name,
      dayOfWeek: fromEntry.dayOfWeek,
      timeSlot: fromEntry.timeSlot.label,
      roomName: fromEntry.room.name
    })
    
    return NextResponse.json(swapRequest, { status: 201 })
  } catch (error) {
    console.error("Create swap request error:", error)
    return NextResponse.json(
      { error: "Failed to create swap request" },
      { status: 500 }
    )
  }
}

// PUT - Update swap request status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { requestId, status, adminNotes } = body
    
    if (!requestId || !status) {
      return NextResponse.json(
        { error: "requestId and status are required" },
        { status: 400 }
      )
    }
    
    // Get the swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: requestId },
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
    
    if (!swapRequest) {
      return NextResponse.json(
        { error: "Swap request not found" },
        { status: 404 }
      )
    }
    
    // Check permissions
    const canUpdate = 
      user.role === Role.ADMIN || 
      swapRequest.targetId === user.id ||
      swapRequest.requesterId === user.id
    
    if (!canUpdate) {
      return NextResponse.json(
        { error: "You don't have permission to update this swap request" },
        { status: 403 }
      )
    }
    
    // Update the swap request
    const updatedRequest = await prisma.swapRequest.update({
      where: { id: requestId },
      data: {
        status: status as SwapRequestStatus,
        adminNotes: adminNotes || null
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
    
    // If approved, perform the actual swap
    if (status === SwapRequestStatus.APPROVED) {
      try {
        await prisma.$transaction([
          // Swap the subjects
          prisma.timetableEntry.update({
            where: { id: swapRequest.fromEntryId },
            data: { subjectId: swapRequest.toEntry.subjectId }
          }),
          prisma.timetableEntry.update({
            where: { id: swapRequest.toEntryId },
            data: { subjectId: swapRequest.fromEntry.subjectId }
          })
        ])
        
        console.log(`Swap approved and executed: ${swapRequest.fromEntryId} <-> ${swapRequest.toEntryId}`)
      } catch (transactionError) {
        console.error("Failed to execute swap transaction:", transactionError)
        return NextResponse.json(
          { error: "Failed to execute the swap. Please try again." },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("Update swap request error:", error)
    return NextResponse.json(
      { error: "Failed to update swap request" },
      { status: 500 }
    )
  }
} 