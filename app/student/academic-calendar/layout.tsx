import type React from "react"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function StudentAcademicCalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireRole(Role.STUDENT)
  } catch {
    redirect("/")
  }

  return <>{children}</>
} 