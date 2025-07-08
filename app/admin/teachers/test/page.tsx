import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function TestTeachersPage() {
  await requireRole(Role.ADMIN)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Teachers Page</h1>
        <p className="text-muted-foreground">Testing for context errors</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simple Test</CardTitle>
          <CardDescription>Testing basic components</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </div>
  )
} 