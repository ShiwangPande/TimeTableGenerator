"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { EditTeacherDialog } from "./edit-teacher-dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  id: string
  user: {
    name: string
    email: string
  }
  subjects: any[]
}

interface TeachersTableProps {
  teachers: Teacher[]
}

export function TeachersTable({ teachers }: TeachersTableProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setEditOpen(true)
  }

  const handleDelete = async (teacher: Teacher) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${teacher.user.name}"? This action cannot be undone.`)) return
    setDeletingId(teacher.id)
    try {
      const response = await fetch(`/api/teachers/${teacher.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error && errorData.error.includes("associated subjects")) {
          toast({
            title: "Cannot Delete Teacher",
            description: "This teacher has associated subjects. Remove or reassign them first.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to delete teacher",
            variant: "destructive",
          })
        }
        return
      }
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete teacher",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <EditTeacherDialog open={editOpen} onOpenChange={setEditOpen} teacher={selectedTeacher} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell className="font-medium">{teacher.user.name}</TableCell>
              <TableCell>{teacher.user.email}</TableCell>
              <TableCell>{teacher.subjects.length}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(teacher)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(teacher)} disabled={deletingId === teacher.id}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
