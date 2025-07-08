export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const rooms = await prisma.room.findMany({
      orderBy: { name: "asc" },
    })
    
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Get rooms error:", error)
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    )
  }
} 