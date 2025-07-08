"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Clock, AlertCircle } from "lucide-react"
import { SwapRequestStatus } from "@prisma/client"

interface SwapRequest {
  id: string
  status: SwapRequestStatus
  reason?: string
  adminNotes?: string
  createdAt: string
  requester: {
    name: string
    email: string
  }
  target: {
    name: string
    email: string
  }
  fromEntry: {
    subject: {
      name: string
      teacher: {
        user: {
          name: string
        }
      }
    }
    class: {
      name: string
      section: string
    }
    room: {
      name: string
    }
    timeSlot: {
      label: string
    }
    dayOfWeek: string
  }
  toEntry: {
    subject: {
      name: string
      teacher: {
        user: {
          name: string
      }
    }
  }
    class: {
      name: string
      section: string
    }
    room: {
      name: string
    }
    timeSlot: {
      label: string
    }
    dayOfWeek: string
  }
}

interface SwapRequestsTableProps {
  requests: SwapRequest[]
  userRole: "ADMIN" | "TEACHER" | "STUDENT"
  currentUserId: string
}

const getStatusBadge = (status: SwapRequestStatus) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>
    case "APPROVED":
      return <Badge variant="default" className="flex items-center gap-1"><Check className="h-3 w-3" />Approved</Badge>
    case "REJECTED":
      return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" />Rejected</Badge>
    case "CANCELLED":
      return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function SwapRequestsTable({ requests, userRole, currentUserId }: SwapRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateStatus = async (requestId: string, status: SwapRequestStatus) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/timetable/swap", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          status,
          adminNotes: adminNotes || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update swap request")
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating swap request:", error)
      alert("Failed to update swap request")
    } finally {
      setIsUpdating(false)
      setSelectedRequest(null)
      setAdminNotes("")
    }
  }

  const canApprove = (request: SwapRequest) => {
    return userRole === "ADMIN" || request.target.id === currentUserId
  }

  const canReject = (request: SwapRequest) => {
    return userRole === "ADMIN" || request.target.id === currentUserId
  }

  const canCancel = (request: SwapRequest) => {
    return request.requester.id === currentUserId && request.status === "PENDING"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Swap Requests</CardTitle>
          <CardDescription>
            Manage timetable slot swap requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{request.fromEntry.subject.name}</div>
                      <div className="text-muted-foreground">
                        {request.fromEntry.class.name} {request.fromEntry.class.section}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.fromEntry.dayOfWeek} {request.fromEntry.timeSlot.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Room: {request.fromEntry.room.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{request.toEntry.subject.name}</div>
                      <div className="text-muted-foreground">
                        {request.toEntry.class.name} {request.toEntry.class.section}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.toEntry.dayOfWeek} {request.toEntry.timeSlot.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Room: {request.toEntry.room.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{request.requester.name}</div>
                      <div className="text-muted-foreground">{request.requester.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{request.target.name}</div>
                      <div className="text-muted-foreground">{request.target.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {request.reason || "No reason provided"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {request.status === "PENDING" && (
                        <>
                          {canApprove(request) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="default">
                                  <Check className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Approve Swap Request</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to approve this swap request? This will immediately swap the timetable entries.
                                  </DialogDescription>
                                </DialogHeader>
                                {userRole === "ADMIN" && (
                                  <Textarea
                                    placeholder="Add admin notes (optional)"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                  />
                                )}
                                <DialogFooter>
                                  <Button
                                    onClick={() => handleUpdateStatus(request.id, "APPROVED")}
                                    disabled={isUpdating}
                                  >
                                    Approve
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {canReject(request) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <X className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Swap Request</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to reject this swap request?
                                  </DialogDescription>
                                </DialogHeader>
                                {userRole === "ADMIN" && (
                                  <Textarea
                                    placeholder="Add admin notes (optional)"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                  />
                                )}
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleUpdateStatus(request.id, "REJECTED")}
                                    disabled={isUpdating}
                                  >
                                    Reject
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {canCancel(request) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(request.id, "CANCELLED")}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {requests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No swap requests found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 