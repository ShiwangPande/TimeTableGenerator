"use client"

import { WelcomeTour } from "./welcome-tour"

interface TeacherWelcomeTourProps {
  user: any
}

export function TeacherWelcomeTour({ user }: TeacherWelcomeTourProps) {
  return (
    <WelcomeTour 
      userRole="TEACHER" 
      userName={user?.name}
    />
  )
} 