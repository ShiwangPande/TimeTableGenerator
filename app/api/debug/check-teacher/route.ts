import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    // Check for user with exact email
    const exactUser = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: true,
        student: true,
      }
    })

    // Check for user with case-insensitive email
    const caseInsensitiveUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
      include: {
        teacher: true,
        student: true,
      }
    })

    // Get all users for comparison
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clerkId: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      searchEmail: email,
      exactMatch: exactUser ? {
        id: exactUser.id,
        email: exactUser.email,
        name: exactUser.name,
        role: exactUser.role,
        clerkId: exactUser.clerkId,
        hasTeacher: !!exactUser.teacher,
        hasStudent: !!exactUser.student,
      } : null,
      caseInsensitiveMatch: caseInsensitiveUser ? {
        id: caseInsensitiveUser.id,
        email: caseInsensitiveUser.email,
        name: caseInsensitiveUser.name,
        role: caseInsensitiveUser.role,
        clerkId: caseInsensitiveUser.clerkId,
        hasTeacher: !!caseInsensitiveUser.teacher,
        hasStudent: !!caseInsensitiveUser.student,
      } : null,
      allUsers: allUsers.slice(0, 10), // Show last 10 users
      totalUsers: allUsers.length
    })
  } catch (error) {
    console.error("Check teacher error:", error)
    return NextResponse.json(
      { error: "Failed to check teacher" },
      { status: 500 }
    )
  }
} 