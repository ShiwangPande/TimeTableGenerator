"use client"

import { useDrop, useDrag } from "react-dnd"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TimetableEntry {
  id: string
  dayOfWeek: string
  colorCode?: string
  subject: {
    name: string
    teacher: {
      user: {
        name: string
      }
    }
  }
  room: {
    name: string
  }
  timeSlot: {
    label: string
  }
  class: {
    name: string
    section: string
  }
}

interface TimetableSlotProps {
  entries: TimetableEntry[]
  day: string
  timeSlot: string
  onSwap: (fromId: string, toId: string) => void
  isAdmin?: boolean
  isMobile?: boolean
  userRole?: "ADMIN" | "TEACHER" | "STUDENT"
  currentUserId?: string
}

export function TimetableSlot({ 
  entries, 
  day, 
  timeSlot, 
  onSwap, 
  isAdmin = false,
  isMobile = false,
  userRole = "STUDENT",
  currentUserId
}: TimetableSlotProps) {
  const { toast } = useToast()

  const [{ isOver }, drop] = useDrop({
    accept: "timetable-entry",
    drop: (item: { id: string; type: string }) => {
      if (entries.length > 0 && entries[0].id !== item.id) {
        onSwap(item.id, entries[0].id)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  if (isMobile) {
    return (
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div className="text-center text-gray-500 text-sm">
              No classes scheduled
            </div>
          </div>
        ) : (
          entries.map((entry, index) => (
            <TimetableEntryCard
              key={entry.id}
              entry={entry}
              isAdmin={isAdmin}
              onSwap={onSwap}
              isMobile={true}
              userRole={userRole}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    )
  }

  return (
    <div
      ref={drop}
      className={cn(
        "timetable-cell relative min-h-[80px] p-2",
        isOver && "drag-over"
      )}
    >
      {entries.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400 text-xs">
            <div className="w-6 h-6 mx-auto mb-1 border-2 border-dashed border-gray-300 rounded"></div>
            Empty
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, index) => (
            <TimetableEntryCard
              key={entry.id}
              entry={entry}
              isAdmin={isAdmin}
              onSwap={onSwap}
              isMobile={false}
              userRole={userRole}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TimetableEntryCardProps {
  entry: TimetableEntry
  isAdmin: boolean
  onSwap: (fromId: string, toId: string) => void
  isMobile: boolean
  userRole?: "ADMIN" | "TEACHER" | "STUDENT"
  currentUserId?: string
}

function TimetableEntryCard({ 
  entry, 
  isAdmin, 
  onSwap, 
  isMobile, 
  userRole = "STUDENT",
  currentUserId 
}: TimetableEntryCardProps) {
  // Determine if this entry can be dragged
  const canDrag = isAdmin || (userRole === "TEACHER" && entry.subject.teacher.user.id === currentUserId)
  
  // Determine if this is the current teacher's entry (for visual indication)
  const isOwnEntry = userRole === "TEACHER" && entry.subject.teacher.user.id === currentUserId
  
  const [{ isDragging }, drag] = useDrag({
    type: "timetable-entry",
    item: { id: entry.id, type: "timetable-entry" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => canDrag,
  })

  const getColorClass = (colorCode?: string) => {
    if (!colorCode) return "bg-blue-500"
    
    const colorMap: Record<string, string> = {
      "blue": "bg-blue-500",
      "green": "bg-green-500",
      "purple": "bg-purple-500",
      "orange": "bg-orange-500",
      "red": "bg-red-500",
      "pink": "bg-pink-500",
      "indigo": "bg-indigo-500",
      "yellow": "bg-yellow-500",
    }
    
    return colorMap[colorCode.toLowerCase()] || "bg-blue-500"
  }

  if (isMobile) {
    return (
      <Card 
        ref={canDrag ? drag : undefined}
        className={cn(
          "shadow-sm border-0 transition-all duration-200",
          isDragging && "opacity-50 scale-95",
          canDrag && "cursor-move hover:shadow-md",
          isOwnEntry && "ring-2 ring-blue-200"
        )}
      >
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {entry.subject.name}
                  {isOwnEntry && <span className="ml-1 text-xs text-blue-600">(Yours)</span>}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {entry.subject.teacher.user.name}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getColorClass(entry.colorCode))}
              >
                {entry.class.name} {entry.class.section}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Room: {entry.room.name}</span>
              <span>{entry.timeSlot.label}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      ref={canDrag ? drag : undefined}
      className={cn(
        "timetable-entry rounded-lg p-2 text-white text-xs font-medium transition-all duration-200",
        getColorClass(entry.colorCode),
        isDragging && "dragging",
        canDrag && "cursor-move hover:scale-105",
        isOwnEntry && "ring-2 ring-white/50"
      )}
      title={`${entry.subject.name} - ${entry.subject.teacher.user.name} - ${entry.room.name}${isOwnEntry ? ' (Your entry)' : ''}`}
    >
      <div className="space-y-1">
        <div className="font-semibold truncate">
          {entry.subject.name}
          {isOwnEntry && <span className="ml-1 opacity-90">(Yours)</span>}
        </div>
        <div className="opacity-90 truncate">
          {entry.subject.teacher.user.name}
        </div>
        <div className="opacity-75 truncate">
          {entry.class.name} {entry.class.section}
        </div>
        <div className="opacity-75 truncate">
          {entry.room.name}
        </div>
      </div>
    </div>
  )
} 