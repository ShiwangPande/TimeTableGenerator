"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { EditTeacherDialog } from "./edit-teacher-dialog"
import { useState } from "react"

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

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setEditOpen(true)
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
                  <Button size="sm" variant="outline">
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
