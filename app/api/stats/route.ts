export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await requireRole(Role.ADMIN)
    
    const [timeSlotsCount, roomsCount, subjectsCount, classesCount] = await Promise.all([
      prisma.timeSlot.count(),
      prisma.room.count(),
      prisma.subject.count(),
      prisma.class.count(),
    ])

    return NextResponse.json({
      timeSlots: timeSlotsCount,
      rooms: roomsCount,
      subjects: subjectsCount,
      classes: classesCount,
      days: 5, // Fixed number of weekdays
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
} 