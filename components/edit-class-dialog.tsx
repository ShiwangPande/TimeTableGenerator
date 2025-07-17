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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Class {
  id: string
  name: string
  level: string
  section: string
}

interface EditClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classData: Class | null
}

export function EditClassDialog({ open, onOpenChange, classData }: EditClassDialogProps) {
  const [loading, setLoading] = useState(false)
  const [classLevels, setClassLevels] = useState<string[]>([])
  const [formData, setFormData] = useState({
    grade: "",
    level: "",
    section: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // Fetch enum values when dialog opens
  useEffect(() => {
    if (open) {
      fetchEnumValues()
    }
  }, [open])

  // Update form data when classData changes
  useEffect(() => {
    if (classData) {
      setFormData({
        grade: classData.grade?.toString() ?? "",
        level: classData.level,
        section: classData.section,
      })
    }
  }, [classData])

  const fetchEnumValues = async () => {
    try {
      const response = await fetch("/api/enums")
      if (response.ok) {
        const data = await response.json()
        setClassLevels(data.classLevels || [])
      }
    } catch (error) {
      console.error("Error fetching enum values:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!classData || !formData.grade.trim() || !formData.level || !formData.section.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`/api/classes/${classData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          grade: Number(formData.grade),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update class")
      }

      toast({
        title: "Success",
        description: "Class updated successfully",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update class",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update the class details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Grade
              </Label>
              <Input
                id="grade"
                className="col-span-3"
                type="number"
                min="1"
                step="1"
                value={formData.grade}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  handleInputChange("grade", value)
                }}
                placeholder="Enter grade (number only)"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                Level
              </Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => handleInputChange("level", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {classLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === "IB_MYP" ? "IB MYP" : 
                       level === "IB_DP" ? "IB DP" : 
                       level === "Gen" ? "General" : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="section" className="text-right">
                Section
              </Label>
              <Input 
                id="section" 
                className="col-span-3"
                value={formData.section}
                onChange={(e) => handleInputChange("section", e.target.value)}
                placeholder="Enter section"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Class"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 