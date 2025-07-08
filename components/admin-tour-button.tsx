"use client"

import { TourButton } from "./tour-button"

export function AdminTourButton() {
  return (
    <TourButton 
      role="ADMIN" 
      variant="outline" 
      size="sm"
      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
    />
  )
} 