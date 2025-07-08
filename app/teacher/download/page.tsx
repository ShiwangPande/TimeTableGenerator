import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"
import { getTimetable } from "@/lib/timetable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default async function TeacherDownloadPage() {
  await requireRole(Role.TEACHER)
  const user = await getCurrentUser()

  if (!user?.teacher) {
    return <div>Teacher profile not found</div>
  }

  // Get teacher's timetable entries
  const timetableEntries = await getTimetable({
    teacherId: user.teacher.id,
  })

  // Calculate stats
  const totalClasses = timetableEntries.length
  const uniqueSubjects = new Set(timetableEntries.map(e => e.subject.name)).size
  const uniqueClasses = new Set(timetableEntries.map(e => e.class.id)).size
  const totalHours = timetableEntries.reduce((sum, entry) => {
    try {
      const startTime = entry.timeSlot.startTime instanceof Date 
        ? entry.timeSlot.startTime 
        : new Date(entry.timeSlot.startTime)
      const endTime = entry.timeSlot.endTime instanceof Date 
        ? entry.timeSlot.endTime 
        : new Date(entry.timeSlot.endTime)
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return sum + 1
      }
      
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      return sum + duration
    } catch (error) {
      return sum + 1
    }
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Download My Timetable</h1>
          <p className="text-muted-foreground">
            Export your teaching schedule in various formats
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/teacher">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
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

      {/* Download Options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Excel Export */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Excel Format
            </CardTitle>
            <CardDescription>
              Download your timetable as an Excel spreadsheet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Complete timetable data</p>
              <p>• Sortable columns</p>
              <p>• Easy to edit and share</p>
            </div>
            <Button asChild className="w-full">
              <Link href={`/api/teacher/export/excel?teacherId=${user.teacher.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download Excel
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* PDF Export */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              PDF Format
            </CardTitle>
            <CardDescription>
              Download your timetable as a printable PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Print-ready format</p>
              <p>• Professional layout</p>
              <p>• Easy to share</p>
            </div>
            <Button asChild className="w-full">
              <Link href={`/api/teacher/export/pdf?teacherId=${user.teacher.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* CSV Export */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              CSV Format
            </CardTitle>
            <CardDescription>
              Download your timetable as a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Simple text format</p>
              <p>• Import to other apps</p>
              <p>• Lightweight file</p>
            </div>
            <Button asChild className="w-full">
              <Link href={`/api/teacher/export/csv?teacherId=${user.teacher.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Weekly Summary
            </CardTitle>
            <CardDescription>
              Get a summary of your weekly schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Weekly overview</p>
              <p>• Teaching hours summary</p>
              <p>• Class distribution</p>
            </div>
            <Button asChild className="w-full">
              <Link href={`/api/teacher/export/summary?teacherId=${user.teacher.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download Summary
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Print View */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Print View
            </CardTitle>
            <CardDescription>
              Open a print-friendly version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Print-optimized layout</p>
              <p>• Clean formatting</p>
              <p>• No ads or clutter</p>
            </div>
            <Button asChild className="w-full">
              <Link href={`/api/teacher/print?teacherId=${user.teacher.id}`} target="_blank">
                <Download className="mr-2 h-4 w-4" />
                Open Print View
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* All Formats */}
        <Card className="hover:shadow-md transition-shadow border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Download All
            </CardTitle>
            <CardDescription>
              Download your timetable in all formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Excel, PDF, and CSV</p>
              <p>• Weekly summary</p>
              <p>• Complete package</p>
            </div>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href={`/api/teacher/export/all?teacherId=${user.teacher.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download All Formats
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads</CardTitle>
          <CardDescription>
            Your recently downloaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Download className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No recent downloads</p>
            <p className="text-sm">Your download history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 