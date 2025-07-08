import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - List all classes or get distinct values
export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    const { searchParams } = new URL(request.url)
    
    // Check if we want distinct values for filters
    const distinct = searchParams.get("distinct")
    
    if (distinct === "true") {
      // Get distinct sections and curriculum levels
      const [sections, curriculumLevels] = await Promise.all([
        prisma.class.findMany({
          select: { section: true },
          distinct: ['section'],
          orderBy: { section: 'asc' },
        }),
        prisma.class.findMany({
          select: { level: true },
          distinct: ['level'],
          orderBy: { level: 'asc' },
        }),
      ])
      
      return NextResponse.json({
        sections: sections.map(s => s.section),
        curriculumLevels: curriculumLevels.map(c => c.level),
      })
    }
    
    // Get all classes with their details
    const classes = await prisma.class.findMany({
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
        students: true,
      },
      orderBy: [
        { name: 'asc' },
        { section: 'asc' },
      ],
    })
    
    return NextResponse.json(classes)
  } catch (error) {
    console.error("Get classes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

// POST - Create a new class
export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { name, level, section } = body

    // Validate required fields
    if (!name || !level || !section) {
      return NextResponse.json(
        { error: "Name, level, and section are required" },
        { status: 400 }
      )
    }

    // Check if class already exists
    const existingClass = await prisma.class.findUnique({
      where: {
        name_section: { name, section },
      },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: "Class with this name and section already exists" },
        { status: 409 }
      )
    }

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        level,
        section,
      },
      include: {
        subjects: true,
        students: true,
      },
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error("Create class error:", error)
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}

// PUT - Update multiple classes (not typically used, but included for completeness)
export async function PUT(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { classes } = body

    if (!Array.isArray(classes)) {
      return NextResponse.json(
        { error: "Classes array is required" },
        { status: 400 }
      )
    }

    const updatedClasses = await Promise.all(
      classes.map(async (classData: any) => {
        const { id, ...updateData } = classData
        return prisma.class.update({
          where: { id },
          data: updateData,
          include: {
            subjects: true,
            students: true,
          },
        })
      })
    )

    return NextResponse.json(updatedClasses)
  } catch (error) {
    console.error("Update classes error:", error)
    return NextResponse.json(
      { error: "Failed to update classes" },
      { status: 500 }
    )
  }
}

// DELETE - Delete multiple classes
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get("ids")

    if (!ids) {
      return NextResponse.json(
        { error: "Class IDs are required" },
        { status: 400 }
      )
    }

    const classIds = ids.split(",")

    // Check if classes have associated data
    const classesWithData = await prisma.class.findMany({
      where: {
        id: { in: classIds },
        OR: [
          { subjects: { some: {} } },
          { students: { some: {} } },
          { timetableEntries: { some: {} } },
        ],
      },
    })

    if (classesWithData.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete classes with associated subjects, students, or timetable entries",
          classes: classesWithData.map(c => ({ id: c.id, name: c.name, section: c.section }))
        },
        { status: 409 }
      )
    }

    // Delete the classes
    const deletedClasses = await prisma.class.deleteMany({
      where: {
        id: { in: classIds },
      },
    })

    return NextResponse.json({
      message: `Successfully deleted ${deletedClasses.count} classes`,
      deletedCount: deletedClasses.count,
    })
  } catch (error) {
    console.error("Delete classes error:", error)
    return NextResponse.json(
      { error: "Failed to delete classes" },
      { status: 500 }
    )
  }
} 