import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTimetable } from "@/lib/timetable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, BookOpen, Users, User } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { useState } from "react"
import { TimetableGrid } from "@/components/timetable-grid"
import { StudentProfileDialog } from "@/components/student-profile-dialog"

export default async function StudentTimetablePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  if (!user?.student) {
    // Fetch all classes for selection
    const classes = await prisma.class.findMany({
      select: { id: true, name: true, section: true, level: true },
      orderBy: [{ level: "asc" }, { name: "asc" }, { section: "asc" }],
    })

    async function handleAssignClass(formData: FormData) {
      "use server"
      const classId = formData.get("classId") as string
      const fullName = formData.get("fullName") as string
      
      if (!classId || !fullName) return
      
      // Update user name and create student profile in a transaction
      await prisma.$transaction(async (tx) => {
        // Update the user's name
        await tx.user.update({
          where: { id: user.id },
          data: { name: fullName.trim() }
        })
        
        // Create student profile
        await tx.student.create({
          data: {
            userId: user.id,
            classId,
          },
        })
      })
      
      revalidatePath("/student/timetable")
      redirect("/student/timetable")
    }

    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Student Profile</h2>
        <p className="mb-6 text-muted-foreground text-center">Please provide your full name and select your class to access your timetable.</p>
        <form action={handleAssignClass} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              defaultValue={user?.name || ""}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="classId" className="text-sm font-medium text-gray-700">
              Select Your Class
            </label>
            <select 
              name="classId" 
              id="classId"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose your class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.section} ({cls.level})
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white rounded-md py-3 font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Complete Profile
          </button>
        </form>
      </div>
    )
  }

  // Defensive: Only fetch timetable if user.student exists
  let timetableEntries = []
  if (user?.student) {
    timetableEntries = await getTimetable({
      classId: user.student.classId,
    })
  }

  // Calculate dynamic statistics
  const totalClasses = timetableEntries.length
  const uniqueSubjects = new Set(timetableEntries.map(e => e.subject.name)).size
  const totalHours = timetableEntries.length * 1 // Assuming 1 hour per class, adjust as needed

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
          <p className="text-muted-foreground">
            View your class schedule and manage your timetable.
          </p>
        </div>
        <StudentProfileDialog currentName={user?.name || ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="student-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">
              Hours per week
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
            <CardTitle className="text-sm font-medium">Class</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.student.class.name} {user.student.class.section}
            </div>
            <p className="text-xs text-muted-foreground">
              Your class
            </p>
          </CardContent>
        </Card>
      </div>

      <Card data-tour="student-timetable">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Your class timetable for the week</CardDescription>
        </CardHeader>
        <CardContent>
          {user?.student ? (
            <TimetableGrid
              entries={timetableEntries}
              userRole="STUDENT"
              currentUserId={user.id}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Please select your class to view your timetable.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 