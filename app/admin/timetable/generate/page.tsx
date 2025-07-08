export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GenerateTimetableForm } from "@/components/generate-timetable-form"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function GenerateTimetablePage() {
  await requireRole(Role.ADMIN)

  // Get data for the form
  const [classes, teachers, subjects, timeSlots, rooms] = await Promise.all([
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }]
    }),
    prisma.teacher.findMany({
      include: {
        user: true
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    }),
    prisma.subject.findMany({
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        class: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.timeSlot.findMany({
      orderBy: { startTime: "asc" }
    }),
    prisma.room.findMany({
      orderBy: { name: "asc" }
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Timetable</h1>
        <p className="text-muted-foreground">
          Generate timetables for classes, teachers, or all subjects
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generate Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Timetable</CardTitle>
            <CardDescription>
              Choose what to generate and configure the timetable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GenerateTimetableForm 
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              timeSlots={timeSlots}
              rooms={rooms}
            />
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system configuration and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Classes</div>
                <div className="text-2xl font-bold">{classes.length}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Teachers</div>
                <div className="text-2xl font-bold">{teachers.length}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Subjects</div>
                <div className="text-2xl font-bold">{subjects.length}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Time Slots</div>
                <div className="text-2xl font-bold">{timeSlots.length}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Rooms</div>
                <div className="text-2xl font-bold">{rooms.length}</div>
              </div>
            </div>

            {classes.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Warning:</strong> No classes found. Please create classes first before generating timetables.
                </div>
              </div>
            )}

            {subjects.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Warning:</strong> No subjects found. Please create subjects first before generating timetables.
                </div>
              </div>
            )}

            {timeSlots.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Warning:</strong> No time slots found. Please create time slots first before generating timetables.
                </div>
              </div>
            )}

            {rooms.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Warning:</strong> No rooms found. Please create rooms first before generating timetables.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Generate a Timetable</CardTitle>
          <CardDescription>
            Follow these steps to create a complete timetable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-lg font-semibold">1. Prepare Data</div>
              <div className="text-sm text-muted-foreground">
                Ensure you have classes, subjects, teachers, time slots, and rooms configured in the system.
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold">2. Choose Scope</div>
              <div className="text-sm text-muted-foreground">
                Select whether to generate for all classes, a specific class, or a specific teacher.
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold">3. Generate & Review</div>
              <div className="text-sm text-muted-foreground">
                Click generate and review the timetable. You can then make manual adjustments using drag and drop.
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/timetable/generate/test">
                Test Generate Functionality
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 