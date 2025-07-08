"use client"

import { WelcomeTour } from "./welcome-tour"

interface StudentWelcomeTourProps {
  user: any
}

export function StudentWelcomeTour({ user }: StudentWelcomeTourProps) {
  return (
    <WelcomeTour 
      userRole="STUDENT" 
      userName={user?.name}
    />
  )
} 