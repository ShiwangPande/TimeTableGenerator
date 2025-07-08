export const dynamic = "force-dynamic";
import type React from "react"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function TeacherAcademicCalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireRole(Role.TEACHER)
  } catch {
    redirect("/")
  }

  return <>{children}</>
} 