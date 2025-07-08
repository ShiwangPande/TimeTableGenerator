export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - List all subjects
export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const classId = searchParams.get("classId")
    const teacherId = searchParams.get("teacherId")
    const category = searchParams.get("category")
    
    // Build where clause
    const whereClause: any = {}
    
    if (classId) {
      whereClause.classId = classId
    }
    
    if (teacherId) {
      whereClause.teacherId = teacherId
    }
    
    if (category) {
      whereClause.category = category
    }
    
    // Get all subjects with their details
    const subjects = await prisma.subject.findMany({
      where: whereClause,
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
          },
        },
      },
      orderBy: [
        { name: 'asc' },
        { category: 'asc' },
      ],
    })
    
    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Get subjects error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

// POST - Create a new subject
export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { name, category, multiSlotAllowed, teacherId, classId, ibGroup, level } = body

    // Validate required fields
    if (!name || !category || !teacherId || !classId || !ibGroup || !level) {
      return NextResponse.json(
        { error: "Name, category, teacherId, classId, ibGroup, and level are required" },
        { status: 400 }
      )
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    // Check if class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // Check if subject already exists for this class
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name,
        classId,
      },
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject with this name already exists in this class" },
        { status: 409 }
      )
    }

    // Create the subject
    const newSubject = await prisma.subject.create({
      data: {
        name,
        category,
        multiSlotAllowed: multiSlotAllowed || false,
        teacherId,
        classId,
        ibGroup,
        level,
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

    return NextResponse.json(newSubject, { status: 201 })
  } catch (error) {
    console.error("Create subject error:", error)
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    )
  }
}

// PUT - Update multiple subjects
export async function PUT(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { subjects } = body

    if (!Array.isArray(subjects)) {
      return NextResponse.json(
        { error: "Subjects array is required" },
        { status: 400 }
      )
    }

    const updatedSubjects = await Promise.all(
      subjects.map(async (subjectData: any) => {
        const { id, ...updateData } = subjectData
        return prisma.subject.update({
          where: { id },
          data: updateData,
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
            class: true,
          },
        })
      })
    )

    return NextResponse.json(updatedSubjects)
  } catch (error) {
    console.error("Update subjects error:", error)
    return NextResponse.json(
      { error: "Failed to update subjects" },
      { status: 500 }
    )
  }
}

// DELETE - Delete multiple subjects
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get("ids")

    if (!ids) {
      return NextResponse.json(
        { error: "Subject IDs are required" },
        { status: 400 }
      )
    }

    const idArray = ids.split(",")

    // Delete the subjects
    await prisma.subject.deleteMany({
      where: {
        id: {
          in: idArray,
        },
      },
    })

    return NextResponse.json({ message: "Subjects deleted successfully" })
  } catch (error) {
    console.error("Delete subjects error:", error)
    return NextResponse.json(
      { error: "Failed to delete subjects" },
      { status: 500 }
    )
  }
} 