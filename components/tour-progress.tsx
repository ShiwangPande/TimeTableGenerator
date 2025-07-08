"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  CheckCircle, 
  Circle, 
  Star,
  Trophy,
  Rocket
} from "lucide-react"

interface TourProgressProps {
  currentStep: number
  totalSteps: number
  role: "ADMIN" | "TEACHER" | "STUDENT"
}

const roleConfig = {
  ADMIN: {
    gradient: "from-blue-500 to-purple-600",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  TEACHER: {
    gradient: "from-green-500 to-emerald-600",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  STUDENT: {
    gradient: "from-purple-500 to-pink-600",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
}

export function TourProgress({ currentStep, totalSteps, role }: TourProgressProps) {
  const config = roleConfig[role]
  const progress = ((currentStep + 1) / totalSteps) * 100
  const isComplete = currentStep === totalSteps - 1

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}
          >
            <Zap className={`h-4 w-4 ${config.color}`} />
          </motion.div>
          <span className="text-sm font-semibold text-gray-700">Tour Progress</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs gap-1">
            <Star className="h-3 w-3" />
            {role}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs gap-1 ${config.color} ${config.borderColor}`}
          >
            <Rocket className="h-3 w-3" />
            Interactive
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Circle className="h-3 w-3" />
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        
        <div className="relative">
          <Progress value={progress} className="h-3 bg-gray-200" />
          <motion.div
            className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${config.gradient} rounded-full`}
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          
          {/* Progress indicator dots */}
          <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-between px-1">
            {Array.from({ length: totalSteps }, (_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep 
                    ? `bg-gradient-to-r ${config.gradient}` 
                    : 'bg-gray-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Completion indicator */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Trophy className="h-5 w-5 text-emerald-600" />
          </motion.div>
          <span className="text-sm font-medium text-emerald-700">
            Tour completed! You're ready to go! 🎉
          </span>
        </motion.div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <CheckCircle className="h-3 w-3" />
        <span>
          {currentStep + 1} of {totalSteps} steps completed
        </span>
      </div>
    </div>
  )
} 