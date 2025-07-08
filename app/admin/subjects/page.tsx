export const dynamic = "force-dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubjectsTable } from "@/components/subjects-table"
import { CreateSubjectDialog } from "@/components/create-subject-dialog"
import { prisma } from "@/lib/prisma"

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      teacher: {
        include: {
          user: true,
        },
      },
      class: true,
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Manage subjects and their assignments</p>
        </div>
        <CreateSubjectDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>View and manage all subjects in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectsTable subjects={subjects} />
        </CardContent>
      </Card>
    </div>
  )
}
