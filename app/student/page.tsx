import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTimetable } from "@/lib/timetable"
import { TimetableGrid } from "@/components/timetable-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer, Calendar, BookOpen, Clock, GraduationCap, Bell, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import { StudentTourButton } from "@/components/student-tour-button"
import { StudentProfileDialog } from "@/components/student-profile-dialog"

export default async function StudentDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your academic overview and quick actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StudentProfileDialog currentName={user?.name || ""} />
          <StudentTourButton />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="student-stats">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">6</div>
                <div className="text-sm text-blue-700">Subjects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">30</div>
                <div className="text-sm text-green-700">Classes/Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">Class 10A</div>
                <div className="text-sm text-purple-700">Current Class</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-900">85%</div>
                <div className="text-sm text-orange-700">Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Access your timetable and academic resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/student/timetable">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-200 hover:border-blue-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="font-semibold">View Timetable</div>
                          <div className="text-sm text-gray-500">See your daily schedule</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/student/academic-calendar">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-green-200 hover:border-green-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-green-600" />
                        <div>
                          <div className="font-semibold">Academic Calendar</div>
                          <div className="text-sm text-gray-500">View term dates & holidays</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/student/export">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-purple-200 hover:border-purple-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Download className="h-8 w-8 text-purple-600" />
                        <div>
                          <div className="font-semibold">Download Schedule</div>
                          <div className="text-sm text-gray-500">Export your timetable</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/student/print">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-orange-200 hover:border-orange-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Printer className="h-8 w-8 text-orange-600" />
                        <div>
                          <div className="font-semibold">Print Schedule</div>
                          <div className="text-sm text-gray-500">Print your timetable</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                <div className="font-medium text-sm">Mid-Term Exams</div>
                <div className="text-xs text-gray-500">Starting October 15</div>
              </div>
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <div className="font-medium text-sm">Sports Day</div>
                <div className="text-xs text-gray-500">November 10, 2024</div>
              </div>
              <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                <div className="font-medium text-sm">Library Week</div>
                <div className="text-xs text-gray-500">This week</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Today's Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">Mathematics</div>
                <div className="text-xs text-gray-500">9:00 AM - Room 101</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">English</div>
                <div className="text-xs text-gray-500">10:30 AM - Room 205</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">Science</div>
                <div className="text-xs text-gray-500">2:00 PM - Lab 3</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
