"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  Home,
  Users,
  Calendar,
  Clock,
  Settings,
  BookOpen,
  GraduationCap,
  UserCheck,
  ArrowRight,
  CheckCircle,
  Info,
  Sparkles,
  Target,
  MousePointer,
  HandPointer,
  Eye,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right" | "center"
  action?: "click" | "hover" | "scroll" | "focus"
  icon?: React.ReactNode
  tips?: string[]
  highlightColor?: string
  showPointer?: boolean
  showEye?: boolean
  showTarget?: boolean
}

interface TourGuideProps {
  role: "ADMIN" | "TEACHER" | "STUDENT"
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const ADMIN_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "🎉 Welcome to Admin Dashboard",
    description: "You're now in the admin dashboard where you can manage the entire timetable system. Let's explore the key features together!",
    target: "body",
    position: "center",
    icon: <Sparkles className="h-6 w-6 text-blue-500" />,
    highlightColor: "blue"
  },
  {
    id: "navigation",
    title: "🧭 Navigation Menu",
    description: "This sidebar is your command center! Navigate between Teachers, Classes, Subjects, Rooms, and Timetable management.",
    target: "nav",
    position: "right",
    icon: <Users className="h-6 w-6 text-purple-500" />,
    showPointer: true,
    tips: ["Click any menu item to navigate", "The active page is highlighted", "Use this to quickly switch between sections"]
  },
  {
    id: "teachers",
    title: "👨‍🏫 Manage Teachers",
    description: "Add, edit, and manage your teaching staff. This is where you'll create teacher profiles and assign subjects.",
    target: "[data-tour='teachers']",
    position: "bottom",
    icon: <UserCheck className="h-6 w-6 text-green-500" />,
    showTarget: true,
    highlightColor: "green",
    tips: ["Click 'Manage Teachers' to add new staff", "Edit existing teachers by clicking the edit button", "Assign teachers to specific subjects"]
  },
  {
    id: "classes",
    title: "🎓 Manage Classes",
    description: "Create and organize classes by level (IB HL, IB SL, General) and sections. This is your student organization hub.",
    target: "[data-tour='classes']",
    position: "bottom",
    icon: <GraduationCap className="h-6 w-6 text-indigo-500" />,
    showTarget: true,
    highlightColor: "indigo",
    tips: ["Add new classes with different levels", "Assign students to classes", "Organize by curriculum type"]
  },
  {
    id: "subjects",
    title: "📚 Manage Subjects",
    description: "Create subjects and assign them to teachers and classes. This builds your curriculum structure.",
    target: "[data-tour='subjects']",
    position: "bottom",
    icon: <BookOpen className="h-6 w-6 text-orange-500" />,
    showTarget: true,
    highlightColor: "orange",
    tips: ["Categorize subjects (Individual, Societies, Sciences)", "Assign teachers to subjects", "Set up the complete curriculum"]
  },
  {
    id: "timetable",
    title: "📅 Timetable Management",
    description: "Generate and manage the complete timetable. You can drag and drop to swap entries directly - powerful stuff!",
    target: "[data-tour='timetable']",
    position: "bottom",
    icon: <Calendar className="h-6 w-6 text-red-500" />,
    showTarget: true,
    showPointer: true,
    highlightColor: "red",
    tips: ["Use 'Generate Timetable' to create schedules", "Drag and drop entries to swap them instantly", "Filter by class, teacher, or curriculum"]
  },
  {
    id: "swap-requests",
    title: "🔄 Swap Requests",
    description: "Review and manage swap requests from teachers. You have the power to approve or reject requests.",
    target: "[data-tour='swap-requests']",
    position: "bottom",
    icon: <Clock className="h-6 w-6 text-teal-500" />,
    showTarget: true,
    highlightColor: "teal",
    tips: ["View all pending swap requests", "Approve or reject requests", "Add admin notes to requests"]
  },
  {
    id: "complete",
    title: "🎯 You're All Set!",
    description: "Congratulations! You now know how to manage the entire timetable system. Start by creating teachers and classes, then generate your first timetable!",
    target: "body",
    position: "center",
    icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
    highlightColor: "emerald"
  }
]

const TEACHER_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "👋 Welcome to Teacher Portal",
    description: "Welcome to your teacher dashboard! Here you can view your timetable and manage swap requests with other teachers.",
    target: "body",
    position: "center",
    icon: <Sparkles className="h-6 w-6 text-green-500" />,
    highlightColor: "green"
  },
  {
    id: "timetable",
    title: "📋 Your Timetable",
    description: "View your complete weekly schedule. You can see all entries, but only your own subjects are draggable for swap requests.",
    target: "[data-tour='teacher-timetable']",
    position: "bottom",
    icon: <Calendar className="h-6 w-6 text-blue-500" />,
    showTarget: true,
    showEye: true,
    highlightColor: "blue",
    tips: ["Your entries have a blue ring and '(Yours)' label", "Drag your entries to request swaps", "See all teachers' entries to choose swap targets"]
  },
  {
    id: "swap-instructions",
    title: "🔄 How to Request Swaps",
    description: "Follow these steps to request a timetable swap: 1) Find your entry, 2) Drag it to another teacher's entry, 3) Wait for approval.",
    target: "[data-tour='swap-instructions']",
    position: "bottom",
    icon: <ArrowRight className="h-6 w-6 text-purple-500" />,
    showTarget: true,
    showPointer: true,
    highlightColor: "purple",
    tips: ["Only your subjects are draggable", "Both teachers get email notifications", "Approved swaps happen immediately"]
  },
  {
    id: "swap-requests",
    title: "📬 Manage Swap Requests",
    description: "Track all your swap requests - both sent and received. Approve or reject requests from other teachers.",
    target: "[data-tour='teacher-swaps']",
    position: "bottom",
    icon: <Clock className="h-6 w-6 text-orange-500" />,
    showTarget: true,
    highlightColor: "orange",
    tips: ["View sent and received requests", "Approve or reject incoming requests", "Cancel pending requests you've sent"]
  },
  {
    id: "stats",
    title: "📊 Your Statistics",
    description: "View your teaching statistics including total classes, subjects, and hours for the week.",
    target: "[data-tour='teacher-stats']",
    position: "bottom",
    icon: <Info className="h-6 w-6 text-indigo-500" />,
    showTarget: true,
    highlightColor: "indigo"
  },
  {
    id: "complete",
    title: "🚀 Ready to Go!",
    description: "You're all set! Start by exploring your timetable and requesting swaps when needed. Remember to check your swap requests regularly.",
    target: "body",
    position: "center",
    icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
    highlightColor: "emerald"
  }
]

const STUDENT_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "🎓 Welcome to Student Portal",
    description: "Welcome to your student dashboard! Here you can view your class timetable and academic calendar.",
    target: "body",
    position: "center",
    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
    highlightColor: "purple"
  },
  {
    id: "timetable",
    title: "📅 Your Class Timetable",
    description: "View your complete class schedule for the week. See all subjects, teachers, rooms, and time slots.",
    target: "[data-tour='student-timetable']",
    position: "bottom",
    icon: <Calendar className="h-6 w-6 text-blue-500" />,
    showTarget: true,
    showEye: true,
    highlightColor: "blue",
    tips: ["View your daily schedule", "See teacher names and room numbers", "Check time slots for each class"]
  },
  {
    id: "academic-calendar",
    title: "📚 Academic Calendar",
    description: "View important dates including terms, holidays, exams, and events throughout the academic year.",
    target: "[data-tour='academic-calendar']",
    position: "bottom",
    icon: <BookOpen className="h-6 w-6 text-green-500" />,
    showTarget: true,
    highlightColor: "green",
    tips: ["Check term dates and holidays", "View exam periods", "Stay updated with school events"]
  },
  {
    id: "navigation",
    title: "🧭 Navigation",
    description: "Use the sidebar to navigate between your timetable and academic calendar.",
    target: "nav",
    position: "right",
    icon: <Home className="h-6 w-6 text-orange-500" />,
    showPointer: true
  },
  {
    id: "complete",
    title: "✨ All Set!",
    description: "You're ready to explore your timetable and stay organized with your academic schedule!",
    target: "body",
    position: "center",
    icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
    highlightColor: "emerald"
  }
]

export function TourGuide({ role, isOpen, onClose, onComplete }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [showPulse, setShowPulse] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const tourCardRef = useRef<HTMLDivElement>(null)

  const steps = role === "ADMIN" ? ADMIN_TOUR_STEPS : 
                role === "TEACHER" ? TEACHER_TOUR_STEPS : 
                STUDENT_TOUR_STEPS

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  // Role configuration for styling
  const roleConfig = {
    ADMIN: {
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    },
    TEACHER: {
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    STUDENT: {
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700"
    }
  }

  const info = roleConfig[role]

  // Calculate optimal modal position based on target element and viewport
  const calculateModalPosition = (targetElement: HTMLElement) => {
    const rect = targetElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const modalWidth = 400 // Approximate modal width
    const modalHeight = 500 // Approximate modal height
    const padding = 20

    let x = 0
    let y = 0

    // Determine position based on step configuration
    switch (currentStepData.position) {
      case "top":
        x = rect.left + rect.width / 2 - modalWidth / 2
        y = rect.top - modalHeight - padding
        break
      case "bottom":
        x = rect.left + rect.width / 2 - modalWidth / 2
        y = rect.bottom + padding
        break
      case "left":
        x = rect.left - modalWidth - padding
        y = rect.top + rect.height / 2 - modalHeight / 2
        break
      case "right":
        x = rect.right + padding
        y = rect.top + rect.height / 2 - modalHeight / 2
        break
      case "center":
      default:
        x = viewportWidth / 2 - modalWidth / 2
        y = viewportHeight / 2 - modalHeight / 2
        break
    }

    // Ensure modal stays within viewport bounds
    x = Math.max(padding, Math.min(x, viewportWidth - modalWidth - padding))
    y = Math.max(padding, Math.min(y, viewportHeight - modalHeight - padding))

    return { x, y }
  }

  useEffect(() => {
    if (!isOpen) return

    // Highlight the target element
    const targetElement = document.querySelector(currentStepData.target) as HTMLElement
    if (targetElement) {
      setHighlightedElement(targetElement)
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
      
      // Calculate and set modal position
      const position = calculateModalPosition(targetElement)
      setModalPosition(position)
      
      // Add pulse effect
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 2000)
    }

    // Auto-play functionality
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1)
        } else {
          setIsPlaying(false)
        }
      }, 5000) // Increased to 5 seconds

      return () => clearTimeout(timer)
    }
  }, [currentStep, isOpen, isPlaying, currentStepData.target, currentStepData.position, steps.length])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (!isOpen) return null

  const getHighlightColor = () => {
    const color = currentStepData.highlightColor || "blue"
    const colors = {
      blue: "border-blue-500 bg-blue-500/10",
      green: "border-green-500 bg-green-500/10",
      purple: "border-purple-500 bg-purple-500/10",
      red: "border-red-500 bg-red-500/10",
      orange: "border-orange-500 bg-orange-500/10",
      indigo: "border-indigo-500 bg-indigo-500/10",
      teal: "border-teal-500 bg-teal-500/10",
      emerald: "border-emerald-500 bg-emerald-500/10"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Enhanced background with reduced blur for better visibility */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
      />
      
      {/* Subtle animated background pattern */}
      <motion.div
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
        style={{
          backgroundSize: '200% 200%'
        }}
      />

      {/* Enhanced Highlight overlay with better visibility */}
      <AnimatePresence>
        {highlightedElement && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "absolute rounded-lg shadow-2xl transition-all duration-500",
              getHighlightColor(),
              showPulse && "animate-pulse"
            )}
            style={{
              top: highlightedElement.offsetTop - 12,
              left: highlightedElement.offsetLeft - 12,
              width: highlightedElement.offsetWidth + 24,
              height: highlightedElement.offsetHeight + 24,
            }}
          >
            {/* Enhanced Focus indicators */}
            {currentStepData.showPointer && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-6 -left-6 p-2 bg-blue-500 text-white rounded-full shadow-lg"
              >
                <MousePointer className="h-4 w-4" />
              </motion.div>
            )}
            
            {currentStepData.showEye && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-6 -right-6 p-2 bg-green-500 text-white rounded-full shadow-lg"
              >
                <Eye className="h-4 w-4" />
              </motion.div>
            )}
            
            {currentStepData.showTarget && (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-6 -right-6 p-2 bg-purple-500 text-white rounded-full shadow-lg"
              >
                <Target className="h-4 w-4" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Tour card with improved transparency and positioning */}
      <motion.div
        ref={tourCardRef}
        initial={{ opacity: 0, scale: 0.9, x: modalPosition.x, y: modalPosition.y }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          x: modalPosition.x, 
          y: modalPosition.y 
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="absolute w-full max-w-lg max-h-[90vh] overflow-hidden"
        style={{
          left: 0,
          top: 0,
          transform: 'none' // We're using x and y from motion
        }}
      >
        <Card className="shadow-2xl border-0 bg-white/85 backdrop-blur-[4px] overflow-hidden h-full flex flex-col">
          {/* Enhanced Gradient header */}
          <div className={`bg-gradient-to-r ${info.color} p-1 flex-shrink-0`}>
            <CardHeader className="pb-4 bg-white/90 backdrop-blur-[2px] rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${info.color} text-white`}>
                    {currentStepData.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {currentStepData.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Step {currentStep + 1} of {steps.length}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Enhanced Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Progress
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-3 bg-gray-200" />
                  <motion.div
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </CardHeader>
          </div>

          <CardContent className="space-y-4 p-6 flex-1 overflow-y-auto bg-white/80 backdrop-blur-[2px]">
            <CardDescription className="text-base leading-relaxed text-gray-700">
              {currentStepData.description}
            </CardDescription>

            {/* Enhanced Tips */}
            {currentStepData.tips && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-50/90 to-purple-50/90 border border-blue-200/80 rounded-xl p-4 backdrop-blur-[2px]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-900">Pro Tips</span>
                </div>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-sm text-blue-800 flex items-start gap-3"
                    >
                      <span className="text-blue-500 mt-1 text-lg">•</span>
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Enhanced Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200/80 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-2 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  className="gap-2 hover:bg-gray-50"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Auto-play
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="gap-2 text-gray-500 hover:text-gray-700"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip Tour
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 