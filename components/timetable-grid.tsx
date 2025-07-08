"use client"

import { useState, useEffect } from "react"
import { TimetableSlot } from "./timetable-slot"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface TimetableEntry {
  id: string
  dayOfWeek: string
  colorCode?: string
  subject: {
    id: string
    name: string
    teacher: {
      id: string
      user: {
        id: string
        name: string
      }
    }
  }
  room: {
    id: string
    name: string
  }
  timeSlot: {
    id: string
    label: string
    startTime: Date | string
    endTime: Date | string
  }
  class: {
    id: string
    name: string
    section: string
  }
}

interface TimetableGridProps {
  entries: TimetableEntry[]
  isAdmin?: boolean
  onEntriesChange?: (entries: TimetableEntry[]) => void
  userRole?: "ADMIN" | "TEACHER" | "STUDENT"
  currentUserId?: string
}

export function TimetableGrid({ 
  entries, 
  isAdmin = false, 
  onEntriesChange,
  userRole = "STUDENT",
  currentUserId
}: TimetableGridProps) {
  const [localEntries, setLocalEntries] = useState<TimetableEntry[]>(entries)
  const { toast } = useToast()
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
  const timeSlots = [...new Set(localEntries.map((e) => e.timeSlot.label))].sort()

  // Update local entries when props change
  useEffect(() => {
    setLocalEntries(entries)
  }, [entries])

  // Group entries by day and time slot
  const timetableGrid: Record<string, TimetableEntry[]> = {}
  localEntries.forEach((entry) => {
    const key = `${entry.dayOfWeek}-${entry.timeSlot.label}`
    if (!timetableGrid[key]) {
      timetableGrid[key] = []
    }
    timetableGrid[key].push(entry)
  })

  const handleSwap = async (fromId: string, toId: string) => {
    try {
      if (isAdmin) {
        // Admin uses direct swap
        const response = await fetch("/api/timetable/direct-swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromId, toId }),
        })

        if (response.ok) {
          const result = await response.json()
          
          // Update local state with the swapped entries
          const updatedEntries = localEntries.map(entry => {
            if (entry.id === fromId) {
              return result.data.fromEntry
            }
            if (entry.id === toId) {
              return result.data.toEntry
            }
            return entry
          })

          setLocalEntries(updatedEntries)
          onEntriesChange?.(updatedEntries)

          toast({
            title: "Success",
            description: "Timetable entries swapped successfully",
          })
        } else {
          const error = await response.json()
          toast({
            title: "Error",
            description: error.error || "Failed to swap entries",
            variant: "destructive",
          })
        }
      } else {
        // Teacher creates swap request
        const response = await fetch("/api/timetable/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            fromEntryId: fromId, 
            toEntryId: toId,
            reason: "Requested by teacher" 
          }),
        })

        if (response.ok) {
          toast({
            title: "Swap Request Sent",
            description: "Your swap request has been sent to the other teacher for approval",
          })
        } else {
          const error = await response.json()
          toast({
            title: "Error",
            description: error.error || "Failed to create swap request",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Swap error:", error)
      toast({
        title: "Error",
        description: isAdmin ? "Failed to swap timetable entries" : "Failed to create swap request",
        variant: "destructive",
      })
    }
  }

  const getDayShortName = (day: string) => {
    return day.slice(0, 3).toUpperCase()
  }

  return (
    <div className="w-full">
      {/* Mobile View - Card Layout */}
      <div className="block lg:hidden space-y-4">
        {timeSlots.map((slot) => (
          <Card key={slot} className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{slot}</h3>
                  <Badge variant="outline" className="text-xs">
                    Time Slot
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {days.map((day) => {
                    const key = `${day}-${slot}`
                    const dayEntries = timetableGrid[key] || []
                    
                    return (
                      <div key={day} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">
                            {getDayShortName(day)}
                          </span>
                        </div>
                        <TimetableSlot
                          entries={dayEntries}
                          day={day}
                          timeSlot={slot}
                          onSwap={handleSwap}
                          isAdmin={isAdmin}
                          isMobile={true}
                          userRole={userRole}
                          currentUserId={currentUserId}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden lg:block">
        <ScrollArea className="w-full">
          <div className="timetable-grid min-w-[900px]">
            {/* Header row */}
            <div className="timetable-cell timetable-header">
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-sm font-semibold text-gray-900">Time</span>
                <span className="text-xs text-gray-500">Slot</span>
              </div>
            </div>
            {days.map((day) => (
              <div key={day} className="timetable-cell timetable-header">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {getDayShortName(day)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            ))}

            {/* Time slot rows */}
            {timeSlots.map((slot) => (
              <div key={slot} className="contents">
                <div className="timetable-cell timetable-header">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <span className="text-sm font-medium text-gray-900">{slot}</span>
                    <span className="text-xs text-gray-500">Period</span>
                  </div>
                </div>
                {days.map((day) => {
                  const key = `${day}-${slot}`
                  const dayEntries = timetableGrid[key] || []

                  return (
                    <TimetableSlot
                      key={key}
                      entries={dayEntries}
                      day={day}
                      timeSlot={slot}
                      onSwap={handleSwap}
                      isAdmin={isAdmin}
                      isMobile={false}
                      userRole={userRole}
                      currentUserId={currentUserId}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
