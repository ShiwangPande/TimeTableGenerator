"use client"

import { useEffect, useState } from "react"

interface TimetableEntry {
  id: string
  dayOfWeek: string
  timeSlot: {
    label: string
  }
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
}

interface User {
  id: string
  name: string
  email: string
  student: {
    id: string
    classId: string
    class: {
      id: string
      name: string
      section: string
    }
  }
}

export default function StudentPrintPage() {
  const [user, setUser] = useState<User | null>(null)
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/student/print-data")
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch data")
        }

        const data = await response.json()
        setUser(data.user)
        setTimetableEntries(data.timetableEntries)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!user?.student) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Student profile not found</div>
      </div>
    )
  }

  return (
    <div className="p-8 print:p-2">
      <h1 className="text-3xl font-bold mb-2">My Class Timetable</h1>
      <p className="mb-4 text-muted-foreground">Class: {user.student.class.name} {user.student.class.section}</p>
      
      {timetableEntries.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No timetable entries found.</div>
      ) : (
        <table className="w-full border mt-4">
          <thead>
            <tr>
              <th className="border p-2">Day</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Subject</th>
              <th className="border p-2">Teacher</th>
              <th className="border p-2">Room</th>
            </tr>
          </thead>
          <tbody>
            {timetableEntries.map((entry, i) => (
              <tr key={i}>
                <td className="border p-2">{entry.dayOfWeek}</td>
                <td className="border p-2">{entry.timeSlot.label}</td>
                <td className="border p-2">{entry.subject.name}</td>
                <td className="border p-2">{entry.subject.teacher.user.name}</td>
                <td className="border p-2">{entry.room.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <button 
        className="mt-8 px-6 py-2 bg-blue-600 text-white rounded print:hidden hover:bg-blue-700 transition-colors" 
        onClick={() => window.print()}
      >
        Print Timetable
      </button>
    </div>
  )
} 