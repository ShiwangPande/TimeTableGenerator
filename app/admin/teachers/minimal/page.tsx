export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function MinimalTeachersPage() {
  await requireRole(Role.ADMIN)

  const teachers = await prisma.teacher.findMany({
    include: {
      user: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teachers (Minimal)</h1>
        <p className="text-muted-foreground">Testing minimal components</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>View and manage all teachers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="p-4 border rounded-lg">
                <div className="font-medium">{teacher.user.name}</div>
                <div className="text-sm text-muted-foreground">{teacher.user.email}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Components</CardTitle>
          <CardDescription>Testing basic UI components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button>Test Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="secondary">Secondary Button</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 