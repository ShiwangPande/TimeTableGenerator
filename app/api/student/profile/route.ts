export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(Role.STUDENT)
    const { fullName, classId } = await request.json()
    
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = { name: fullName.trim() }

    // If classId is provided, update the student's class
    if (classId && typeof classId === 'string') {
      await prisma.student.update({
        where: { userId: user.id },
        data: { classId },
      })
    }

    // Update the user's name
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: {
        student: {
          include: {
            class: {
              include: {
                subjects: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        student: updatedUser.student,
      }
    })
  } catch (error) {
    console.error("Update student profile error:", error)
    // Improved error response for debugging
    let message = "Failed to update profile"
    if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
      message += ": " + error.message
      if (error.stack) message += "\n" + error.stack
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
} 