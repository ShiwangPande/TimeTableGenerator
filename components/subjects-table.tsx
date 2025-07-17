"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface Subject {
  id: string
  name: string
  multiSlotAllowed: boolean
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

interface SubjectsTableProps {
  subjects: Subject[]
}

export function SubjectsTable({ subjects }: SubjectsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (subject: Subject) => {
    if (!window.confirm(`Are you sure you want to delete subject "${subject.name}"? This action cannot be undone.`)) return
    setDeletingId(subject.id)
    try {
      const response = await fetch(`/api/subjects/${subject.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error && errorData.error.includes("timetable entries")) {
          toast({
            title: "Cannot Delete Subject",
            description: "This subject has associated timetable entries. Remove them first.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to delete subject",
            variant: "destructive",
          })
        }
        return
      }
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subject",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Multi-Slot</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id}>
            <TableCell className="font-medium">{subject.name}</TableCell>
            <TableCell>{subject.teacher.user.name}</TableCell>
            <TableCell>
              {subject.class.name} {subject.class.section}
            </TableCell>
            <TableCell>
              <Badge variant={subject.multiSlotAllowed ? "default" : "secondary"}>
                {subject.multiSlotAllowed ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(subject)} disabled={deletingId === subject.id}>
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
