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
import { Plus } from "lucide-react"

// Form validation schema
const timeSlotSchema = z.object({
  label: z.string().min(1, "Label is required"),
  startHour: z.string().min(1, "Start hour is required"),
  startMinute: z.string().min(1, "Start minute is required"),
  startPeriod: z.string().min(1, "Start period is required"),
  endHour: z.string().min(1, "End hour is required"),
  endMinute: z.string().min(1, "End minute is required"),
  endPeriod: z.string().min(1, "End period is required"),
})

type TimeSlotFormData = z.infer<typeof timeSlotSchema>

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

export function CreateTimeSlotDialog() {
  const [open, setOpen] = useState(false)
  
  const form = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      label: "",
      startHour: "8",
      startMinute: "00",
      startPeriod: "AM",
      endHour: "9",
      endMinute: "00",
      endPeriod: "AM",
    },
  })

  const onSubmit = async (data: TimeSlotFormData) => {
    try {
      // Create Date objects for start and end times
      const startTime = createTimeDate(data.startHour, data.startMinute, data.startPeriod)
      const endTime = createTimeDate(data.endHour, data.endMinute, data.endPeriod)
      
      // Create label if not provided
      const label = data.label || formatTimeDisplay(data.startHour, data.startMinute, data.startPeriod)
      
      // Prepare the time slot data
      const timeSlotData = {
        label,
        startTime,
        endTime,
      }
      
      console.log("Time slot data:", timeSlotData)
      
      // TODO: Add API call to create time slot
      // const response = await fetch("/api/timeslots", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(timeSlotData),
      // })
      
      // if (response.ok) {
      //   setOpen(false)
      //   form.reset()
      // }
      
      // For now, just close the dialog
      setOpen(false)
      form.reset()
      
    } catch (error) {
      console.error("Error creating time slot:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Time Slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Time Slot</DialogTitle>
          <DialogDescription>Add a new time slot to the system</DialogDescription>
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Time Slot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
