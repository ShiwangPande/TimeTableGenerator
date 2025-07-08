export const dynamic = "force-dynamic";
import { RoleLayoutWrapper } from "@/components/role-layout-wrapper"
import { Role } from "@prisma/client"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayoutWrapper requiredRole={Role.ADMIN}>{children}</RoleLayoutWrapper>
}
