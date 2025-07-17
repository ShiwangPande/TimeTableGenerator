"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Teacher {
  id: string
  user: {
    name: string
  }
}

interface Class {
  id: string
  name: string
  section: string
}

export function CreateSubjectDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [enumValues, setEnumValues] = useState({
    ibLevels: [] as string[],
    ibGroups: [] as string[],
    subjectCategories: [] as string[],
  })
  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    classId: "",
    multiSlotAllowed: false,
    ibGroup: "",
    level: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // Fetch teachers, classes, and enum values when dialog opens
  useEffect(() => {
    if (open) {
      fetchTeachers()
      fetchClasses()
      fetchEnumValues()
    }
  }, [open])

  const fetchEnumValues = async () => {
    try {
      const response = await fetch("/api/enums")
      if (response.ok) {
        const data = await response.json()
        setEnumValues({
          ibLevels: data.ibLevels || [],
          ibGroups: data.ibGroups || [],
          subjectCategories: data.subjectCategories || [],
        })
      }
    } catch (error) {
      console.error("Error fetching enum values:", error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.teacherId || !formData.classId || !formData.ibGroup || !formData.level) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create subject")
      }

      toast({
        title: "Success",
        description: "Subject created successfully",
      })

      setFormData({ name: "", teacherId: "", classId: "", multiSlotAllowed: false, ibGroup: "", level: "" })
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subject",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>Add a new subject to the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name" 
                className="col-span-3"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter subject name"
                required
              />
            </div>
            {/* Category field removed */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teacher" className="text-right">
                Teacher
              </Label>
              <Select 
                value={formData.teacherId} 
                onValueChange={(value) => handleInputChange("teacherId", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class" className="text-right">
                Class
              </Label>
              <Select 
                value={formData.classId} 
                onValueChange={(value) => handleInputChange("classId", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} - {classItem.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="multiSlot" 
                checked={formData.multiSlotAllowed}
                onCheckedChange={(checked) => handleInputChange("multiSlotAllowed", checked as boolean)}
              />
              <Label htmlFor="multiSlot">Allow multiple slots</Label>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ibGroup" className="text-right">
                IB Group
              </Label>
              <Select
                value={formData.ibGroup}
                onValueChange={(value) => handleInputChange("ibGroup", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select IB Group" />
                </SelectTrigger>
                <SelectContent>
                  {enumValues.ibGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group === "INDIVIDUALS_AND_SOCIETIES" ? "Individuals & Societies" :
                       group === "SCIENCES" ? "Sciences" :
                       group === "LANGUAGES" ? "Languages" :
                       group === "MATHEMATICS" ? "Mathematics" :
                       group === "ARTS" ? "Arts" : group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                IB Level
              </Label>
              <Select
                value={formData.level}
                onValueChange={(value) => handleInputChange("level", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select IB Level" />
                </SelectTrigger>
                <SelectContent>
                  {enumValues.ibLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Subject"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
