"use client"

import { WelcomeTour } from "./welcome-tour"

interface AdminWelcomeTourProps {
  user: any
}

export function AdminWelcomeTour({ user }: AdminWelcomeTourProps) {
  return (
    <WelcomeTour 
      userRole="ADMIN" 
      userName={user?.name}
    />
  )
} 