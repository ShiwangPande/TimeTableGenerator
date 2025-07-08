"use client"

import { TimetableView } from "@/components/timetable-view"
import { TimetableFilters } from "@/components/timetable-filters"
import { MultiSubjectAssignment } from "@/components/multi-subject-assignment"
import { SimpleMonthCalendar } from "@/components/simple-month-calendar"
import { SwapInstructions } from "@/components/swap-instructions"
import { DndProvider } from "@/components/dnd-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FilterState {
  class: string
  teacher: string
  curriculum: string
  section: string
}

interface Stats {
  timeSlots: number
  rooms: number
  subjects: number
  classes: number
  days: number
}

export default function AdminTimetablePage() {
  const [selectedWeek, setSelectedWeek] = useState<Date | undefined>(undefined)
  const [filters, setFilters] = useState<FilterState>({
    class: "all",
    teacher: "all",
    curriculum: "all",
    section: "all",
  })
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats>({
    timeSlots: 0,
    rooms: 0,
    subjects: 0,
    classes: 0,
    days: 5,
  })
  const { toast } = useToast()
  const [user, setUser] = useState<{ role: string; id: string } | null>(null)

  // Fetch stats and user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch current user
        const userResponse = await fetch('/api/auth/me')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()
  }, [])

  const handleWeekSelect = (weekStartDate: Date) => {
    setSelectedWeek(weekStartDate)
    console.log(`Selected week starting: ${weekStartDate.toISOString().split('T')[0]}`)
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    console.log("Filters updated:", newFilters)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Trigger a page refresh to reload all data
      window.location.reload()
    } catch (error) {
      console.error("Refresh error:", error)
      toast({
        title: "Error",
        description: "Failed to refresh timetable",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleSubjectAssigned = () => {
    toast({
      title: "Success",
      description: "Subjects assigned successfully. Refreshing timetable...",
    })
    // Refresh the page after a short delay to show the new assignments
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <DndProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                Timetable Management
              </h1>
              <p className="text-sm lg:text-base text-gray-600 max-w-2xl">
                View, manage, and organize the complete academic timetable. Drag and drop entries to rearrange schedules.
              </p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <MultiSubjectAssignment onSuccess={handleSubjectAssigned} />
            </div>
          </div>
          <Separator className="bg-gray-200" />
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
            {/* Sidebar - Filters, Calendar, Instructions */}
            <aside className="2xl:col-span-1 max-h-[calc(100vh-120px)] sticky top-8 overflow-y-auto">
              {/* Filters only */}
              <Card className="bg-slate-50 shadow-lg border-0 rounded-xl p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Filters
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Filter timetable entries by class, teacher, or curriculum
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <TimetableFilters 
                    filters={filters} 
                    onFiltersChange={handleFiltersChange} 
                  />
                </CardContent>
              </Card>
            </aside>
            {/* Main Timetable Grid Section */}
            <main className="2xl:col-span-3 flex flex-col gap-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.days}</div>
                        <div className="text-sm text-gray-600">Days</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Filter className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.timeSlots}</div>
                        <div className="text-sm text-gray-600">Time Slots</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.rooms}</div>
                        <div className="text-sm text-gray-600">Rooms</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.subjects}</div>
                        <div className="text-sm text-gray-600">Subjects</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Timetable Grid */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    Timetable Grid
                  </CardTitle>
                  <CardDescription>
                    Drag and drop entries to rearrange the timetable. Changes are saved automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <TimetableView 
                    filters={filters}
                    selectedWeek={selectedWeek}
                    userRole={user?.role as "ADMIN" | "TEACHER" | "STUDENT"}
                    currentUserId={user?.id}
                  />
                </CardContent>
              </Card>
              {/* Below Grid: Week Selector and Swap Instructions */}
              <div className="flex flex-col md:flex-row gap-6 mt-4">
                {/* Week Selector */}
                <Card className="flex-1 bg-slate-50 shadow-lg border-0 rounded-xl p-6 min-w-[280px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <Calendar className="h-5 w-5 text-green-600" />
                      Week Selector
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      Select a week to view specific timetable data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <SimpleMonthCalendar 
                      onWeekSelect={handleWeekSelect}
                      selectedWeek={selectedWeek}
                    />
                  </CardContent>
                </Card>
                {/* Swap Instructions */}
                <Card className="flex-1 bg-slate-50 shadow-lg border-0 rounded-xl p-6 min-w-[280px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <RefreshCw className="h-5 w-5 text-purple-600" />
                      Swap Instructions
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      How to manage timetable swaps
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <SwapInstructions userRole="ADMIN" />
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
          {/* Mobile Layout - Stacked */}
          <div className="block 2xl:hidden space-y-6">
            {/* Mobile Calendar */}
            <SimpleMonthCalendar 
              onWeekSelect={handleWeekSelect}
              selectedWeek={selectedWeek}
            />
            {/* Mobile Filters */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Timetable Filters
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Filter and customize the timetable view by class, teacher, curriculum, or section
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <TimetableFilters 
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </CardContent>
            </Card>
            {/* Mobile Timetable */}
            <TimetableView 
              isAdmin={true} 
              filters={filters}
              selectedWeek={selectedWeek}
              userRole={user?.role as "ADMIN" | "TEACHER" | "STUDENT"}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
