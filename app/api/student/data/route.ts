export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const { userId } = await requireAuth()
    console.log('Student Data API: userId', userId)
    // Get student data
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        class: {
          include: {
            subjects: true
          }
        }
      }
    })
    console.log('Student Data API: student', student)
    if (!student || !student.class) {
      console.log('Student Data API: student or class not found', student)
      return NextResponse.json(
        { error: "Student or class not found" },
        { status: 404 }
      )
    }
    // Calculate classes per week (assuming 5 days × number of time slots)
    const timeSlotsCount = await prisma.timeSlot.count()
    const classesPerWeek = 5 * timeSlotsCount
    return NextResponse.json({
      subjects: student.class.subjects.length,
      classesPerWeek: classesPerWeek,
      currentClass: `${student.class.name}${student.class.section}`,
    })
  } catch (error) {
    console.error("Get student data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch student data", details: error?.message || String(error) },
      { status: 500 }
    )
  }
} 