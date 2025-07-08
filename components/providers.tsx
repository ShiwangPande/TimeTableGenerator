"use client"

import { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { DndProvider } from "@/components/dnd-provider"
import { TourProvider } from "@/components/tour-provider"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme="light"
    >
      <DndProvider>
        <TourProvider>
          {children}
        </TourProvider>
      </DndProvider>
    </ThemeProvider>
  )
} 