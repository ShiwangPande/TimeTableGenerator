"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface Subject {
  id: string
  name: string
  category: string
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
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
            <TableCell>
              <Badge variant="outline">{subject.category}</Badge>
            </TableCell>
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
