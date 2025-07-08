import { RoleLayoutWrapper } from "@/components/role-layout-wrapper"
import { Role } from "@prisma/client"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayoutWrapper requiredRole={Role.STUDENT}>{children}</RoleLayoutWrapper>
}
