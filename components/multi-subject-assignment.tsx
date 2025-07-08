"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Calendar } from "lucide-react"
import { DayOfWeek } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"

// Form validation schema
const multiSubjectSchema = z.object({
  timeslotId: z.string().min(1, "Time slot is required"),
  dayOfWeek: z.string().min(1, "Day is required"),
  subjectIds: z.array(z.string()).min(1, "At least one subject is required"),
  roomId: z.string().optional(),
})

type MultiSubjectFormData = z.infer<typeof multiSubjectSchema>

interface Subject {
  id: string
  name: string
  category: string
  teacher: {
    user: {
      name: string
    }
  }
  class: {
    name: string
    section: string
  }
}

interface TimeSlot {
  id: string
  label: string
  startTime: Date
  endTime: Date
}

interface Room {
  id: string
  name: string
  capacity: number
}

interface MultiSubjectAssignmentProps {
  onSuccess?: () => void
}

// Weekday mapping
const WEEKDAYS: { value: DayOfWeek; label: string }[] = [
  { value: DayOfWeek.MONDAY, label: "Monday" },
  { value: DayOfWeek.TUESDAY, label: "Tuesday" },
  { value: DayOfWeek.WEDNESDAY, label: "Wednesday" },
  { value: DayOfWeek.THURSDAY, label: "Thursday" },
  { value: DayOfWeek.FRIDAY, label: "Friday" },
]

export function MultiSubjectAssignment({ onSuccess }: MultiSubjectAssignmentProps) {
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<MultiSubjectFormData>({
    resolver: zodResolver(multiSubjectSchema),
    defaultValues: {
      timeslotId: "",
      dayOfWeek: "",
      subjectIds: [],
      roomId: "",
    },
  })

  // Fetch data on mount
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      console.log("Fetching data for MultiSubjectAssignment...")
      
      const [subjectsRes, timeSlotsRes, roomsRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/timeslots"),
        fetch("/api/rooms"),
      ])

      console.log("API Responses:", {
        subjects: subjectsRes.status,
        timeSlots: timeSlotsRes.status,
        rooms: roomsRes.status
      })

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        console.log("Subjects loaded:", subjectsData.length)
        setSubjects(subjectsData)
      } else {
        console.error("Subjects API error:", subjectsRes.status, subjectsRes.statusText)
      }

      if (timeSlotsRes.ok) {
        const timeSlotsData = await timeSlotsRes.json()
        console.log("Time slots loaded:", timeSlotsData.length)
        setTimeSlots(timeSlotsData)
      } else {
        console.error("Time slots API error:", timeSlotsRes.status, timeSlotsRes.statusText)
        const errorText = await timeSlotsRes.text()
        console.error("Time slots error details:", errorText)
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        console.log("Rooms loaded:", roomsData.length)
        setRooms(roomsData)
      } else {
        console.error("Rooms API error:", roomsRes.status, roomsRes.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Check console for details.",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: MultiSubjectFormData) => {
    setLoading(true)
    try {
      const response = await fetch("/api/timetable/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subjects assigned successfully",
        })
        setOpen(false)
        form.reset()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to assign subjects",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning subjects:", error)
      toast({
        title: "Error",
        description: "Failed to assign subjects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addSubject = (subjectId: string) => {
    const currentIds = form.watch("subjectIds")
    if (!currentIds.includes(subjectId)) {
      form.setValue("subjectIds", [...currentIds, subjectId])
    }
  }

  const removeSubject = (subjectId: string) => {
    const currentIds = form.watch("subjectIds")
    form.setValue("subjectIds", currentIds.filter(id => id !== subjectId))
  }

  const selectedSubjects = subjects.filter(subject => 
    form.watch("subjectIds").includes(subject.id)
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Assign Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Multiple Subjects</DialogTitle>
          <DialogDescription>
            Assign multiple subjects to a specific time slot and day
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Time Slot *</Label>
              <Select
                value={form.watch("timeslotId")}
                onValueChange={(value) => form.setValue("timeslotId", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.length === 0 ? (
                    <SelectItem value="no-timeslots" disabled>
                      No time slots available
                    </SelectItem>
                  ) : (
                    timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {timeSlots.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No time slots found. Please create time slots first in the Time Slots section.
                </p>
              )}
              {form.formState.errors.timeslotId && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.timeslotId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Day *</Label>
              <Select
                value={form.watch("dayOfWeek")}
                onValueChange={(value) => form.setValue("dayOfWeek", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.dayOfWeek && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.dayOfWeek.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Room (Optional)</Label>
              <Select
                value={form.watch("roomId")}
                onValueChange={(value) => form.setValue("roomId", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select room (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.length === 0 ? (
                    <SelectItem value="no-rooms" disabled>
                      No rooms available
                    </SelectItem>
                  ) : (
                    rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} ({room.capacity} capacity)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {rooms.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No rooms found. Please create rooms first in the Rooms section.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Subjects *</Label>
              <div className="space-y-3">
                <Select onValueChange={addSubject}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Add a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
                      <SelectItem value="no-subjects" disabled>
                        No subjects available
                      </SelectItem>
                    ) : (
                      subjects
                        .filter(subject => !form.watch("subjectIds").includes(subject.id))
                        .map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} - {subject.class.name} {subject.class.section}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                {subjects.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No subjects found. Please create subjects first in the Subjects section.
                  </p>
                )}
                
                {/* Selected Subjects Display */}
                {form.watch("subjectIds").length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Selected Subjects:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((subject) => (
                        <Badge
                          key={subject.id}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {subject.name} - {subject.class.name} {subject.class.section}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSubject(subject.id)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {form.formState.errors.subjectIds && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.subjectIds.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Subjects"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 