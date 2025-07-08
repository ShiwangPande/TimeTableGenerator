"use client"

import { useState } from "react"
import { SimpleYearCalendar } from "@/components/simple-year-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, BookOpen, Clock, Users, Bell } from "lucide-react"

export default function TeacherAcademicCalendarPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground">
          View academic year calendar, your schedule, and upcoming events
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                Academic Year Calendar
              </CardTitle>
              <CardDescription className="text-green-100">
                Clear overview of academic periods and holidays
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <SimpleYearCalendar className="w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Teacher-specific Info */}
        <div className="space-y-6">
          {/* My Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                My Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">24</div>
                  <div className="text-sm text-gray-600">Classes/Week</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600">Teaching Hours/Day</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="font-medium text-sm">View My Timetable</div>
                <div className="text-xs text-gray-500">See your current schedule</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="font-medium text-sm">Request Swap</div>
                <div className="text-xs text-gray-500">Request time slot exchange</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="font-medium text-sm">Download Schedule</div>
                <div className="text-xs text-gray-500">Export your timetable</div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <div className="font-medium text-sm">Staff Meeting</div>
                <div className="text-xs text-gray-500">Tomorrow at 3:00 PM</div>
              </div>
              <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                <div className="font-medium text-sm">Exam Week</div>
                <div className="text-xs text-gray-500">Next week - prepare materials</div>
              </div>
              <div className="p-3 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg">
                <div className="font-medium text-sm">Parent-Teacher Day</div>
                <div className="text-xs text-gray-500">December 15, 2024</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 