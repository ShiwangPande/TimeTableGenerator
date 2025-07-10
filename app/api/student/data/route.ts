export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const { id } = await requireAuth()
    const student = await prisma.student.findUnique({
      where: { userId: id },
      include: {
        class: {
          include: {
            subjects: true
          }
        }
      }
    })
    if (!student || !student.class) {
      return NextResponse.json(
        { error: "Student or class not found" },
        { status: 404 }
      )
    }
    const timeSlotsCount = await prisma.timeSlot.count()
    const classesPerWeek = 5 * timeSlotsCount
    return NextResponse.json({
      subjects: student.class.subjects.length,
      classesPerWeek: classesPerWeek,
      currentClass: `${student.class.name}${student.class.section}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student data", details: error?.message || String(error) },
      { status: 500 }
    )
  }
} 