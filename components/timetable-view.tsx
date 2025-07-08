"use client"

import { useState, useEffect } from "react"
import { TimetableGrid } from "./timetable-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface TimetableViewProps {
  isAdmin?: boolean
  filters?: {
    class: string
    teacher: string
    curriculum: string
    section: string
  }
  selectedWeek?: Date
  userRole?: "ADMIN" | "TEACHER" | "STUDENT"
  currentUserId?: string
}

export function TimetableView({ 
  isAdmin = false, 
  filters, 
  selectedWeek,
  userRole = "STUDENT",
  currentUserId
}: TimetableViewProps) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTimetable()
  }, [filters, selectedWeek])

  const fetchTimetable = async () => {
    try {
      setError(null)
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.class !== "all") params.append("classId", filters.class)
        if (filters.teacher !== "all") params.append("teacherId", filters.teacher)
        if (filters.curriculum !== "all") params.append("curriculum", filters.curriculum)
        if (filters.section !== "all") params.append("section", filters.section)
      }
      
      if (selectedWeek) {
        params.append("weekStart", selectedWeek.toISOString().split('T')[0])
      }
      
      const url = `/api/timetable${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      } else {
        setError("Failed to load timetable data")
      }
    } catch (error) {
      console.error("Failed to fetch timetable:", error)
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTimetable()
    setRefreshing(false)
  }

  const handleEntriesChange = (newEntries: any[]) => {
    setEntries(newEntries)
  }

  if (loading) {
    return (
      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="ml-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              Weekly Timetable
              {selectedWeek && (
                <span className="text-sm font-normal text-gray-500">
                  (Week of {selectedWeek.toLocaleDateString()})
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isAdmin 
                ? "Complete schedule for all classes and teachers. Drag and drop to swap entries."
                : "Complete schedule for all classes and teachers"
              }
              {entries.length > 0 && (
                <span className="ml-2 text-blue-600">
                  {entries.length} entries loaded
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timetable entries found</h3>
            <p className="text-gray-600 mb-4">
              {filters && Object.values(filters).some(f => f !== "all") 
                ? "Try adjusting your filters or generate a new timetable."
                : "No timetable has been generated yet. Generate a timetable to get started."
              }
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <TimetableGrid 
              entries={entries} 
              isAdmin={isAdmin}
              onEntriesChange={handleEntriesChange}
              userRole={userRole}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
