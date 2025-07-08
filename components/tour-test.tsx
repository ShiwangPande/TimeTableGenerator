"use client"

import { Button } from "@/components/ui/button"
import { useTour } from "./tour-provider"
import { AdminTourButton, TeacherTourButton, StudentTourButton } from "./admin-tour-button"

export function TourTest() {
  const { startTour } = useTour()

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Tour Test Component</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Direct Tour Start:</h3>
        <div className="flex gap-2">
          <Button onClick={() => startTour("ADMIN")} variant="outline">
            Start Admin Tour
          </Button>
          <Button onClick={() => startTour("TEACHER")} variant="outline">
            Start Teacher Tour
          </Button>
          <Button onClick={() => startTour("STUDENT")} variant="outline">
            Start Student Tour
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Tour Buttons:</h3>
        <div className="flex gap-2">
          <AdminTourButton />
          <TeacherTourButton />
          <StudentTourButton />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Test Elements:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div data-tour="teachers" className="p-4 border rounded-lg bg-blue-50">
            Teachers Management
          </div>
          <div data-tour="classes" className="p-4 border rounded-lg bg-green-50">
            Classes Management
          </div>
          <div data-tour="subjects" className="p-4 border rounded-lg bg-purple-50">
            Subjects Management
          </div>
          <div data-tour="timetable" className="p-4 border rounded-lg bg-orange-50">
            Timetable Management
          </div>
        </div>
      </div>
    </div>
  )
} 