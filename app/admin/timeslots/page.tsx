import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeSlotsTable } from "@/components/timeslots-table"
import { CreateTimeSlotDialog } from "@/components/create-timeslot-dialog"
import { prisma } from "@/lib/prisma"

export default async function TimeSlotsPage() {
  const timeSlots = await prisma.timeSlot.findMany({
    orderBy: { startTime: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Slots</h1>
          <p className="text-muted-foreground">Manage class periods and scheduling times</p>
        </div>
        <CreateTimeSlotDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Time Slots</CardTitle>
          <CardDescription>View and manage all time slots in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeSlotsTable timeSlots={timeSlots} />
        </CardContent>
      </Card>
    </div>
  )
}
