import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RoleLayoutClient } from "./role-layout-client"
import { ReactNode } from "react"
import { Role } from "@prisma/client"

interface RoleLayoutWrapperProps {
  children: ReactNode
  requiredRole?: Role
}

export async function RoleLayoutWrapper({ children, requiredRole }: RoleLayoutWrapperProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }
  
  // Check if user has the required role (if specified)
  if (requiredRole && user.role !== requiredRole) {
    redirect("/sign-in")
  }
  
  return <RoleLayoutClient user={user}>{children}</RoleLayoutClient>
} 