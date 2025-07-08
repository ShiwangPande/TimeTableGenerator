"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface NotificationBadgeProps {
  count: number
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
  showIcon?: boolean
}

export function NotificationBadge({ 
  count, 
  variant = "destructive", 
  className = "",
  showIcon = true 
}: NotificationBadgeProps) {
  if (count === 0) return null

  return (
    <Badge 
      variant={variant} 
      className={`${className} ${count > 9 ? 'min-w-[20px]' : 'min-w-[16px]'} h-5 text-xs font-bold`}
    >
      {showIcon && <Bell className="h-3 w-3 mr-1" />}
      {count > 99 ? '99+' : count}
    </Badge>
  )
}

interface SwapRequestNotificationProps {
  userId: string
  userRole: "ADMIN" | "TEACHER" | "STUDENT"
}

export function SwapRequestNotification({ userId, userRole }: SwapRequestNotificationProps) {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        let url = "/api/timetable/swap?status=PENDING"
        
        if (userRole === "TEACHER") {
          url += "&type=received"
        }
        
        const response = await fetch(url)
        if (response.ok) {
          const requests = await response.json()
          setPendingCount(requests.length)
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userRole === "TEACHER" || userRole === "ADMIN") {
      fetchPendingRequests()
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingRequests, 30000)
      return () => clearInterval(interval)
    }
  }, [userId, userRole])

  if (loading || userRole === "STUDENT") return null

  return (
    <NotificationBadge 
      count={pendingCount} 
      variant="destructive"
      className="animate-pulse"
    />
  )
} 