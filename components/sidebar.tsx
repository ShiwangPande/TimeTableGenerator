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
    gradient: "from-slate-50 via-blue-50/80 to-indigo-100/60 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/80",
    headerGradient: "from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500",
    cardGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50",
    border: "border-blue-200/50 dark:border-blue-800/50",
    shadow: "shadow-blue-100/20 dark:shadow-blue-900/20",
    accent: "text-blue-700 dark:text-blue-300",
    navHover: "hover:bg-blue-50/90 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm",
    navActive: "bg-blue-100/90 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50",
    badge: "bg-blue-500 text-white",
    closeButton: "bg-blue-500 hover:bg-blue-600 text-white",
    groupHeader: "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/50",
  },
  TEACHER: {
    gradient: "from-emerald-50 via-teal-50/80 to-cyan-100/60 dark:from-gray-950 dark:via-emerald-900/50 dark:to-teal-950/80",
    headerGradient: "from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-500",
    cardGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
    shadow: "shadow-emerald-100/20 dark:shadow-emerald-900/20",
    accent: "text-emerald-700 dark:text-emerald-300",
    navHover: "hover:bg-emerald-50/90 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:shadow-sm",
    navActive: "bg-emerald-100/90 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-200/50 dark:ring-emerald-800/50",
    badge: "bg-emerald-500 text-white",
    closeButton: "bg-emerald-500 hover:bg-emerald-600 text-white",
    groupHeader: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/50",
  },
  STUDENT: {
    gradient: "from-purple-50 via-pink-50/80 to-rose-100/60 dark:from-gray-950 dark:via-purple-900/50 dark:to-pink-950/80",
    headerGradient: "from-purple-600 via-pink-600 to-rose-600 dark:from-purple-500 dark:via-pink-500 dark:to-rose-500",
    cardGradient: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
    border: "border-purple-200/50 dark:border-purple-800/50",
    shadow: "shadow-purple-100/20 dark:shadow-purple-900/20",
    accent: "text-purple-700 dark:text-purple-300",
    navHover: "hover:bg-purple-50/90 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-sm",
    navActive: "bg-purple-100/90 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 shadow-sm ring-1 ring-purple-200/50 dark:ring-purple-800/50",
    badge: "bg-purple-500 text-white",
    closeButton: "bg-purple-500 hover:bg-purple-600 text-white",
    groupHeader: "text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/50",
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
  { href: "/admin/settings", label: "Settings", icon: Settings, description: "System Configuration", group: "System" },
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