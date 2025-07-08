"use client"

import { motion, AnimatePresence } from "framer-motion"
import { 
  MousePointer, 
  Eye, 
  Target, 
  HandPointer, 
  ArrowRight,
  CheckCircle,
  Info,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TourFocusIndicatorProps {
  element: HTMLElement | null
  showPointer?: boolean
  showEye?: boolean
  showTarget?: boolean
  showHand?: boolean
  showArrow?: boolean
  showCheck?: boolean
  showInfo?: boolean
  showZap?: boolean
  color?: string
  isVisible: boolean
}

const colorConfig = {
  blue: {
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    icon: "text-blue-500",
    badge: "bg-blue-500"
  },
  green: {
    border: "border-green-500",
    bg: "bg-green-500/10",
    icon: "text-green-500",
    badge: "bg-green-500"
  },
  purple: {
    border: "border-purple-500",
    bg: "bg-purple-500/10",
    icon: "text-purple-500",
    badge: "bg-purple-500"
  },
  red: {
    border: "border-red-500",
    bg: "bg-red-500/10",
    icon: "text-red-500",
    badge: "bg-red-500"
  },
  orange: {
    border: "border-orange-500",
    bg: "bg-orange-500/10",
    icon: "text-orange-500",
    badge: "bg-orange-500"
  },
  indigo: {
    border: "border-indigo-500",
    bg: "bg-indigo-500/10",
    icon: "text-indigo-500",
    badge: "bg-indigo-500"
  },
  teal: {
    border: "border-teal-500",
    bg: "bg-teal-500/10",
    icon: "text-teal-500",
    badge: "bg-teal-500"
  },
  emerald: {
    border: "border-emerald-500",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-500",
    badge: "bg-emerald-500"
  }
}

export function TourFocusIndicator({
  element,
  showPointer = false,
  showEye = false,
  showTarget = false,
  showHand = false,
  showArrow = false,
  showCheck = false,
  showInfo = false,
  showZap = false,
  color = "blue",
  isVisible
}: TourFocusIndicatorProps) {
  if (!element || !isVisible) return null

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "absolute rounded-lg shadow-2xl transition-all duration-500",
          config.border,
          config.bg
        )}
        style={{
          top: element.offsetTop - 12,
          left: element.offsetLeft - 12,
          width: element.offsetWidth + 24,
          height: element.offsetHeight + 24,
        }}
      >
        {/* Pulse animation */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg border-2",
            config.border
          )}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Focus indicators */}
        {showPointer && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -top-8 -left-8 p-3 bg-blue-500 text-white rounded-full shadow-lg"
          >
            <MousePointer className="h-5 w-5" />
          </motion.div>
        )}
        
        {showEye && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
            className="absolute -top-8 -right-8 p-3 bg-green-500 text-white rounded-full shadow-lg"
          >
            <Eye className="h-5 w-5" />
          </motion.div>
        )}
        
        {showTarget && (
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity
            }}
            className="absolute -bottom-8 -right-8 p-3 bg-purple-500 text-white rounded-full shadow-lg"
          >
            <Target className="h-5 w-5" />
          </motion.div>
        )}

        {showHand && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.3
            }}
            className="absolute -bottom-8 -left-8 p-3 bg-orange-500 text-white rounded-full shadow-lg"
          >
            <HandPointer className="h-5 w-5" />
          </motion.div>
        )}

        {showArrow && (
          <motion.div
            animate={{ 
              x: [0, 5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-1/2 -right-12 p-2 bg-indigo-500 text-white rounded-full shadow-lg"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        )}

        {showCheck && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 p-3 bg-emerald-500 text-white rounded-full shadow-lg"
          >
            <CheckCircle className="h-5 w-5" />
          </motion.div>
        )}

        {showInfo && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.7
            }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 p-3 bg-teal-500 text-white rounded-full shadow-lg"
          >
            <Info className="h-5 w-5" />
          </motion.div>
        )}

        {showZap && (
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 bg-yellow-500 text-white rounded-full shadow-lg"
          >
            <Zap className="h-4 w-4" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 