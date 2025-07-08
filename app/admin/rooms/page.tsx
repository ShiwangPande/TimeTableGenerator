export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomsTable } from "@/components/rooms-table"
import { CreateRoomDialog } from "@/components/create-room-dialog"
import { prisma } from "@/lib/prisma"

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage classroom and facility spaces</p>
        </div>
        <CreateRoomDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
          <CardDescription>View and manage all rooms in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <RoomsTable rooms={rooms} />
        </CardContent>
      </Card>
    </div>
  )
}
