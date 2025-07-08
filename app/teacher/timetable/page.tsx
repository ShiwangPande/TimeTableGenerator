import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"
import { TimetableGrid } from "@/components/timetable-grid"
import { DndProvider } from "@/components/dnd-provider"
import { SwapInstructions } from "@/components/swap-instructions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Filter, RefreshCw, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

export default async function TeacherTimetablePage() {
  await requireRole(Role.TEACHER)
  const user = await getCurrentUser()

  if (!user?.teacher) {
    return <div>Teacher profile not found</div>
  }

  const timetableEntries = await getTimetable({
    // Don't filter by teacherId - show all entries so teachers can see what to swap with
  })

  // Calculate stats (only for teacher's own entries)
  const teacherEntries = timetableEntries.filter(entry => entry.subject.teacher.user.id === user.id)
  const totalClasses = teacherEntries.length
  const uniqueSubjects = new Set(teacherEntries.map(e => e.subject.name)).size
  const uniqueClasses = new Set(teacherEntries.map(e => e.class.id)).size
  const totalHours = teacherEntries.reduce((sum, entry) => {
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

  return (
    <DndProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
            <p className="text-muted-foreground">View and manage your teaching schedule</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button asChild size="sm">
              <Link href={`/api/teacher/export/excel?teacherId=${user.teacher.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download Excel
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
              <Calendar className="h-4 w-4 text-muted-foreground" />
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

        <Card data-tour="teacher-timetable">
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>View all timetable entries. Drag your entries to request swaps with other teachers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div data-tour="swap-instructions">
              <SwapInstructions userRole="TEACHER" />
            </div>
            <div className="mt-6">
              <TimetableGrid 
                entries={timetableEntries} 
                isAdmin={false} 
                userRole={user.role}
                currentUserId={user.id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Academic Calendar
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/teacher/swaps">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Manage Swap Requests
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/api/teacher/export/excel?teacherId=${user.teacher.id}`}>
                  <Download className="mr-2 h-4 w-4" />
                  Export My Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest timetable changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  )
} 