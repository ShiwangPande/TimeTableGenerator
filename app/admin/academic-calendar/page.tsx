"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react"
import { SimpleYearCalendar } from "@/components/simple-year-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, BookOpen, Home, Clock, Users } from "lucide-react"

export default function AcademicCalendarPage() {

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 font-heading">Academic Calendar</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Full academic year calendar with term periods, holidays, and key dates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-6 w-6" />
                  Academic Year Calendar
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Clear overview of academic periods and holidays
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <SimpleYearCalendar className="w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats and Info */}
          <div className="space-y-8">
            {/* Academic Year Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Academic Year Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">Terms</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Holidays</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">180</div>
                  <div className="text-sm text-gray-600">School Days</div>
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
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="font-medium text-sm">Generate Timetable</div>
                  <div className="text-xs text-gray-500">Create new timetable for selected period</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="font-medium text-sm">Export Calendar</div>
                  <div className="text-xs text-gray-500">Download calendar as PDF/Excel</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="font-medium text-sm">Manage Holidays</div>
                  <div className="text-xs text-gray-500">Add or modify holiday periods</div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                  <div className="font-medium text-sm">First Term Starts</div>
                  <div className="text-xs text-gray-500">September 1, 2024</div>
                </div>
                <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                  <div className="font-medium text-sm">Christmas Break</div>
                  <div className="text-xs text-gray-500">December 20, 2024</div>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                  <div className="font-medium text-sm">Second Term Starts</div>
                  <div className="text-xs text-gray-500">January 6, 2025</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
} 