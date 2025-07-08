"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MousePointer, Users, Clock } from "lucide-react"

interface SwapInstructionsProps {
  userRole: "ADMIN" | "TEACHER" | "STUDENT"
}

export function SwapInstructions({ userRole }: SwapInstructionsProps) {
  if (userRole === "STUDENT") {
    return null // Students can't swap
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Users className="h-5 w-5" />
          How to Swap Timetable Entries
        </CardTitle>
        <CardDescription className="text-blue-700">
          {userRole === "ADMIN" 
            ? "Drag and drop to directly swap timetable entries"
            : "Request timetable swaps from other teachers"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userRole === "ADMIN" ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Drag an Entry</p>
                <p className="text-xs text-blue-700">Click and drag any timetable entry to start the swap</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Drop on Target</p>
                <p className="text-xs text-blue-700">Drop it on another entry to swap their subjects</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Confirm Swap</p>
                <p className="text-xs text-blue-700">The swap happens immediately and is saved</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800 font-medium">
                💡 <strong>Tip:</strong> You can only swap entries that have the same time slot duration
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Find Your Entry</p>
                <p className="text-xs text-blue-700">Locate one of your timetable entries (your subjects only - these are draggable)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Drag Your Entry</p>
                <p className="text-xs text-blue-700">Click and drag your entry to another teacher's entry</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Drop to Request</p>
                <p className="text-xs text-blue-700">Drop it on the target entry to create a swap request</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Wait for Approval</p>
                <p className="text-xs text-blue-700">The other teacher will receive an email and must approve</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                5
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Track Requests</p>
                <p className="text-xs text-blue-700">Go to "Manage Swap Requests" to see all your requests</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800 font-medium">
                💡 <strong>Tips:</strong>
              </p>
              <ul className="text-xs text-blue-800 mt-1 space-y-1">
                <li>• You can see all timetable entries but only drag your own subjects</li>
                <li>• Your entries will have a blue ring and "(Yours)" label</li>
                <li>• Your entries will be draggable, other teachers' entries won't be</li>
                <li>• Both teachers get email notifications automatically</li>
                <li>• You can cancel pending requests you've sent</li>
                <li>• Approved swaps happen immediately</li>
                <li>• Go to "Manage Swap Requests" to track all your requests</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            <MousePointer className="h-3 w-3 mr-1" />
            Interactive
          </Badge>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 