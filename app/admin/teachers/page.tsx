export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeachersTable } from "@/components/teachers-table"
import { CreateTeacherDialog } from "@/components/create-teacher-dialog"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"

export default async function TeachersPage() {
  // Ensure only admins can access this page
  await requireRole(Role.ADMIN)

  console.log("Fetching teachers from database...")
  
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
        subjects: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    })

    console.log("Found teachers:", teachers.length)
    console.log("Teachers data:", JSON.stringify(teachers, null, 2))

    // Also check if there are any users with TEACHER role
    const teacherUsers = await prisma.user.findMany({
      where: { role: Role.TEACHER },
      include: { teacher: true }
    })
    
    console.log("Users with TEACHER role:", teacherUsers.length)
    console.log("Teacher users:", JSON.stringify(teacherUsers, null, 2))

    // Get all users to see what emails exist
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    })
    
    console.log("All users:", allUsers)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
            <p className="text-muted-foreground">Manage teaching staff</p>
          </div>
          <CreateTeacherDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Teachers ({teachers.length})</CardTitle>
            <CardDescription>View and manage all teachers in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No teachers found. Create your first teacher using the button above.</p>
                <p className="text-sm mt-2">Debug: Found {teacherUsers.length} users with TEACHER role</p>
                <p className="text-sm mt-1">Total users in system: {allUsers.length}</p>
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-blue-600">Show all users (debug)</summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    {allUsers.map(user => (
                      <div key={user.id} className="mb-1">
                        {user.email} - {user.name} ({user.role})
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <TeachersTable teachers={teachers} />
            )}
          </CardContent>
        </Card>


      </div>
    )
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
            <p className="text-muted-foreground">Manage teaching staff</p>
          </div>
          <CreateTeacherDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error Loading Teachers</CardTitle>
            <CardDescription>There was an error loading the teachers list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-600">
              <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
