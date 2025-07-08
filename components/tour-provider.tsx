"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { TourGuide } from "./tour-guide"

interface TourContextType {
  startTour: (role: "ADMIN" | "TEACHER" | "STUDENT") => void
  isTourOpen: boolean
  currentRole: "ADMIN" | "TEACHER" | "STUDENT" | null
  closeTour: () => void
  completeTour: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<"ADMIN" | "TEACHER" | "STUDENT" | null>(null)

  const startTour = (role: "ADMIN" | "TEACHER" | "STUDENT") => {
    setCurrentRole(role)
    setIsTourOpen(true)
    // Save to localStorage to remember user has seen the tour
    localStorage.setItem(`tour-completed-${role.toLowerCase()}`, "false")
  }

  const closeTour = () => {
    setIsTourOpen(false)
    setCurrentRole(null)
  }

  const completeTour = () => {
    if (currentRole) {
      localStorage.setItem(`tour-completed-${currentRole.toLowerCase()}`, "true")
    }
    setIsTourOpen(false)
    setCurrentRole(null)
  }

  return (
    <TourContext.Provider value={{
      startTour,
      isTourOpen,
      currentRole,
      closeTour,
      completeTour
    }}>
      {children}
      {isTourOpen && currentRole && (
        <TourGuide
          role={currentRole}
          isOpen={isTourOpen}
          onClose={closeTour}
          onComplete={completeTour}
        />
      )}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider")
  }
  return context
} 