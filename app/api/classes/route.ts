export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAuth() // Only require authentication, not a specific role
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
    const classesRaw = await prisma.class.findMany({
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

    // Filter out subjects with missing teacher or missing teacher.user
    const classes = classesRaw.map(cls => ({
      ...cls,
      subjects: cls.subjects.filter(subj => subj.teacher && subj.teacher.user),
    }))

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Get classes error:", error)
    // Improved error response for debugging
    let message = "Failed to fetch classes"
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