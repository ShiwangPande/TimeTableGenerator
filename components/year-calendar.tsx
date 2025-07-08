"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Sun, GraduationCap, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface YearCalendarProps {
  onWeekSelect: (weekStartDate: Date) => void
  selectedWeek?: Date
  className?: string
  compact?: boolean
}

interface AcademicPeriod {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  description?: string
  colorCode: string
  isActive: boolean
}

interface TermHoliday {
  name: string
  startDate: Date
  endDate: Date
  type: "term" | "holiday"
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  icon: React.ReactNode
}

const TERMS_AND_HOLIDAYS: TermHoliday[] = [
  {
    name: "First Term",
    startDate: new Date(2024, 8, 2),
    endDate: new Date(2024, 11, 20),
    type: "term",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    icon: <BookOpen className="h-4 w-4" />
  },
  
  {
    name: "Winter Break",
    startDate: new Date(2024, 11, 21),
    endDate: new Date(2025, 0, 5),
    type: "holiday",
    color: "bg-gradient-to-r from-red-500 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    icon: <Home className="h-4 w-4" />
  },
  
  {
    name: "Second Term",
    startDate: new Date(2025, 0, 6),
    endDate: new Date(2025, 3, 4),
    type: "term",
    color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800",
    icon: <GraduationCap className="h-4 w-4" />
  },
  
  {
    name: "Spring Break",
    startDate: new Date(2025, 3, 5),
    endDate: new Date(2025, 3, 13),
    type: "holiday",
    color: "bg-gradient-to-r from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-800",
    icon: <Sun className="h-4 w-4" />
  },
  
  {
    name: "Third Term",
    startDate: new Date(2025, 3, 14),
    endDate: new Date(2025, 6, 18),
    type: "term",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800",
    icon: <BookOpen className="h-4 w-4" />
  },
  
  {
    name: "Summer Break",
    startDate: new Date(2025, 6, 19),
    endDate: new Date(2025, 7, 31),
    type: "holiday",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800",
    icon: <Sun className="h-4 w-4" />
  },
  
  {
    name: "Easter Break",
    startDate: new Date(2025, 3, 18),
    endDate: new Date(2025, 3, 21),
    type: "holiday",
    color: "bg-gradient-to-r from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-800",
    icon: <Home className="h-4 w-4" />
  },
  
  {
    name: "Mid-Term Break",
    startDate: new Date(2025, 1, 17),
    endDate: new Date(2025, 1, 21),
    type: "holiday",
    color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-800",
    icon: <Home className="h-4 w-4" />
  }
]

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function YearCalendar({ onWeekSelect, selectedWeek, className, compact = false }: YearCalendarProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAcademicPeriods = async () => {
      try {
        const response = await fetch('/api/academic-periods')
        if (response.ok) {
          const data = await response.json()
          setAcademicPeriods(data)
        }
      } catch (error) {
        console.error('Failed to fetch academic periods:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAcademicPeriods()
  }, [])

  const getYearStart = (year: number) => {
    return new Date(year, 0, 1)
  }

  const getYearEnd = (year: number) => {
    return new Date(year, 11, 31)
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const getDateStatus = (date: Date) => {
    for (const period of academicPeriods) {
      const startDate = new Date(period.startDate)
      const endDate = new Date(period.endDate)
      if (date >= startDate && date <= endDate) {
        const type = period.type === 'TERM' ? 'term' : 'holiday'
        const icon = period.type === 'TERM' ? <BookOpen className="h-4 w-4" /> : 
                    period.type === 'HOLIDAY' ? <Home className="h-4 w-4" /> :
                    period.type === 'EXAM' ? <GraduationCap className="h-4 w-4" /> :
                    <Sun className="h-4 w-4" />
        
        return {
          name: period.name,
          startDate: startDate,
          endDate: endDate,
          type: type as "term" | "holiday",
          color: `bg-gradient-to-r from-[${period.colorCode}] to-[${period.colorCode}]`,
          bgColor: `bg-[${period.colorCode}]/10`,
          borderColor: `border-[${period.colorCode}]/20`,
          textColor: `text-[${period.colorCode}]`,
          icon: icon
        }
      }
    }
    
    for (const period of TERMS_AND_HOLIDAYS) {
      if (date >= period.startDate && date <= period.endDate) {
        return period
      }
    }
    return null
  }

  const isInSelectedWeek = (date: Date) => {
    if (!selectedWeek) return false
    const weekStart = getWeekStart(selectedWeek)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return date >= weekStart && date <= weekEnd
  }

  const generateYearCalendar = (year: number) => {
    const yearStart = getYearStart(year)
    const yearEnd = getYearEnd(year)
    const startDate = getWeekStart(yearStart)
    const endDate = new Date(yearEnd)
    
    const weeks: Date[][] = []
    let currentWeek: Date[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      currentWeek.push(new Date(currentDate))
      
      if (currentDate.getDay() === 6) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    return weeks
  }

  const weeks = generateYearCalendar(currentYear)
  const currentDate = new Date()

  const handleDateClick = (date: Date) => {
    const weekStart = getWeekStart(date)
    onWeekSelect(weekStart)
  }

  const handlePreviousYear = () => {
    setCurrentYear(prev => prev - 1)
  }

  const handleNextYear = () => {
    setCurrentYear(prev => prev + 1)
  }

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  if (compact) {
    return (
      <div className={cn("space-y-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Academic Year</h3>
              <p className="text-sm text-gray-600">Calendar & Schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousYear}
              className="h-8 w-8 p-0 border-blue-300 hover:bg-blue-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center px-3 py-1 bg-white rounded-lg border border-blue-200">
              <div className="text-sm font-bold text-gray-900">{currentYear}-{currentYear + 1}</div>
              <div className="text-xs text-gray-500">Academic Year</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextYear}
              className="h-8 w-8 p-0 border-blue-300 hover:bg-blue-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-1">
            {MONTHS.map((month) => (
              <div key={month} className="text-center">
                <div className="text-xs font-semibold text-gray-700 bg-white py-2 px-1 rounded-lg border border-gray-200 shadow-sm">
                  {month}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-12 gap-1">
            {weeks.map((week, weekIndex) => (
              week.map((date, dayIndex) => {
                const status = getDateStatus(date)
                const isSelected = isInSelectedWeek(date)
                const isCurrentYear = date.getFullYear() === currentYear
                const isToday = date.toDateString() === currentDate.toDateString()
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "h-8 w-full rounded-lg text-center cursor-pointer transition-all duration-200",
                      "flex items-center justify-center text-xs font-medium",
                      "hover:scale-105 hover:shadow-md border",
                      !isCurrentYear && "text-gray-300 bg-gray-50 border-gray-100",
                      isCurrentYear && !status && "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                      status && status.color,
                      status && "text-white border-transparent shadow-sm",
                      isSelected && "ring-2 ring-blue-500 ring-offset-2 shadow-lg",
                      isToday && "ring-2 ring-green-500 ring-offset-2 bg-green-50"
                    )}
                    onClick={() => handleDateClick(date)}
                    title={`${date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}${status ? ` - ${status.name}` : ''}`}
                  >
                    {date.getDate()}
                  </div>
                )
              })
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-800">Key Academic Dates</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {TERMS_AND_HOLIDAYS
              .filter(period => 
                period.startDate.getFullYear() === currentYear || 
                period.endDate.getFullYear() === currentYear
              )
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              .map((period, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                    period.bgColor,
                    period.borderColor,
                    "hover:scale-[1.02] hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", period.color)}>
                      {period.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-semibold text-sm truncate", period.textColor)}>
                        {period.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {formatDateRange(period.startDate, period.endDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">Terms</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Holidays</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50", className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            Academic Year Calendar
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousYear}
              className="h-10 w-10 p-0 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <div className="text-lg font-bold">{currentYear}-{currentYear + 1}</div>
              <div className="text-xs opacity-80">Academic Year</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextYear}
              className="h-10 w-10 p-0 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Term Periods
            </h4>
            <div className="space-y-1">
              {loading ? (
                <div className="text-xs text-gray-500">Loading...</div>
              ) : academicPeriods.length > 0 ? (
                academicPeriods
                  .filter(p => p.type === "TERM")
                  .map((period, index) => (
                    <div key={period.id} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: period.colorCode }}
                      ></div>
                      <span className="text-gray-600">{period.name}</span>
                    </div>
                  ))
              ) : (
                TERMS_AND_HOLIDAYS.filter(p => p.type === "term").map((period, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={cn("w-3 h-3 rounded-full", period.color)}></div>
                    <span className="text-gray-600">{period.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Home className="h-4 w-4 text-red-600" />
              Holidays & Breaks
            </h4>
            <div className="space-y-1">
              {loading ? (
                <div className="text-xs text-gray-500">Loading...</div>
              ) : academicPeriods.length > 0 ? (
                academicPeriods
                  .filter(p => p.type === "HOLIDAY")
                  .map((period, index) => (
                    <div key={period.id} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: period.colorCode }}
                      ></div>
                      <span className="text-gray-600">{period.name}</span>
                    </div>
                  ))
              ) : (
                TERMS_AND_HOLIDAYS.filter(p => p.type === "holiday").map((period, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={cn("w-3 h-3 rounded-full", period.color)}></div>
                    <span className="text-gray-600">{period.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-1">
            {MONTHS.map((month, monthIndex) => (
              <div key={month} className="text-center">
                <div className="text-sm font-semibold text-gray-700 bg-gray-100 py-2 rounded-lg">
                  {month}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-12 gap-1">
            {weeks.map((week, weekIndex) => (
              week.map((date, dayIndex) => {
                const monthIndex = date.getMonth()
                const status = getDateStatus(date)
                const isSelected = isInSelectedWeek(date)
                const isCurrentYear = date.getFullYear() === currentYear
                const isToday = date.toDateString() === currentDate.toDateString()
                const isHovered = hoveredDate?.toDateString() === date.toDateString()
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "h-8 w-full rounded-lg border-2 text-center cursor-pointer transition-all duration-200",
                      "flex items-center justify-center text-xs font-medium relative overflow-hidden",
                      "hover:scale-110 hover:shadow-md hover:z-10",
                      !isCurrentYear && "text-gray-300 bg-gray-50",
                      isCurrentYear && !status && "bg-white border-gray-200 text-gray-700 hover:border-blue-300",
                      status && status.color,
                      status && "text-white border-transparent",
                      isSelected && "ring-4 ring-blue-400 ring-offset-2",
                      isToday && "ring-2 ring-green-500 ring-offset-1",
                      isHovered && "transform scale-105 shadow-lg"
                    )}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    title={`${date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}${status ? ` - ${status.name}` : ''}`}
                  >
                    {date.getDate()}
                    {isToday && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                )
              })
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Academic Schedule
          </h4>
          <div className="grid gap-3 max-h-64 overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading academic periods...</div>
            ) : academicPeriods.length > 0 ? (
              academicPeriods
                .filter(period => {
                  const startYear = new Date(period.startDate).getFullYear()
                  const endYear = new Date(period.endDate).getFullYear()
                  return startYear === currentYear || endYear === currentYear
                })
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((period, index) => {
                  const startDate = new Date(period.startDate)
                  const endDate = new Date(period.endDate)
                  const icon = period.type === 'TERM' ? <BookOpen className="h-4 w-4" /> : 
                              period.type === 'HOLIDAY' ? <Home className="h-4 w-4" /> :
                              period.type === 'EXAM' ? <GraduationCap className="h-4 w-4" /> :
                              <Sun className="h-4 w-4" />
                  
                  return (
                    <div
                      key={period.id}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                        "hover:scale-[1.02]"
                      )}
                      style={{
                        backgroundColor: `${period.colorCode}10`,
                        borderColor: `${period.colorCode}20`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg text-white"
                            style={{ backgroundColor: period.colorCode }}
                          >
                            {icon}
                          </div>
                          <div>
                            <div 
                              className="font-semibold text-sm"
                              style={{ color: period.colorCode }}
                            >
                              {period.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDateRange(startDate, endDate)}
                            </div>
                            {period.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {period.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={period.type === "TERM" ? "default" : "secondary"}
                          className={cn(
                            period.type === "TERM" ? "bg-blue-100 text-blue-800" : 
                            period.type === "HOLIDAY" ? "bg-red-100 text-red-800" :
                            "bg-purple-100 text-purple-800"
                          )}
                        >
                          {period.type}
                        </Badge>
                      </div>
                    </div>
                  )
                })
            ) : (
              TERMS_AND_HOLIDAYS
                .filter(period => 
                  period.startDate.getFullYear() === currentYear || 
                  period.endDate.getFullYear() === currentYear
                )
                .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                .map((period, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                      period.bgColor,
                      period.borderColor,
                      "hover:scale-[1.02]"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", period.color)}>
                          {period.icon}
                        </div>
                        <div>
                          <div className={cn("font-semibold text-sm", period.textColor)}>
                            {period.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {formatDateRange(period.startDate, period.endDate)}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={period.type === "term" ? "default" : "secondary"}
                        className={cn(
                          period.type === "term" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        )}
                      >
                        {period.type === "term" ? "Term" : "Holiday"}
                      </Badge>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 