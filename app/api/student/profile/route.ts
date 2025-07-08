import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(Role.STUDENT)
    const { fullName } = await request.json()
    
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Update the user's name
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: fullName.trim() },
      include: {
        student: {
          include: {
            class: true,
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
      }
    })
  } catch (error) {
    console.error("Update student profile error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
} 