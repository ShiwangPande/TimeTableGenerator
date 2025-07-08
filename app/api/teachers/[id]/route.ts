import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - Get a specific teacher by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      )
    }

    const teacherData = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        subjects: {
          include: {
            class: true,
            timetableEntries: {
              include: {
                room: true,
                timeSlot: true,
                class: true,
              },
            },
          },
        },
      },
    })

    if (!teacherData) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(teacherData)
  } catch (error) {
    console.error("Get teacher error:", error)
    return NextResponse.json(
      { error: "Failed to fetch teacher" },
      { status: 500 }
    )
  }
}

// PUT - Update a specific teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params
    const body = await request.json()
    const { 
      name,
      email, 
      department, 
      specialization, 
      maxHoursPerWeek 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      )
    }

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    // If email is being changed, check for conflicts
    if (email && email !== existingTeacher.user?.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        )
      }
    }

    // Update teacher and user in a transaction
    const updatedTeacher = await prisma.$transaction(async (tx) => {
      // Update user data if provided
      if (name || email) {
        await tx.user.update({
          where: { id: existingTeacher.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
          },
        })
      }

      // Update teacher data
      return tx.teacher.update({
        where: { id },
        data: {
          ...(department && { department }),
          ...(specialization !== undefined && { specialization }),
          ...(maxHoursPerWeek !== undefined && { maxHoursPerWeek }),
        },
        include: {
          user: true,
        },
      })
    })

    return NextResponse.json(updatedTeacher)
  } catch (error) {
    console.error("Update teacher error:", error)
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      )
    }

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        subjects: true,
      },
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    // Check if teacher has associated subjects
    if (existingTeacher.subjects.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete teacher with associated subjects",
          details: {
            subjectsCount: existingTeacher.subjects.length,
            subjects: existingTeacher.subjects.map(s => ({ id: s.id, name: s.name })),
          }
        },
        { status: 409 }
      )
    }

    // Delete teacher and associated user in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the teacher
      await tx.teacher.delete({
        where: { id },
      })

      // Delete the associated user
      await tx.user.delete({
        where: { id: existingTeacher.userId },
      })
    })

    return NextResponse.json({
      message: "Teacher deleted successfully",
      deletedTeacher: {
        id: existingTeacher.id,
        name: `${existingTeacher.user?.firstName} ${existingTeacher.user?.lastName}`,
        email: existingTeacher.user?.email,
      },
    })
  } catch (error) {
    console.error("Delete teacher error:", error)
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    )
  }
}

// PATCH - Update a specific teacher (alias for PUT)
export const PATCH = PUT; 