import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const role = formData.get("role") as Role

    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Create or update mock user with the selected role
    const mockUserId = "mock_user_123"
    
    const user = await prisma.user.upsert({
      where: { clerkId: mockUserId },
      update: { role },
      create: {
        clerkId: mockUserId,
        email: `${role.toLowerCase()}@school.edu`,
        name: `Test ${role}`,
        role,
      },
    })

    // Redirect based on role
    let redirectUrl = "/"
    switch (role) {
      case Role.ADMIN:
        redirectUrl = "/admin/dashboard"
        break
      case Role.TEACHER:
        redirectUrl = "/teacher/timetable"
        break
      case Role.STUDENT:
        redirectUrl = "/student/timetable"
        break
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
} 