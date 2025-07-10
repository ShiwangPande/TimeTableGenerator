"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SwapRequestNotification } from "@/components/notification-badge"
import { Menu } from "lucide-react"
import { useRouter } from "next/navigation"

let signOut: (() => void) | undefined
signOut = require("@clerk/nextjs").signOut

const isDev = process.env.NODE_ENV === "development"

interface TopNavProps {
  user?: {
    id: string
    name: string
    role: "ADMIN" | "TEACHER" | "STUDENT"
  }
  onMenuClick?: () => void
}

export function TopNav({ user, onMenuClick }: TopNavProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (signOut) {
        await signOut({ redirectUrl: "/" });
        // Fallback: force reload in case Clerk's redirect does not work
        window.location.href = "/";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      window.location.href = "/";
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 shadow-sm border-b backdrop-blur-md">
      <div className="flex items-center justify-between px-2 sm:px-6 py-3 sm:py-4 min-h-[56px]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile menu button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <h1 className="text-lg sm:text-xl font-heading font-semibold truncate max-w-[40vw] md:max-w-xs">Timetable Generator</h1>
          {user && (
            <span className="text-xs sm:text-sm text-muted-foreground ml-2 truncate max-w-[30vw] md:max-w-xs">
              Welcome, {user.name} <span className="hidden sm:inline">({user.role})</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user && (user.role === "TEACHER" || user.role === "ADMIN") && (
            <div className="flex items-center space-x-2">
              {/* Only show Notifications: if SwapRequestNotification is not empty */}
              <SwapRequestNotification userId={user.id} userRole={user.role} />
            </div>
          )}
          {isDev && (
            <span className="text-xs sm:text-sm text-muted-foreground">Development Mode</span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm px-2 sm:px-4"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </header>
  )
}
