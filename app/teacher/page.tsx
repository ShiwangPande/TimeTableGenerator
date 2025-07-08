import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, BookOpen, ArrowRight, Bell } from "lucide-react"
import Link from "next/link"
import { TeacherTourButton } from "@/components/teacher-tour-button"
import { prisma } from "@/lib/prisma"

export default async function TeacherDashboard() {
  await requireRole(Role.TEACHER)
  const user = await getCurrentUser()

  if (!user?.teacher) {
    return <div>Teacher profile not found</div>
  }

  const timetableEntries = await getTimetable({
    teacherId: user.teacher.id,
  })

  // Calculate stats
  const totalClasses = timetableEntries.length
  const uniqueSubjects = new Set(timetableEntries.map(e => e.subject.name)).size
  const uniqueClasses = new Set(timetableEntries.map(e => e.class.id)).size
  const totalHours = timetableEntries.reduce((sum, entry) => {
    try {
      // Handle both Date objects and string formats
      const startTime = entry.timeSlot.startTime instanceof Date 
        ? entry.timeSlot.startTime 
        : new Date(entry.timeSlot.startTime)
      const endTime = entry.timeSlot.endTime instanceof Date 
        ? entry.timeSlot.endTime 
        : new Date(entry.timeSlot.endTime)
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.warn('Invalid time format for entry:', entry.id)
        return sum + 1 // Default to 1 hour if time parsing fails
      }
      
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // hours
      return sum + duration
    } catch (error) {
      console.warn('Error calculating duration for entry:', entry.id, error)
      return sum + 1 // Default to 1 hour if calculation fails
    }
  }, 0)

  // Get pending swap requests count
  const pendingSwapRequests = await prisma.swapRequest.count({
    where: {
      targetId: user.id,
      status: "PENDING"
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <TeacherTourButton />
          <Button asChild>
            <Link href="/teacher/timetable">
              View My Timetable
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Teacher Stats */}
      <div className="grid gap-4 md:grid-cols-4" data-tour="teacher-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Different subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueClasses}</div>
            <p className="text-xs text-muted-foreground">
              Different classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Teaching hours
            </p>
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
              You have {pendingSwapRequests} swap request{pendingSwapRequests > 1 ? 's' : ''} waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/teacher/swaps">
                Review Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/teacher/timetable">
                <Calendar className="mr-2 h-4 w-4" />
                View My Timetable
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/teacher/academic-calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Academic Calendar
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start relative">
              <Link href="/teacher/swaps">
                <Clock className="mr-2 h-4 w-4" />
                Manage Swap Requests
                {pendingSwapRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingSwapRequests > 9 ? '9+' : pendingSwapRequests}
                  </span>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            {timetableEntries.length > 0 ? (
              <div className="space-y-2">
                {timetableEntries.slice(0, 3).map((entry) => {
                  // Format the time values properly
                  const formatTime = (time: Date | string) => {
                    try {
                      const date = time instanceof Date ? time : new Date(time)
                      if (isNaN(date.getTime())) return 'Invalid time'
                      return date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })
                    } catch (error) {
                      return 'Invalid time'
                    }
                  }

                  const startTime = formatTime(entry.timeSlot.startTime)
                  const endTime = formatTime(entry.timeSlot.endTime)

                  return (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{entry.subject.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.class.name} • {startTime} - {endTime}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.room.name}
                      </div>
                    </div>
                  )
                })}
                {timetableEntries.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{timetableEntries.length - 3} more classes
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No classes scheduled today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
