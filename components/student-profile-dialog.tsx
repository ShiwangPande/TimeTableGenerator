"use client"

import { useState } from "react"
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
import { Edit, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Select } from "@/components/ui/select"
import { useEffect } from "react"

interface StudentProfileDialogProps {
  currentName: string
  trigger?: React.ReactNode
}

export function StudentProfileDialog({ currentName, trigger }: StudentProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(currentName)
  const [classId, setClassId] = useState("")
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(false)
  const [classesError, setClassesError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setClassesLoading(true)
      setClassesError("")
      fetch("/api/classes")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setClasses(data)
          else if (data && data.error) {
            setClasses([])
            setClassesError(data.error)
          } else {
            setClasses([])
            setClassesError("Unexpected response from server.")
          }
        })
        .catch(() => {
          setClasses([])
          setClassesError("Failed to fetch classes.")
        })
        .finally(() => setClassesLoading(false))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      })
      return
    }
    if (!classId) {
      toast({
        title: "Error",
        description: "Class is required",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName: fullName.trim(), classId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }
      const result = await response.json()
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your full name and class. This will be displayed throughout the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classId" className="text-right">
                Class
              </Label>
              <div className="col-span-3">
                {classesLoading ? (
                  <span className="text-sm text-gray-500">Loading classes...</span>
                ) : classesError ? (
                  <span className="text-sm text-red-500">{classesError}</span>
                ) : (
                  <select
                    id="classId"
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    required
                  >
                    <option value="">Select class</option>
                    {Array.isArray(classes) && classes.length > 0 ? (
                      classes.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} {cls.section}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No classes available</option>
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 