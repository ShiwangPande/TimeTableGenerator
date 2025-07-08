export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - Get a specific subject by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      )
    }

    const subjectData = await prisma.subject.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        class: true,
        timetableEntries: {
          include: {
            room: true,
            timeSlot: true,
            class: true,
          },
        },
      },
    })

    if (!subjectData) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(subjectData)
  } catch (error) {
    console.error("Get subject error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 }
    )
  }
}

// PUT - Update a specific subject
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params
    const body = await request.json()
    const { name, category, multiSlotAllowed, teacherId, classId } = body

    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      )
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    })

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      )
    }

    // If name or classId is being changed, check for conflicts
    if ((name && name !== existingSubject.name) || (classId && classId !== existingSubject.classId)) {
      const conflictingSubject = await prisma.subject.findFirst({
        where: {
          name: name || existingSubject.name,
          classId: classId || existingSubject.classId,
        },
      })

      if (conflictingSubject && conflictingSubject.id !== id) {
        return NextResponse.json(
          { error: "Subject with this name already exists in this class" },
          { status: 409 }
        )
      }
    }

    // If teacherId is being changed, check if teacher exists
    if (teacherId && teacherId !== existingSubject.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
      })

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        )
      }
    }

    // If classId is being changed, check if class exists
    if (classId && classId !== existingSubject.classId) {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
      })

      if (!classData) {
        return NextResponse.json(
          { error: "Class not found" },
          { status: 404 }
        )
      }
    }

    // Update the subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(typeof multiSlotAllowed === 'boolean' && { multiSlotAllowed }),
        ...(teacherId && { teacherId }),
        ...(classId && { classId }),
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        class: true,
      },
    })

    return NextResponse.json(updatedSubject)
  } catch (error) {
    console.error("Update subject error:", error)
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific subject
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      )
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        timetableEntries: true,
      },
    })

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      )
    }

    // Check if subject has associated timetable entries
    if (existingSubject.timetableEntries.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete subject with associated timetable entries",
          details: {
            timetableEntriesCount: existingSubject.timetableEntries.length,
          }
        },
        { status: 409 }
      )
    }

    // Delete the subject
    await prisma.subject.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Subject deleted successfully",
      deletedSubject: {
        id: existingSubject.id,
        name: existingSubject.name,
        category: existingSubject.category,
      },
    })
  } catch (error) {
    console.error("Delete subject error:", error)
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    )
  }
} 