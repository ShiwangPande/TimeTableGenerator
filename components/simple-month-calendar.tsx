"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleMonthCalendarProps {
  onWeekSelect: (weekStartDate: Date) => void
  selectedWeek?: Date
  className?: string
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function SimpleMonthCalendar({ onWeekSelect, selectedWeek, className }: SimpleMonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get the start of the month
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  // Get the end of the month
  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  // Get the start of the week for a given date
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Check if a date is in the selected week
  const isInSelectedWeek = (date: Date) => {
    if (!selectedWeek) return false
    const weekStart = getWeekStart(selectedWeek)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return date >= weekStart && date <= weekEnd
  }

  // Generate calendar data for the current month
  const generateMonthCalendar = () => {
    const monthStart = getMonthStart(currentDate)
    const monthEnd = getMonthEnd(currentDate)
    const startDate = getWeekStart(monthStart)
    const endDate = new Date(monthEnd)
    
    const weeks: Date[][] = []
    let currentWeek: Date[] = []
    let date = new Date(startDate)

    while (date <= endDate) {
      currentWeek.push(new Date(date))
      
      if (date.getDay() === 6) { // Saturday
        weeks.push([...currentWeek])
        currentWeek = []
      }
      
      date.setDate(date.getDate() + 1)
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    return weeks
  }

  const weeks = generateMonthCalendar()
  const today = new Date()

  const handleDateClick = (date: Date) => {
    const weekStart = getWeekStart(date)
    onWeekSelect(weekStart)
  }

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    const weekStart = getWeekStart(new Date())
    onWeekSelect(weekStart)
  }

  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    const startStr = weekStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    const endStr = weekEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    
    return `${startStr} - ${endStr}`
  }

  return (
    <Card className={cn("w-full shadow-sm border-0 bg-white/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            Week Selector
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-7 px-2 text-xs"
          >
            Today
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center">
                <div className="text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((date, dayIndex) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const isToday = date.toDateString() === today.toDateString()
                  const isSelected = isInSelectedWeek(date)
                  
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "h-8 w-full rounded-md text-center cursor-pointer transition-all duration-200",
                        "flex items-center justify-center text-xs font-medium",
                        "hover:scale-105 hover:shadow-sm border",
                        !isCurrentMonth && "text-gray-300 bg-gray-50 border-gray-100",
                        isCurrentMonth && !isSelected && !isToday && "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                        isToday && !isSelected && "bg-green-100 border-green-300 text-green-800 ring-1 ring-green-400",
                        isSelected && "bg-blue-500 border-blue-500 text-white shadow-md",
                        isSelected && isToday && "bg-blue-600 border-blue-600 text-white shadow-lg"
                      )}
                      onClick={() => handleDateClick(date)}
                      title={date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    >
                      {date.getDate()}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Week Display */}
        {selectedWeek && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Selected Week</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-semibold text-blue-900">
                {formatWeekRange(selectedWeek)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Week of {selectedWeek.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick Legend */}
        <div className="pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 