"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Calendar } from "lucide-react"
import { DayOfWeek } from "@prisma/client"

// Form validation schema
const bulkTimeSlotSchema = z.object({
  label: z.string().min(1, "Label is required"),
  startHour: z.string().min(1, "Start hour is required"),
  startMinute: z.string().min(1, "Start minute is required"),
  startPeriod: z.string().min(1, "Start period is required"),
  endHour: z.string().min(1, "End hour is required"),
  endMinute: z.string().min(1, "End minute is required"),
  endPeriod: z.string().min(1, "End period is required"),
  applyToAllWeekdays: z.boolean().default(false),
})

type BulkTimeSlotFormData = z.infer<typeof bulkTimeSlotSchema>

// Helper function to convert 12-hour format to 24-hour Date object
function createTimeDate(hour: string, minute: string, period: string): Date {
  let hour24 = parseInt(hour)
  
  if (period === "PM" && hour24 !== 12) {
    hour24 += 12
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0
  }
  
  const date = new Date()
  date.setHours(hour24, parseInt(minute), 0, 0)
  return date
}

// Helper function to format time for display
function formatTimeDisplay(hour: string, minute: string, period: string): string {
  return `${hour.padStart(2, '0')}:${minute} ${period}`
}

// Weekday mapping
const WEEKDAYS: { value: DayOfWeek; label: string }[] = [
  { value: DayOfWeek.MONDAY, label: "Monday" },
  { value: DayOfWeek.TUESDAY, label: "Tuesday" },
  { value: DayOfWeek.WEDNESDAY, label: "Wednesday" },
  { value: DayOfWeek.THURSDAY, label: "Thursday" },
  { value: DayOfWeek.FRIDAY, label: "Friday" },
]

export function BulkTimeslotEntry() {
  const [open, setOpen] = useState(false)
  
  const form = useForm<BulkTimeSlotFormData>({
    resolver: zodResolver(bulkTimeSlotSchema),
    defaultValues: {
      label: "",
      startHour: "8",
      startMinute: "00",
      startPeriod: "AM",
      endHour: "9",
      endMinute: "00",
      endPeriod: "AM",
      applyToAllWeekdays: false,
    },
  })

  const onSubmit = async (data: BulkTimeSlotFormData) => {
    try {
      // Create Date objects for start and end times
      const startTime = createTimeDate(data.startHour, data.startMinute, data.startPeriod)
      const endTime = createTimeDate(data.endHour, data.endMinute, data.endPeriod)
      
      // Create label if not provided
      const label = data.label || formatTimeDisplay(data.startHour, data.startMinute, data.startPeriod)
      
      if (data.applyToAllWeekdays) {
        // Create 5 time slots for all weekdays
        const timeSlotPromises = WEEKDAYS.map(async (weekday) => {
          const timeSlotData = {
            label: `${label} (${weekday.label})`,
            startTime,
            endTime,
            dayOfWeek: weekday.value,
          }
          
          return fetch("/api/timeslots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(timeSlotData),
          })
        })
        
        // Execute all requests in parallel
        const responses = await Promise.all(timeSlotPromises)
        const allSuccessful = responses.every(response => response.ok)
        
        if (allSuccessful) {
          console.log("Successfully created time slots for all weekdays")
          setOpen(false)
          form.reset()
        } else {
          console.error("Some time slots failed to create")
        }
      } else {
        // Create single time slot
        const timeSlotData = {
          label,
          startTime,
          endTime,
        }
        
        const response = await fetch("/api/timeslots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(timeSlotData),
        })
        
        if (response.ok) {
          console.log("Successfully created time slot")
          setOpen(false)
          form.reset()
        } else {
          console.error("Failed to create time slot")
        }
      }
      
    } catch (error) {
      console.error("Error creating time slot(s):", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Bulk Time Slots
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Bulk Time Slots</DialogTitle>
          <DialogDescription>
            Create time slots for all weekdays at once or single time slot
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <div className="col-span-3">
              <Input
                id="label"
                placeholder="e.g., First Period"
                {...form.register("label")}
              />
              {form.formState.errors.label && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.label.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Time</Label>
            <div className="col-span-3 flex gap-2">
              <Select
                value={form.watch("startHour")}
                onValueChange={(value) => form.setValue("startHour", value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="flex items-center text-lg font-medium">:</span>
              
              <Select
                value={form.watch("startMinute")}
                onValueChange={(value) => form.setValue("startMinute", value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={form.watch("startPeriod")}
                onValueChange={(value) => form.setValue("startPeriod", value)}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">End Time</Label>
            <div className="col-span-3 flex gap-2">
              <Select
                value={form.watch("endHour")}
                onValueChange={(value) => form.setValue("endHour", value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="flex items-center text-lg font-medium">:</span>
              
              <Select
                value={form.watch("endMinute")}
                onValueChange={(value) => form.setValue("endMinute", value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={form.watch("endPeriod")}
                onValueChange={(value) => form.setValue("endPeriod", value)}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="applyToAllWeekdays"
                  checked={form.watch("applyToAllWeekdays")}
                  onCheckedChange={(checked) => 
                    form.setValue("applyToAllWeekdays", checked as boolean)
                  }
                />
                <Label htmlFor="applyToAllWeekdays" className="text-sm font-medium">
                  Apply to all weekdays (Monday - Friday)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                When checked, this will create 5 time slots with the same time for each weekday
              </p>
            </div>
          </div>
          
          {form.watch("applyToAllWeekdays") && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Will create time slots for:
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                {WEEKDAYS.map((weekday) => (
                  <div key={weekday.value} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {weekday.label}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting 
                ? (form.watch("applyToAllWeekdays") ? "Creating 5 slots..." : "Creating...") 
                : (form.watch("applyToAllWeekdays") ? "Create 5 Time Slots" : "Create Time Slot")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 