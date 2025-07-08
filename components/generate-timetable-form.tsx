"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Class {
  id: string
  name: string
  section: string
  level: string
}

interface Teacher {
  id: string
  user: {
    name: string
  }
}

interface Subject {
  id: string
  name: string
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
  startTime: string
  endTime: string
}

interface Room {
  id: string
  name: string
}

interface GenerateTimetableFormProps {
  classes: Class[]
  teachers: Teacher[]
  subjects: Subject[]
  timeSlots: TimeSlot[]
  rooms: Room[]
}

export function GenerateTimetableForm({ 
  classes, 
  teachers, 
  subjects, 
  timeSlots, 
  rooms 
}: GenerateTimetableFormProps) {
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState<"class" | "teacher" | "all">("all")
  const [selectedId, setSelectedId] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const body: any = {}
      if (filterType === "class") body.classId = selectedId
      if (filterType === "teacher") body.teacherId = selectedId

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Timetable generated successfully",
        })
        // Redirect to timetable view
        router.push("/admin/timetable")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate timetable")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate timetable",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if we have enough data to generate timetables
  const canGenerate = classes.length > 0 && subjects.length > 0 && timeSlots.length > 0 && rooms.length > 0

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Generate For</label>
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="class">Specific Class</SelectItem>
            <SelectItem value="teacher">Specific Teacher</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filterType !== "all" && (
        <div>
          <label className="text-sm font-medium">Select {filterType === "class" ? "Class" : "Teacher"}</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${filterType}`} />
            </SelectTrigger>
            <SelectContent>
              {filterType === "class" && classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section} ({cls.level})
                </SelectItem>
              ))}
              {filterType === "teacher" && teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button 
        onClick={handleGenerate} 
        disabled={loading || !canGenerate || (filterType !== "all" && !selectedId)} 
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Timetable
      </Button>

      {!canGenerate && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Cannot generate:</strong> Missing required data. Please ensure you have classes, subjects, time slots, and rooms configured.
          </div>
        </div>
      )}

      {filterType !== "all" && !selectedId && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            Please select a {filterType} to generate the timetable for.
          </div>
        </div>
      )}
    </div>
  )
}
