"use client"

import { useState, useEffect } from "react"
import { SimpleYearCalendar } from "@/components/simple-year-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, BookOpen, Clock, Users, Bell, GraduationCap } from "lucide-react"

interface StudentData {
  subjects: number
  classesPerWeek: number
  currentClass: string
}

interface ImportantDate {
  name: string
  date: string
  color: string
}

export default function StudentAcademicCalendarPage() {
  const [studentData, setStudentData] = useState<StudentData>({
    subjects: 0,
    classesPerWeek: 0,
    currentClass: "Loading..."
  })
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student's class and subject data
        const response = await fetch('/api/student/data')
        if (response.ok) {
          const data = await response.json()
          setStudentData(data)
        }
      } catch (error) {
        console.error('Failed to fetch student data:', error)
        // Set fallback data
        setStudentData({
          subjects: 6,
          classesPerWeek: 30,
          currentClass: "Class 10A"
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchImportantDates = async () => {
      try {
        // Fetch academic periods that are marked as important
        const response = await fetch('/api/academic-periods')
        if (response.ok) {
          const periods = await response.json()
          const examPeriods = periods.filter((p: any) => p.type === 'EXAM')
          const dates = examPeriods.map((period: any) => ({
            name: period.name,
            date: `${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`,
            color: 'border-red-500 bg-red-50'
          }))
          setImportantDates(dates)
        }
      } catch (error) {
        console.error('Failed to fetch important dates:', error)
        // Set fallback dates
        setImportantDates([
          { name: "Mid-Term Exams", date: "October 15-20, 2024", color: "border-red-500 bg-red-50" },
          { name: "Sports Day", date: "November 10, 2024", color: "border-blue-500 bg-blue-50" },
          { name: "Annual Day", date: "December 25, 2024", color: "border-green-500 bg-green-50" },
          { name: "Final Exams", date: "March 1-15, 2025", color: "border-orange-500 bg-orange-50" }
        ])
      }
    }

    fetchStudentData()
    fetchImportantDates()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground">
          View academic year calendar, your class schedule, and important dates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2" data-tour="academic-calendar">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                Academic Year Calendar
              </CardTitle>
              <CardDescription className="text-purple-100">
                Clear overview of academic periods and holidays
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <SimpleYearCalendar className="w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Student-specific Info */}
        <div className="space-y-6">
          {/* My Class Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                My Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{studentData.subjects}</div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{studentData.classesPerWeek}</div>
                  <div className="text-sm text-gray-600">Classes/Week</div>
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{studentData.currentClass}</div>
                <div className="text-sm text-gray-600">Current Class</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="font-medium text-sm">View My Timetable</div>
                <div className="text-xs text-gray-500">See your daily schedule</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="font-medium text-sm">Download Schedule</div>
                <div className="text-xs text-gray-500">Export your timetable</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="font-medium text-sm">Print Schedule</div>
                <div className="text-xs text-gray-500">Print your timetable</div>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {importantDates.length > 0 ? (
                importantDates.map((date, index) => (
                  <div key={index} className={`p-3 border-l-4 ${date.color} rounded-r-lg`}>
                    <div className="font-medium text-sm">{date.name}</div>
                    <div className="text-xs text-gray-500">{date.date}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No important dates found</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 