"use client"

import { ReactNode } from "react"
import { DndProvider } from "@/components/dnd-provider"

interface ProvidersSimpleProps {
  children: ReactNode
}

export function ProvidersSimple({ children }: ProvidersSimpleProps) {
  return (
    <DndProvider>
      {children}
    </DndProvider>
  )
} 