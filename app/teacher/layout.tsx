import { RoleLayoutWrapper } from "@/components/role-layout-wrapper"
import { Role } from "@prisma/client"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayoutWrapper requiredRole={Role.TEACHER}>{children}</RoleLayoutWrapper>
}
