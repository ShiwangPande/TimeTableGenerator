export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// GET - List all teachers
export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const department = searchParams.get("department")
    const specialization = searchParams.get("specialization")
    
    // Build where clause
    const whereClause: any = {}
    
    if (department) {
      whereClause.department = department
    }
    
    if (specialization) {
      whereClause.specialization = specialization
    }
    
    // Get all teachers with their details
    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      include: {
        user: true,
        subjects: {
          include: {
            class: true,
            timetableEntries: {
              include: {
                room: true,
                timeSlot: true,
              },
            },
          },
        },
      },
      orderBy: [
        { user: { name: 'asc' } },
      ],
    })
    
    return NextResponse.json(teachers)
  } catch (error) {
    console.error("Get teachers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}

// POST - Create a new teacher
export async function POST(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    
    const { 
      name, 
      email, 
      department, 
      specialization
    } = body

    // Validate required fields
    if (!name || !email || !department) {
      return NextResponse.json(
        { error: "Name, email, and department are required" },
        { status: 400 }
      )
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { teacher: true },
    })

    if (existingUser) {
      // If user exists, update their role to TEACHER and create teacher record if needed
      const result = await prisma.$transaction(async (tx) => {
        // Update user role to TEACHER
        const updatedUser = await tx.user.update({
          where: { id: existingUser.id },
          data: { 
            role: Role.TEACHER,
            name: name, // Update name in case it changed
          },
        })

        // Check if teacher record already exists
        let teacher = existingUser.teacher
        
        if (!teacher) {
          // Create teacher record if it doesn't exist
          teacher = await tx.teacher.create({
            data: {
              userId: existingUser.id,
              department,
              specialization,
            },
            include: {
              user: true,
            },
          })
        } else {
          // Update existing teacher record
          teacher = await tx.teacher.update({
            where: { id: teacher.id },
            data: {
              department,
              specialization,
            },
            include: {
              user: true,
            },
          })
        }

        return teacher
      })

      return NextResponse.json(result, { status: 200 })
    }

    // Create new user and teacher in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const userData = {
        name,
        email,
        role: Role.TEACHER,
        clerkId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporary unique clerkId
      }
      
      const user = await tx.user.create({
        data: userData,
      })

      // Create the teacher
      const teacherData = {
        userId: user.id,
        department,
        specialization,
      }
      
      const teacher = await tx.teacher.create({
        data: teacherData,
        include: {
          user: true,
        },
      })

      return teacher
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Create teacher error:", error)
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    )
  }
}

// PUT - Update multiple teachers
export async function PUT(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const body = await request.json()
    const { teachers } = body

    if (!Array.isArray(teachers)) {
      return NextResponse.json(
        { error: "Teachers array is required" },
        { status: 400 }
      )
    }

    const updatedTeachers = await Promise.all(
      teachers.map(async (teacherData: any) => {
        const { id, user, ...updateData } = teacherData
        
        // Update teacher data
        const updatedTeacher = await prisma.teacher.update({
          where: { id },
          data: updateData,
          include: {
            user: true,
          },
        })

        // Update user data if provided
        if (user) {
          await prisma.user.update({
            where: { id: updatedTeacher.userId },
            data: user,
          })
        }

        return updatedTeacher
      })
    )

    return NextResponse.json(updatedTeachers)
  } catch (error) {
    console.error("Update teachers error:", error)
    return NextResponse.json(
      { error: "Failed to update teachers" },
      { status: 500 }
    )
  }
}

// DELETE - Delete multiple teachers
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)
    
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get("ids")
    const email = searchParams.get("email") // Allow deleting by email

    if (!ids && !email) {
      return NextResponse.json(
        { error: "Teacher IDs or email is required" },
        { status: 400 }
      )
    }

    if (email) {
      // Delete by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: { teacher: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }

      if (user.teacher) {
        // Delete teacher and user
        await prisma.$transaction(async (tx) => {
          await tx.teacher.delete({
            where: { id: user.teacher.id },
          })
          await tx.user.delete({
            where: { id: user.id },
          })
        })
      } else {
        // Just delete user
        await prisma.user.delete({
          where: { id: user.id },
        })
      }

      return NextResponse.json({ message: "User deleted successfully" })
    }

    // Delete by IDs (existing logic)
    const teacherIds = ids!.split(",")

    // Check if teachers have associated subjects
    const teachersWithSubjects = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
        subjects: { some: {} },
      },
    })

    if (teachersWithSubjects.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete teachers with associated subjects" },
        { status: 400 }
      )
    }

    // Delete teachers and their associated users
    const deletedTeachers = await Promise.all(
      teacherIds.map(async (teacherId) => {
        const teacher = await prisma.teacher.findUnique({
          where: { id: teacherId },
          include: { user: true },
        })

        if (!teacher) {
          throw new Error(`Teacher with id ${teacherId} not found`)
        }

        // Delete teacher and user
        await prisma.$transaction(async (tx) => {
          await tx.teacher.delete({
            where: { id: teacher.id },
          })
          await tx.user.delete({
            where: { id: teacher.userId },
          })
        })

        return teacher
      })
    )

    return NextResponse.json(deletedTeachers)
  } catch (error) {
    console.error("Delete teachers error:", error)
    return NextResponse.json(
      { error: "Failed to delete teachers" },
      { status: 500 }
    )
  }
}