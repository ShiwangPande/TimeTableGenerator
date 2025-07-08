export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    // Find the teacher by email
    const teacher = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        },
        role: 'TEACHER'
      },
      include: {
        teacher: true
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    // Update the clerkId
    const updatedTeacher = await prisma.user.update({
      where: { id: teacher.id },
      data: { clerkId: userId },
      include: {
        teacher: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Teacher clerkId updated successfully",
      teacher: {
        id: updatedTeacher.id,
        email: updatedTeacher.email,
        name: updatedTeacher.name,
        role: updatedTeacher.role,
        clerkId: updatedTeacher.clerkId,
        hasTeacher: !!updatedTeacher.teacher
      }
    })
  } catch (error) {
    console.error("Fix teacher error:", error)
    return NextResponse.json(
      { error: "Failed to fix teacher" },
      { status: 500 }
    )
  }
} 