"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SimpleCalendar } from "@/components/simple-calendar"
import { SwapRequestNotification } from "@/components/notification-badge"
import { Logo } from "@/components/ui/logo"
import {
  Calendar,
  Users,
  BookOpen,
  MapPin,
  Clock,
  LayoutDashboard,
  GraduationCap,
  Download,
  Printer,
  Settings,
  Filter,
  RefreshCw,
  HelpCircle,
  X,
  ChevronRight,
  Menu,
  Minimize2,
  Maximize2
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface SidebarProps {
  role: "ADMIN" | "TEACHER" | "STUDENT"
  userId?: string
  onClose?: () => void
  isDrawer?: boolean
  currentPath?: string
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

interface NavItem {
  href: string
  label: string
  icon: any
  showNotification?: boolean
  badge?: string
  description?: string
  group?: string
}

const roleTheme = {
  ADMIN: {
    gradient: "from-orange-50 via-orange-100/80 to-red-50/60 dark:from-orange-900 dark:via-orange-800 dark:to-red-900/80",
    headerGradient: "from-orange-400 via-orange-500 to-red-500 dark:from-orange-400 dark:via-orange-500 dark:to-red-500",
    cardGradient: "from-orange-50 to-red-50 dark:from-orange-900/50 dark:to-red-900/50",
    border: "border-orange-200/50 dark:border-orange-800/50",
    shadow: "shadow-orange-100/20 dark:shadow-orange-900/20",
    accent: "text-orange-700 dark:text-orange-300",
    navHover: "hover:bg-orange-50/90 dark:hover:bg-orange-900/40 hover:text-orange-700 dark:hover:text-orange-300 hover:shadow-sm",
    navActive: "bg-orange-100/90 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 shadow-sm ring-1 ring-orange-200/50 dark:ring-orange-800/50",
    badge: "bg-orange-500 text-white",
    closeButton: "bg-orange-500 hover:bg-orange-600 text-white",
    groupHeader: "text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/50",
  },
  TEACHER: {
    gradient: "from-amber-50 via-yellow-50/80 to-orange-100/60 dark:from-yellow-900 dark:via-amber-900/50 dark:to-orange-900/80",
    headerGradient: "from-amber-400 via-yellow-500 to-orange-500 dark:from-amber-400 dark:via-yellow-500 dark:to-orange-500",
    cardGradient: "from-amber-50 to-orange-50 dark:from-amber-900/50 dark:to-orange-900/50",
    border: "border-amber-200/50 dark:border-amber-800/50",
    shadow: "shadow-amber-100/20 dark:shadow-amber-900/20",
    accent: "text-amber-700 dark:text-amber-300",
    navHover: "hover:bg-amber-50/90 dark:hover:bg-amber-900/40 hover:text-amber-700 dark:hover:text-amber-300 hover:shadow-sm",
    navActive: "bg-amber-100/90 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 shadow-sm ring-1 ring-amber-200/50 dark:ring-amber-800/50",
    badge: "bg-amber-500 text-white",
    closeButton: "bg-amber-500 hover:bg-amber-600 text-white",
    groupHeader: "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/50",
  },
  STUDENT: {
    gradient: "from-red-50 via-orange-50/80 to-yellow-100/60 dark:from-red-900 dark:via-orange-900/50 dark:to-yellow-900/80",
    headerGradient: "from-red-400 via-orange-500 to-yellow-500 dark:from-red-400 dark:via-orange-500 dark:to-yellow-500",
    cardGradient: "from-red-50 to-yellow-50 dark:from-red-900/50 dark:to-yellow-900/50",
    border: "border-red-200/50 dark:border-red-800/50",
    shadow: "shadow-red-100/20 dark:shadow-red-900/20",
    accent: "text-red-700 dark:text-red-300",
    navHover: "hover:bg-red-50/90 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 hover:shadow-sm",
    navActive: "bg-red-100/90 dark:bg-red-900/50 text-red-800 dark:text-red-200 shadow-sm ring-1 ring-red-200/50 dark:ring-red-800/50",
    badge: "bg-red-500 text-white",
    closeButton: "bg-red-500 hover:bg-red-600 text-white",
    groupHeader: "text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/50",
  },
}

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & Analytics", group: "Main" },
  { href: "/admin/guide", label: "Admin Guide", icon: HelpCircle, description: "Help & Documentation", group: "Main" },
  { href: "/admin/academic-calendar", label: "Academic Calendar", icon: Calendar, description: "Manage Academic Year", group: "Schedule" },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap, description: "Class Management", group: "Management" },
  { href: "/admin/teachers", label: "Teachers", icon: Users, description: "Teacher Profiles", group: "Management" },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen, description: "Subject Configuration", group: "Management" },
  { href: "/admin/rooms", label: "Rooms", icon: MapPin, description: "Room Management", group: "Management" },
  { href: "/admin/timeslots", label: "Time Slots", icon: Clock, description: "Schedule Configuration", group: "Schedule" },
  { href: "/admin/timetable", label: "Timetable", icon: Calendar, description: "Master Timetable", group: "Schedule" },
  { href: "/admin/timetable/test", label: "Timetable Test", icon: Filter, badge: "Beta", description: "Test Features", group: "Schedule" },
  { href: "/admin/users", label: "User Management", icon: Users, description: "User Accounts", group: "System" },
  { href: "/admin/export", label: "Export", icon: Download, description: "Data Export", group: "System" },
  { href: "/admin/print", label: "Print", icon: Printer, description: "Print Reports", group: "System" },
]

const teacherNavItems: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, description: "Your Overview", group: "Main" },
  { href: "/teacher/academic-calendar", label: "Academic Calendar", icon: Calendar, description: "Academic Schedule", group: "Schedule" },
  { href: "/teacher/timetable", label: "My Timetable", icon: Calendar, description: "Your Schedule", group: "Schedule" },
  { href: "/teacher/swaps", label: "Swap Requests", icon: RefreshCw, showNotification: true, description: "Class Exchanges", group: "Schedule" },
  { href: "/teacher/download", label: "Download", icon: Download, description: "Export Your Data", group: "Tools" },
]

const studentNavItems: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard, description: "Your Overview", group: "Main" },
  { href: "/student/academic-calendar", label: "Academic Calendar", icon: Calendar, description: "Academic Schedule", group: "Schedule" },
  { href: "/student/timetable", label: "My Timetable", icon: Calendar, description: "Your Classes", group: "Schedule" },
  { href: "/student/print", label: "Print", icon: Printer, description: "Print Schedule", group: "Tools" },
  { href: "/student/export", label: "Export", icon: Download, description: "Export Schedule", group: "Tools" },
]

// Inline component for group header
const GroupHeader = ({ group, theme, isCollapsed }: { group: string, theme: any, isCollapsed: boolean }) => (
  !isCollapsed ? (
    <div className={`px-3 py-2 mb-2 rounded-lg ${theme.groupHeader}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide">{group}</h3>
    </div>
  ) : null
)

// Inline component for nav item
const NavItemButton = ({ item, isCollapsed, isActive, theme, userId, role }: { item: NavItem, isCollapsed: boolean, isActive: (href: string) => boolean, theme: any, userId?: string, role: string }) => (
  <Button
    key={item.href}
    asChild
    variant="ghost"
    className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'} h-auto p-0 text-left rounded-xl font-medium transition-all duration-200 group relative focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${role.toLowerCase()}-500/70 focus-visible:outline-none ${
      isActive(item.href) ? theme.navActive : `${theme.navHover} hover:scale-[1.02]`
    }`}
    title={isCollapsed ? item.label : undefined}
    aria-label={item.label}
  >
    <Link href={item.href} className={`flex items-center w-full ${isCollapsed ? 'p-3' : 'p-3'} gap-3`} tabIndex={0}>
      <div className={`flex items-center justify-center ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg transition-all duration-200 ${
        isActive(item.href)
          ? 'bg-white/20 dark:bg-black/20 shadow-sm'
          : 'bg-white/10 dark:bg-black/10 group-hover:bg-white/20 dark:group-hover:bg-black/20'
      }`}>
        <item.icon className={`h-4 w-4 transition-all duration-200 ${
          isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'
        }`} />
      </div>
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">{item.label}</span>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${theme.badge}`}>{item.badge}</span>
              )}
              {item.showNotification && userId && (
                <SwapRequestNotification userId={userId} userRole={role as "ADMIN" | "TEACHER" | "STUDENT"} />
              )}
            </div>
            {item.description && (
              <p className="text-xs opacity-60 truncate">{item.description}</p>
            )}
          </div>
          <ChevronRight className={`h-3 w-3 transition-all duration-200 ${
            isActive(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`} />
        </>
      )}
      {isCollapsed && item.showNotification && userId && (
        <div className="absolute -top-1 -right-1 z-10">
          <SwapRequestNotification userId={userId} userRole={role as "ADMIN" | "TEACHER" | "STUDENT"} />
        </div>
      )}
    </Link>
  </Button>
)

export function Sidebar({ role, userId, onClose, isDrawer, currentPath, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(true)
  const navItems = role === "ADMIN" ? adminNavItems : role === "TEACHER" ? teacherNavItems : studentNavItems
  const theme = roleTheme[role]

  useEffect(() => {
    if (isDrawer) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "auto"
      }
    }
  }, [isDrawer])

  const handleClose = () => {
    if (isDrawer) {
      setIsAnimating(true)
      setTimeout(() => {
        onClose?.()
      }, 200)
    }
  }

  const isActive = (href: string) => currentPath === href

  const getRoleBadge = () => {
    switch (role) {
      case "ADMIN": return "🛡️ Admin"
      case "TEACHER": return "👨‍🏫 Teacher"
      case "STUDENT": return "🎓 Student"
      default: return ""
    }
  }

  const groupedItems = navItems.reduce((acc, item) => {
    const group = item.group || "Other"
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  const currentDate = new Date()
  const dateString = currentDate.toLocaleDateString("en-GB", { 
    weekday: "short", 
    day: "numeric", 
    month: "short"
  })

  return (
    <aside
      className={`h-screen min-h-screen ${isCollapsed ? 'w-16' : 'w-[90vw] max-w-xs md:w-80'} z-50 border-r ${theme.border} ${theme.shadow} bg-gradient-to-br ${theme.gradient} flex flex-col backdrop-blur-xl transition-all duration-300 ease-in-out ${
        isDrawer ? (isAnimating ? 'animate-slide-out-left' : 'animate-slide-in-left') : ''
      }`}
      style={{ position: isDrawer ? "fixed" : "relative", top: 0, left: 0 }}
    >
      {/* Overlay for mobile drawer */}
      {isDrawer && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20 pointer-events-none" />
      )}

      {/* Header Section */}
      <div className={`relative bg-gradient-to-r ${theme.headerGradient} ${theme.shadow} border ${theme.border} rounded-2xl mx-3 mt-4 mb-4 px-3 pt-3 pb-4 flex flex-col items-center justify-center min-h-[64px]`}>
        {/* Collapse Button */}
        {!isDrawer && setIsCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="absolute top-2 right-2 rounded-full border shadow bg-white/80 dark:bg-black/40 hover:bg-white/90 dark:hover:bg-black/60 transition-colors z-10"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <Maximize2 className={`h-4 w-4 ${theme.accent}`} /> : <Minimize2 className={`h-4 w-4 ${theme.accent}`} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        )}
        {/* Header Content - now a row */}
        <div className="flex flex-row items-center justify-center w-full gap-3 pt-2">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm shadow-lg">
            <Logo size="sm" showText={false} className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <>
              <h1 className="text-base font-extrabold text-white tracking-tight text-center">Timetable</h1>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                <span className="text-xs font-semibold text-white/90">{getRoleBadge()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 mb-20">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="mb-6">
            <GroupHeader group={group} theme={theme} isCollapsed={isCollapsed} />
            <div className="space-y-1">
              {items.map((item) => (
                <NavItemButton
                  key={item.href}
                  item={item}
                  isCollapsed={isCollapsed}
                  isActive={isActive}
                  theme={theme}
                  userId={userId}
                  role={role}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Calendar Widget at the bottom (sticky) */}
      <div className="sticky bottom-0 left-0 w-full bg-gradient-to-br from-white/80 dark:from-black/40 to-transparent z-20 px-4 pb-4 pt-2 border-t border-white/10 dark:border-black/10 backdrop-blur-md">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center gap-2 mb-2"
          onClick={() => setCalendarOpen((open) => !open)}
          aria-expanded={calendarOpen}
        >
          <Calendar className={`h-4 w-4 ${theme.accent}`} />
          <span className="font-medium text-xs">{calendarOpen ? "Hide Calendar" : "Show Calendar"}</span>
        </Button>
        {(!isDrawer && !isCollapsed && calendarOpen) && (
          <div className={`rounded-xl ${theme.cardGradient} border ${theme.border} p-4 shadow-sm backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-2 duration-300`}>
            <SimpleCalendar className="max-w-full" />
          </div>
        )}
      </div>

      {/* Mobile Date Display */}
      {isDrawer && !isCollapsed && (
        <div className="px-4 py-3 border-t border-white/10 dark:border-black/10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm">
              <Calendar className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">{dateString}</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Calendar Icon */}
      {!isDrawer && isCollapsed && (
        <div className="px-2 py-4 border-t border-white/10 dark:border-black/10">
          <div className="flex justify-center">
            <div className={`w-10 h-10 rounded-lg ${theme.cardGradient} border ${theme.border} flex items-center justify-center backdrop-blur-sm`}>
              <Calendar className="h-5 w-5 opacity-70" />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}