"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface TimeSlot {
  id: string
  label: string
  startTime: Date
  endTime: Date
}

interface TimeSlotsTableProps {
  timeSlots: TimeSlot[]
}

export function TimeSlotsTable({ timeSlots }: TimeSlotsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {timeSlots.map((slot) => (
          <TableRow key={slot.id}>
            <TableCell className="font-medium">{slot.label}</TableCell>
            <TableCell>{format(new Date(slot.startTime), "HH:mm")}</TableCell>
            <TableCell>{format(new Date(slot.endTime), "HH:mm")}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
