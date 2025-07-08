export const dynamic = 'force-dynamic';
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Calendar,
  Download,
  Printer,
  Settings,
  Bell
} from "lucide-react"
import Link from "next/link"
import { BulkTimeslotEntry } from "@/components/bulk-timeslot-entry"
import { prisma } from "@/lib/prisma"
import { AdminTourButton } from "@/components/admin-tour-button"

export default async function AdminDashboard() {
  await requireRole(Role.ADMIN)

  // Get dynamic statistics from database
  const [
    classCount,
    teacherCount,
    subjectCount,
    timeSlotCount,
    timetableCount,
    roomCount,
    pendingSwapRequests
  ] = await Promise.all([
    prisma.class.count(),
    prisma.teacher.count(),
    prisma.subject.count(),
    prisma.timeSlot.count(),
    prisma.timetableEntry.count(),
    prisma.room.count(),
    prisma.swapRequest.count({
      where: { status: "PENDING" }
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage classes, subjects, teachers, and timetables
          </p>
        </div>
        <AdminTourButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Classes Management */}
        <Card data-tour="classes">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classCount}</div>
            <p className="text-xs text-muted-foreground">
              Active classes
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/admin/classes">
                  Manage Classes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Management */}
        <Card data-tour="teachers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCount}</div>
            <p className="text-xs text-muted-foreground">
              Active teachers
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/admin/teachers">
                  Manage Teachers
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Management */}
        <Card data-tour="subjects">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectCount}</div>
            <p className="text-xs text-muted-foreground">
              Available subjects
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/admin/subjects">
                  Manage Subjects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card data-tour="time-slots">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeSlotCount}</div>
            <p className="text-xs text-muted-foreground">
              Daily time slots
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/admin/timeslots">
                  Manage Time Slots
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Management */}
        <Card data-tour="timetable">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timetables</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timetableCount}</div>
            <p className="text-xs text-muted-foreground">
              Generated timetables
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/admin/timetable">
                  Manage Timetables
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Management */}
        <Card data-tour="rooms">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomCount}</div>
            <p className="text-xs text-muted-foreground">
              Available rooms
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/admin/rooms">
                  Manage Rooms
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {pendingSwapRequests > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="h-5 w-5" />
              Pending Swap Requests
            </CardTitle>
            <CardDescription className="text-orange-700">
              There are {pendingSwapRequests} swap request{pendingSwapRequests > 1 ? 's' : ''} waiting for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/admin/timetable">
                Review Requests
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild>
              <Link href="/admin/timetable/generate">
                Generate Timetable
              </Link>
            </Button>
            <BulkTimeslotEntry />
            <Button asChild>
              <Link href="/admin/users">
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 