"use client"

import { TourButton } from "./tour-button"

export function StudentTourButton() {
  return (
    <TourButton 
      role="STUDENT" 
      variant="outline" 
      size="sm"
      className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
    />
  )
} 