"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Home, Sun, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleYearCalendarProps {
  className?: string
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

const TYPE_ICON: Record<string, React.ReactNode> = {
  TERM: <BookOpen className="h-4 w-4" />,
  HOLIDAY: <Home className="h-4 w-4" />,
  EXAM: <Sun className="h-4 w-4" />,
  EVENT: <Calendar className="h-4 w-4" />,
}

export function SimpleYearCalendar({ className }: SimpleYearCalendarProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [periods, setPeriods] = useState<AcademicPeriod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/academic-periods")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setPeriods(data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching academic periods:", error)
        setPeriods([])
        setLoading(false)
      })
  }, [])

  const today = new Date()

  const handlePreviousYear = () => {
    setCurrentYear(prev => prev - 1)
  }

  const handleNextYear = () => {
    setCurrentYear(prev => prev + 1)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getCurrentPeriod = () => {
    return periods.find(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      return today >= start && today <= end
    })
  }

  const currentPeriod = getCurrentPeriod()

  function downloadCSV() {
    if (!periods.length) return
    const headers = ["Name", "Type", "Start Date", "End Date", "Description"]
    const rows = periods.map(p => [
      p.name,
      p.type,
      new Date(p.startDate).toLocaleDateString(),
      new Date(p.endDate).toLocaleDateString(),
      p.description || ""
    ])
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `academic-calendar-${new Date().getFullYear()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className={cn("p-8 text-center text-gray-500", className)}>Loading academic calendar...</div>
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Academic Year</h2>
            <p className="text-gray-600">{currentYear}-{currentYear + 1} Calendar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousYear}
            className="h-10 w-10 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center px-4 py-2 bg-white rounded-lg border">
            <div className="text-lg font-bold">{currentYear}-{currentYear + 1}</div>
            <div className="text-sm text-gray-500">Academic Year</div>
          </div>
          <Button
            variant="outline"
            onClick={handleNextYear}
            className="h-10 w-10 p-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Download CSV Button */}
      <div className="flex justify-end">
        <Button onClick={downloadCSV} variant="secondary" className="gap-2">
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </div>

      {/* Current Period */}
      {currentPeriod && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg text-white", "bg-blue-600")}>{TYPE_ICON[currentPeriod.type]}</div>
              <div>
                <div className="font-semibold text-lg">Currently: {currentPeriod.name}</div>
                <div className="text-sm text-gray-600">
                  {formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic Periods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Academic Periods</h3>
        <div className="grid gap-4">
          {periods
            .filter(period => {
              const startYear = new Date(period.startDate).getFullYear()
              const endYear = new Date(period.endDate).getFullYear()
              return startYear === currentYear || endYear === currentYear
            })
            .map((period, index) => (
              <Card key={period.id} className={cn("border-l-4 border-blue-600")}> {/* Use colorCode if you want */}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg text-white", "bg-blue-600")}>{TYPE_ICON[period.type]}</div>
                      <div>
                        <div className="font-semibold">{period.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </div>
                      </div>
                    </div>
                    <div className={cn("px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700")}>{period.type}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{periods.filter(p => p.type === 'TERM').length}</div>
            <div className="text-sm text-gray-600">Terms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{periods.filter(p => p.type === 'HOLIDAY').length}</div>
            <div className="text-sm text-gray-600">Breaks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{periods.length}</div>
            <div className="text-sm text-gray-600">Total Periods</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 