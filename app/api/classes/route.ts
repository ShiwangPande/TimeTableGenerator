import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

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
    const existingClass = await prisma.class.findFirst({
      where: {
        name,
        section,
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