"use client"

import { useEffect, useState } from "react"
import { useTour } from "./tour-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  X, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Clock,
  Settings,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  Rocket
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WelcomeTourProps {
  userRole: "ADMIN" | "TEACHER" | "STUDENT"
  userName?: string
}

const roleInfo = {
  ADMIN: {
    title: "🎉 Welcome to Admin Dashboard",
    description: "You have full control over the timetable system. Let's get you started with powerful management tools!",
    icon: <Settings className="h-8 w-8 text-blue-600" />,
    color: "from-blue-500 to-purple-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    features: [
      "Manage teachers, classes, and subjects",
      "Generate and edit timetables",
      "Handle swap requests from teachers",
      "Export and print schedules"
    ],
    emoji: "👨‍💼"
  },
  TEACHER: {
    title: "👋 Welcome to Teacher Portal",
    description: "Manage your teaching schedule and swap requests with other teachers. Your classroom, your rules!",
    icon: <Users className="h-8 w-8 text-green-600" />,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    features: [
      "View your complete timetable",
      "Request swaps with other teachers",
      "Manage incoming swap requests",
      "Track your teaching statistics"
    ],
    emoji: "👨‍🏫"
  },
  STUDENT: {
    title: "🎓 Welcome to Student Portal",
    description: "Access your class schedule and academic calendar. Stay organized and never miss a class!",
    icon: <GraduationCap className="h-8 w-8 text-purple-600" />,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    features: [
      "View your class timetable",
      "Check academic calendar",
      "Download your schedule",
      "Track important dates"
    ],
    emoji: "👨‍🎓"
  }
}

export function WelcomeTour({ userRole, userName }: WelcomeTourProps) {
  const { startTour } = useTour()
  const [isVisible, setIsVisible] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)

  const info = roleInfo[userRole]

  useEffect(() => {
    // Check if user has seen the welcome tour
    const welcomeKey = `welcome-seen-${userRole.toLowerCase()}`
    const hasSeen = localStorage.getItem(welcomeKey)
    
    if (!hasSeen) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [userRole])

  const handleStartTour = () => {
    startTour(userRole)
    setIsVisible(false)
  }

  const handleSkip = () => {
    const welcomeKey = `welcome-seen-${userRole.toLowerCase()}`
    localStorage.setItem(welcomeKey, "true")
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="tour-overlay bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="w-full max-w-lg tour-container"
        >
          <Card className="welcome-tour-card shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${info.color} p-1 flex-shrink-0`}>
              <CardHeader className="text-center pb-4 bg-white rounded-t-lg relative">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <motion.div 
                  className="flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <div className={`p-4 rounded-full ${info.bgColor} border-4 ${info.borderColor} shadow-lg`}>
                    {info.icon}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardTitle className="text-2xl font-bold mb-2">
                    {info.title}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    {userName && `Welcome back, ${userName}! `}{info.description}
                  </CardDescription>
                </motion.div>

                {/* Floating emoji */}
                <motion.div
                  className="absolute top-4 right-4 text-3xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {info.emoji}
                </motion.div>
              </CardHeader>
            </div>

            <CardContent className="space-y-4 p-6 flex-1 overflow-y-auto">
              {/* Features */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${info.color} text-white`}>
                    <Zap className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">What you can do:</h3>
                </div>
                
                <div className="space-y-2">
                  {info.features.map((feature, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className={`p-1.5 rounded-lg ${info.bgColor} ${info.borderColor} border`}>
                        <CheckCircle className={`h-4 w-4 ${info.textColor}`} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex items-center justify-between pt-4 border-t border-gray-200 flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 gap-1 text-sm"
                >
                  <X className="h-3 w-3" />
                  Skip
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Star className="h-3 w-3" />
                      New
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Rocket className="h-3 w-3" />
                      Interactive
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={handleStartTour}
                    className={`bg-gradient-to-r ${info.color} hover:shadow-lg text-white gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105`}
                  >
                    <Play className="h-4 w-4" />
                    Start Tour
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 