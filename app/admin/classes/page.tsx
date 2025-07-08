import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClassesTable } from "@/components/classes-table"
import { CreateClassDialog } from "@/components/create-class-dialog"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"

export default async function ClassesPage() {
  // Ensure only admins can access this page
  await requireRole(Role.ADMIN)

  const classes = await prisma.class.findMany({
    include: {
      subjects: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
      },
      students: true,
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage school classes and sections</p>
        </div>
        <CreateClassDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>View and manage all classes in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassesTable classes={classes} />
        </CardContent>
      </Card>
    </div>
  )
}
