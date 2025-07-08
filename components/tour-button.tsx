"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, HelpCircle, Sparkles } from "lucide-react"
import { useTour } from "./tour-provider"
import { motion } from "framer-motion"

interface TourButtonProps {
  role: "ADMIN" | "TEACHER" | "STUDENT"
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  showBadge?: boolean
  className?: string
}

const roleConfig = {
  ADMIN: {
    gradient: "from-blue-500 to-purple-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    hoverColor: "hover:bg-blue-100",
    badgeColor: "bg-blue-500"
  },
  TEACHER: {
    gradient: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    hoverColor: "hover:bg-green-100",
    badgeColor: "bg-green-500"
  },
  STUDENT: {
    gradient: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    hoverColor: "hover:bg-purple-100",
    badgeColor: "bg-purple-500"
  }
}

export function TourButton({ 
  role, 
  variant = "outline", 
  size = "default",
  showBadge = true,
  className 
}: TourButtonProps) {
  const { startTour } = useTour()
  const config = roleConfig[role]

  return (
    <motion.div 
      className="relative inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant={variant}
        size={size}
        onClick={() => startTour(role)}
        className={`${config.bgColor} ${config.borderColor} ${config.textColor} ${config.hoverColor} border-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <Play className="h-4 w-4 mr-2" />
        </motion.div>
        Start Tour
      </Button>
      
      {showBadge && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Badge 
            className={`absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs text-white ${config.badgeColor} shadow-lg`}
          >
            <HelpCircle className="h-3 w-3" />
          </Badge>
        </motion.div>
      )}
      
      {/* Floating sparkles effect */}
      <motion.div
        className="absolute -top-1 -left-1 text-yellow-400"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Sparkles className="h-4 w-4" />
      </motion.div>
    </motion.div>
  )
} 