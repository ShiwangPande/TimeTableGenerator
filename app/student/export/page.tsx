"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import Link from "next/link"

interface TimetableStatus {
  status: string
  message: string
  details: string
  hasSubjects: boolean
  hasTimetable: boolean
  subjectCount: number
  timetableEntryCount: number
  class: {
    id: string
    name: string
    section: string
    level: string
  }
  subjects: Array<{
    id: string
    name: string
    teacher: string
  }>
}

export default function StudentExportPage() {
  const [status, setStatus] = useState<TimetableStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/student/timetable-status")
        
        if (!response.ok) {
          throw new Error("Failed to fetch timetable status")
        }

        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Error fetching status:", error)
        setError("Failed to load timetable status")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Download My Timetable</h1>
            <p className="text-muted-foreground">
              Export your class schedule in various formats
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/student/timetable">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Timetable
            </Link>
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading timetable status...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Download My Timetable</h1>
            <p className="text-muted-foreground">
              Export your class schedule in various formats
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/student/timetable">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Timetable
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Download My Timetable</h1>
            <p className="text-muted-foreground">
              Export your class schedule in various formats
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/student/timetable">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Timetable
            </Link>
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">No timetable data available</div>
        </div>
      </div>
    )
  }

  // Generic download handler
  const handleDownload = async (url: string, filename: string, fileType: string = "") => {
    setDownloadError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        setDownloadError(err.error || `Failed to download ${fileType || "file"}.`);
        return;
      }
      if (fileType === "print") {
        // For print, open a new tab with the content if successful
        const blob = await res.blob();
        const fileUrl = window.URL.createObjectURL(blob);
        window.open(fileUrl, "_blank");
        return;
      }
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (e) {
      setDownloadError(`Failed to download ${fileType || "file"}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Download My Timetable</h1>
          <p className="text-muted-foreground">
            Export your class schedule in various formats
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/student/timetable">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Timetable
          </Link>
        </Button>
      </div>

      {/* Status Alert */}
      {status.status !== "ready" && (
        <Alert variant={status.status === "error" ? "destructive" : "default"}>
          {status.status === "error" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : status.status === "no_subjects" ? (
            <Info className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="font-medium">{status.message}</div>
            <div className="text-sm mt-1">{status.details}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.timetableEntryCount}</div>
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
            <div className="text-2xl font-bold">{status.subjectCount}</div>
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
            <div className="text-2xl font-bold">{status.class.name} {status.class.section}</div>
            <p className="text-xs text-muted-foreground">
              {status.class.level}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status.hasTimetable ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {status.hasTimetable ? "Ready" : "Not Ready"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Download Options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Show download error if present */}
        {downloadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{downloadError}</AlertDescription>
          </Alert>
        )}
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
            <Button
              className="w-full"
              disabled={!status.hasTimetable}
              onClick={() => handleDownload(`/api/student/export/excel?classId=${status.class.id}`, `ClassTimetable_${status.class.id}.xlsx`, "Excel file")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Excel
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
            <Button
              className="w-full"
              disabled={!status.hasTimetable}
              onClick={() => handleDownload(`/api/student/export/pdf?classId=${status.class.id}`, `ClassTimetable_${status.class.id}.pdf`, "PDF file")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
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
            <Button
              className="w-full"
              disabled={!status.hasTimetable}
              onClick={() => handleDownload(`/api/student/export/csv?classId=${status.class.id}`, `ClassTimetable_${status.class.id}.csv`, "CSV file")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
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
              <p>• Study hours summary</p>
              <p>• Subject distribution</p>
            </div>
            <Button
              className="w-full"
              disabled={!status.hasTimetable}
              onClick={() => handleDownload(`/api/student/export/summary?classId=${status.class.id}`, `ClassTimetable_Summary_${status.class.id}.pdf`, "Summary PDF")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Summary
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
            <Button
              className="w-full"
              disabled={!status.hasTimetable}
              onClick={() => handleDownload(`/api/student/print?classId=${status.class.id}`, `ClassTimetable_Print_${status.class.id}.pdf`, "print")}
            >
              <Download className="mr-2 h-4 w-4" />
              Open Print View
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
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!status.hasTimetable}
              onClick={() => handleDownload(`/api/student/export/all?classId=${status.class.id}`, `ClassTimetable_All_${status.class.id}.zip`, "All formats")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All Formats
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