import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure the current user is an admin
    await requireRole(Role.ADMIN)

    const { id } = params
    const { role } = await request.json()

    // Validate the role
    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        teacher: true,
        student: true,
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      include: {
        teacher: {
          include: {
            subjects: {
              select: {
                id: true,
                name: true,
                classId: true,
              },
            },
          },
        },
        student: {
          include: {
            class: true,
          },
        },
      },
    })

    // If role is TEACHER and no Teacher record exists, create it
    if (role === "TEACHER" && !updatedUser.teacher) {
      await prisma.teacher.create({
        data: {
          user: { connect: { id } },
        },
      })
    }

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser
    })

  } catch (error) {
    console.error("Error updating user role:", error)
    
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 