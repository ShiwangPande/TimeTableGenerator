"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleCalendarProps {
  className?: string
}

export function SimpleCalendar({ className }: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
  const today = new Date()
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }
  
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }
  
  const isCurrentMonth = (day: number) => {
    return day > 0 && day <= daysInMonth
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center">
            <div className="text-xs font-medium text-gray-500 h-6 flex items-center justify-center">
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="h-6"></div>
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          return (
            <div
              key={day}
              className={cn(
                "h-6 w-6 rounded text-center cursor-pointer transition-colors",
                "flex items-center justify-center text-xs font-medium",
                "hover:bg-blue-100 hover:text-blue-700",
                isToday(day) && "bg-blue-600 text-white hover:bg-blue-700",
                isCurrentMonth(day) && !isToday(day) && "text-gray-700",
                !isCurrentMonth(day) && "text-gray-300"
              )}
              title={`${monthNames[currentMonth]} ${day}, ${currentYear}`}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Quick Info */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  )
} 