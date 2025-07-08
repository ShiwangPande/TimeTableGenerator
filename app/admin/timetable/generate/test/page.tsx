import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function TestGeneratePage() {
  await requireRole(Role.ADMIN)

  // Test data counts
  const [classCount, teacherCount, subjectCount, timeSlotCount, roomCount] = await Promise.all([
    prisma.class.count(),
    prisma.teacher.count(),
    prisma.subject.count(),
    prisma.timeSlot.count(),
    prisma.room.count()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Generate Timetable</h1>
        <p className="text-muted-foreground">
          Test the timetable generation functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current data counts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{classCount}</div>
              <div className="text-sm text-muted-foreground">Classes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{teacherCount}</div>
              <div className="text-sm text-muted-foreground">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{subjectCount}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeSlotCount}</div>
              <div className="text-sm text-muted-foreground">Time Slots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{roomCount}</div>
              <div className="text-sm text-muted-foreground">Rooms</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Generate</CardTitle>
          <CardDescription>
            Test the generate API endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/generate" method="POST">
            <Button type="submit" className="w-full">
              Generate Timetable for All Classes
            </Button>
          </form>
        </CardContent>
      </Card>

      {classCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">No Classes Found</CardTitle>
            <CardDescription className="text-yellow-700">
              You need to create classes first before generating timetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/admin/classes">Create Classes</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {subjectCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">No Subjects Found</CardTitle>
            <CardDescription className="text-yellow-700">
              You need to create subjects first before generating timetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/admin/subjects">Create Subjects</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {timeSlotCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">No Time Slots Found</CardTitle>
            <CardDescription className="text-yellow-700">
              You need to create time slots first before generating timetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/admin/timeslots">Create Time Slots</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {roomCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">No Rooms Found</CardTitle>
            <CardDescription className="text-yellow-700">
              You need to create rooms first before generating timetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/admin/rooms">Create Rooms</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 