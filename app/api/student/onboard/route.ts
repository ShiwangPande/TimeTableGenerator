import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(Role.STUDENT)
    if (user.student) {
      return NextResponse.json({ error: "Student profile already exists" }, { status: 400 })
    }
    const { classId } = await request.json()
    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 })
    }
    // Create student profile
    await prisma.student.create({
      data: {
        userId: user.id,
        classId,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Student onboarding error:", error)
    return NextResponse.json({ error: "Failed to create student profile" }, { status: 500 })
  }
} 