export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - Get a specific class by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      )
    }

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        students: {
          include: {
            user: true,
          },
        },
        timetableEntries: {
          include: {
            subject: true,
            room: true,
            timeSlot: true,
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(classData)
  } catch (error) {
    console.error("Get class error:", error)
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    )
  }
}

// PUT - Update a specific class
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params
    const body = await request.json()
    const { name, level, section } = body

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      )
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // If name or section is being changed, check for conflicts
    if ((name && name !== existingClass.name) || (section && section !== existingClass.section)) {
      const conflictingClass = await prisma.class.findUnique({
        where: {
          name_section: { 
            name: name || existingClass.name, 
            section: section || existingClass.section 
          },
        },
      })

      if (conflictingClass && conflictingClass.id !== id) {
        return NextResponse.json(
          { error: "Class with this name and section already exists" },
          { status: 409 }
        )
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(level && { level }),
        ...(section && { section }),
      },
      include: {
        subjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        students: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error("Update class error:", error)
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(Role.ADMIN)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      )
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        subjects: true,
        students: true,
        timetableEntries: true,
      },
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // Check if class has associated data
    if (existingClass.subjects.length > 0 || existingClass.students.length > 0 || existingClass.timetableEntries.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete class with associated subjects, students, or timetable entries",
          details: {
            subjectsCount: existingClass.subjects.length,
            studentsCount: existingClass.students.length,
            timetableEntriesCount: existingClass.timetableEntries.length,
          }
        },
        { status: 409 }
      )
    }

    // Delete the class
    await prisma.class.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Class deleted successfully",
      deletedClass: {
        id: existingClass.id,
        name: existingClass.name,
        section: existingClass.section,
      },
    })
  } catch (error) {
    console.error("Delete class error:", error)
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    )
  }
} 