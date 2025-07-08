export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GenerateTimetableForm } from "@/components/generate-timetable-form"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const stats = await Promise.all([
    prisma.class.count(),
    prisma.teacher.count(),
    prisma.subject.count(),
    prisma.room.count(),
  ])

  const [classCount, teacherCount, subjectCount, roomCount] = stats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your school's timetable system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Timetable</CardTitle>
            <CardDescription>Generate timetables for classes or teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <GenerateTimetableForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/timetable">View Timetable</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/api/export">Export Excel</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/api/print" target="_blank">
                Print Timetable
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
