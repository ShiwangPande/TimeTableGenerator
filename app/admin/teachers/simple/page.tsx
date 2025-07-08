import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"

export default async function SimpleTeachersPage() {
  await requireRole(Role.ADMIN)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Simple Teachers Test</h1>
      <p>This is a simple test page to check for context errors.</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p>If you can see this, the basic page is working.</p>
      </div>
    </div>
  )
} 