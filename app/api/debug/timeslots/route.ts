import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("Debug: Checking timeslots in database...")
    
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { startTime: "asc" },
    })

    console.log("Debug: Found timeslots:", timeSlots.length)
    console.log("Debug: Timeslots data:", timeSlots)

    return NextResponse.json({
      count: timeSlots.length,
      timeSlots: timeSlots,
      message: `Found ${timeSlots.length} time slots in database`
    })
  } catch (error) {
    console.error("Debug: Error fetching timeslots:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch time slots",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 