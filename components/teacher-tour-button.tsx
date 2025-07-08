"use client"

import { TourButton } from "./tour-button"

export function TeacherTourButton() {
  return (
    <TourButton 
      role="TEACHER" 
      variant="outline" 
      size="sm"
      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
    />
  )
} 