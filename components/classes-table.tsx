"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { EditClassDialog } from "./edit-class-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Class {
  id: string
  name: string
  level: string
  section: string
  subjects: any[]
  students: any[]
}

interface ClassesTableProps {
  classes: Class[]
}

export function ClassesTable({ classes }: ClassesTableProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls)
    setEditOpen(true)
  }

  const handleDelete = async (cls: Class) => {
    if (!confirm(`Are you sure you want to delete class "${cls.name} - ${cls.section}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/classes/${cls.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete class")
      }

      toast({
        title: "Success",
        description: "Class deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete class",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <EditClassDialog 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        classData={selectedClass} 
      />
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Subjects</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((cls) => (
          <TableRow key={cls.id}>
            <TableCell className="font-medium">{cls.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{cls.level}</Badge>
            </TableCell>
            <TableCell>{cls.section}</TableCell>
            <TableCell>{cls.subjects.length}</TableCell>
            <TableCell>{cls.students.length}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(cls)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(cls)}
                >
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
