export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"
import { SwapRequestsTable } from "@/components/swap-requests-table"
import { SwapInstructions } from "@/components/swap-instructions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"

export default async function TeacherSwapRequestsPage() {
  await requireRole(Role.TEACHER)
  const user = await getCurrentUser()

  if (!user) {
    return <div>User not found</div>
  }

  // Get swap requests for this teacher
  const [sentRequests, receivedRequests] = await Promise.all([
    prisma.swapRequest.findMany({
      where: { requesterId: user.id },
      include: {
        requester: true,
        target: true,
        fromEntry: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: { user: true }
                }
              }
            },
            class: true,
            room: true,
            timeSlot: true
          }
        },
        toEntry: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: { user: true }
                }
              }
            },
            class: true,
            room: true,
            timeSlot: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.swapRequest.findMany({
      where: { targetId: user.id },
      include: {
        requester: true,
        target: true,
        fromEntry: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: { user: true }
                }
              }
            },
            class: true,
            room: true,
            timeSlot: true
          }
        },
        toEntry: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: { user: true }
                }
              }
            },
            class: true,
            room: true,
            timeSlot: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ])

  const pendingReceived = receivedRequests.filter(r => r.status === "PENDING").length
  const totalSent = sentRequests.length
  const totalReceived = receivedRequests.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
        <p className="text-muted-foreground">
          Manage timetable slot swap requests with other teachers
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3" data-tour="teacher-swaps">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground">
              Total requests sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReceived}</div>
            <p className="text-xs text-muted-foreground">
              Total requests received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReceived}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Swap Instructions */}
      <div data-tour="swap-instructions">
        <SwapInstructions userRole="TEACHER" />
      </div>

      {/* Swap Requests Tabs */}
      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Received Requests ({totalReceived})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent Requests ({totalSent})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Received Swap Requests</CardTitle>
              <CardDescription>
                Requests from other teachers to swap timetable slots with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SwapRequestsTable 
                requests={receivedRequests} 
                userRole={user.role} 
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Swap Requests</CardTitle>
              <CardDescription>
                Your requests to swap timetable slots with other teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SwapRequestsTable 
                requests={sentRequests} 
                userRole={user.role} 
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 