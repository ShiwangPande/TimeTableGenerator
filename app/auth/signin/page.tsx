import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export default async function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Timetable Generator</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your timetable</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Development Mode</CardTitle>
            <CardDescription>Choose a role to test the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action="/api/auth/signin" method="POST" className="space-y-4">
              <input type="hidden" name="role" value="ADMIN" />
              <Button type="submit" className="w-full" variant="default">
                Sign in as Admin
              </Button>
            </form>
            
            <form action="/api/auth/signin" method="POST" className="space-y-4">
              <input type="hidden" name="role" value="TEACHER" />
              <Button type="submit" className="w-full" variant="outline">
                Sign in as Teacher
              </Button>
            </form>
            
            <form action="/api/auth/signin" method="POST" className="space-y-4">
              <input type="hidden" name="role" value="STUDENT" />
              <Button type="submit" className="w-full" variant="outline">
                Sign in as Student
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 