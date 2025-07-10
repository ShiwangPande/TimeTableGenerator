import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, ArrowRight } from "lucide-react"

export default async function StudentOnboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // If user already has a student profile, redirect to student dashboard
  if (user.student) {
    redirect('/student')
  }

  // If user is not a student, redirect to home
  if (user.role !== 'STUDENT') {
    redirect('/')
  }

  // Fetch all classes for selection
  const classes = await prisma.class.findMany({
    select: { id: true, name: true, section: true, level: true },
    orderBy: [{ level: "asc" }, { name: "asc" }, { section: "asc" }],
  })

  async function handleAssignClass(formData: FormData) {
    "use server"
    const classId = formData.get("classId") as string
    const fullName = formData.get("fullName") as string
    
    if (!classId || !fullName) return
    
    // Update user name and create student profile in a transaction
    if (!user) {
      throw new Error("User not found");
    }
    const existingStudent = await prisma.student.findUnique({
      where: { userId: user.id }
    });
    if (existingStudent) {
      redirect('/student');
    }
    await prisma.$transaction(async (tx) => {
      // Update the user's name
      if (!user) {
        throw new Error("User not found");
      }
      await tx.user.update({
        where: { id: user.id },
        data: { name: fullName.trim() }
      })
      // Create student profile
      await tx.student.create({
        data: {
          userId: user.id,
          classId,
        },
      })
    })
    
    revalidatePath("/student")
    redirect("/student")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
            <GraduationCap className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-900">
            Complete Your Student Profile
          </CardTitle>
          <CardDescription className="text-orange-700">
            Please provide your full name and select your class to get started with your academic journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleAssignClass} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-orange-700">
                Full Name
              </Label>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                defaultValue={user?.name || ""}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classId" className="text-sm font-medium text-orange-700">
                Select Your Class
              </Label>
              <Select name="classId" required>
                <SelectTrigger className="border-orange-200 focus:ring-orange-400">
                  <SelectValue placeholder="Choose your class" />
                </SelectTrigger>
                <SelectContent className="bg-orange-50">
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id} className="text-orange-900 hover:bg-orange-100">
                      {cls.name} {cls.section} ({cls.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-red-400 text-white"
            >
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 