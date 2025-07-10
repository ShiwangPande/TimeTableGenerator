import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  ChevronRight
} from "lucide-react"

interface MobileSidebarProps {
  role: "ADMIN" | "TEACHER" | "STUDENT"
  userId?: string
  onClose?: () => void
  currentPath?: string
}

const roleTheme = {
  ADMIN: {
    gradient: "from-orange-50 via-orange-100/80 to-red-50/60 dark:from-orange-900 dark:via-orange-800 dark:to-red-900/80",
    headerGradient: "from-orange-400 via-orange-500 to-red-500 dark:from-orange-400 dark:via-orange-500 dark:to-red-500",
    accent: "text-orange-700 dark:text-orange-300",
    navHover: "hover:bg-orange-50/90 dark:hover:bg-orange-900/40 hover:text-orange-700 dark:hover:text-orange-300 hover:shadow-sm",
    navActive: "bg-orange-100/90 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 shadow-sm ring-1 ring-orange-200/50 dark:ring-orange-800/50",
    badge: "bg-orange-500 text-white",
    closeButton: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  TEACHER: {
    gradient: "from-amber-50 via-yellow-50/80 to-orange-100/60 dark:from-yellow-900 dark:via-amber-900/50 dark:to-orange-900/80",
    headerGradient: "from-amber-400 via-yellow-500 to-orange-500 dark:from-amber-400 dark:via-yellow-500 dark:to-orange-500",
    accent: "text-amber-700 dark:text-amber-300",
    navHover: "hover:bg-amber-50/90 dark:hover:bg-amber-900/40 hover:text-amber-700 dark:hover:text-amber-300 hover:shadow-sm",
    navActive: "bg-amber-100/90 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 shadow-sm ring-1 ring-amber-200/50 dark:ring-amber-800/50",
    badge: "bg-amber-500 text-white",
    closeButton: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  STUDENT: {
    gradient: "from-red-50 via-orange-50/80 to-yellow-100/60 dark:from-red-900 dark:via-orange-900/50 dark:to-yellow-900/80",
    headerGradient: "from-red-400 via-orange-500 to-yellow-500 dark:from-red-400 dark:via-orange-500 dark:to-yellow-500",
    accent: "text-red-700 dark:text-red-300",
    navHover: "hover:bg-red-50/90 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 hover:shadow-sm",
    navActive: "bg-red-100/90 dark:bg-red-900/50 text-red-800 dark:text-red-200 shadow-sm ring-1 ring-red-200/50 dark:ring-red-800/50",
    badge: "bg-red-500 text-white",
    closeButton: "bg-red-500 hover:bg-red-600 text-white",
  },
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  showNotification?: boolean;
  badge?: string;
  description?: string;
}

const adminNavItems: (NavItem & { group: string })[] = [
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
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, description: "Your Overview" },
  { href: "/teacher/academic-calendar", label: "Academic Calendar", icon: Calendar, description: "Academic Schedule" },
  { href: "/teacher/timetable", label: "My Timetable", icon: Calendar, description: "Your Schedule" },
  { href: "/teacher/swaps", label: "Swap Requests", icon: RefreshCw, showNotification: true, description: "Class Exchanges" },
  { href: "/teacher/download", label: "Download", icon: Download, description: "Export Your Data" },
]

const studentNavItems: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard, description: "Your Overview" },
  { href: "/student/academic-calendar", label: "Academic Calendar", icon: Calendar, description: "Academic Schedule" },
  { href: "/student/timetable", label: "My Timetable", icon: Calendar, description: "Your Classes" },
  { href: "/student/print", label: "Print", icon: Printer, description: "Print Schedule" },
  { href: "/student/export", label: "Export", icon: Download, description: "Export Schedule" },
]

// Compact styles for admin mobile sidebar
const adminGroupHeaderClass = "px-2 py-1 mb-1 rounded bg-orange-50/60 dark:bg-orange-950/60 text-[11px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400";
const adminNavButtonClass = "w-full justify-start h-auto p-0 text-left rounded-lg font-medium transition-all duration-200 group relative text-[15px]";
const adminNavItemInnerClass = "flex items-center w-full p-2 gap-2";
const adminIconClass = "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200";
const adminChevronClass = "h-3 w-3 transition-all duration-200";

export function MobileSidebar({ role, userId, onClose, currentPath }: MobileSidebarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const navItems = role === "ADMIN" ? adminNavItems : role === "TEACHER" ? teacherNavItems : studentNavItems
  const theme = roleTheme[role]

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onClose?.()
    }, 200)
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

  const currentDate = new Date()
  const dateString = currentDate.toLocaleDateString("en-GB", { 
    weekday: "long", 
    day: "numeric", 
    month: "long",
    year: "numeric"
  })

  return (
    <aside
      className={`fixed inset-0 z-[100] bg-gradient-to-br ${theme.gradient} flex flex-col shadow-2xl backdrop-blur-xl ${
        isAnimating ? 'animate-slide-out-left' : 'animate-slide-in-left'
      }`}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/10 dark:bg-black/20 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)` 
        }}
      />
      
      {/* Header */}
      <div className={`relative bg-gradient-to-r ${theme.headerGradient} shadow-lg`}>
        <div className="absolute inset-0 bg-white/10 dark:bg-black/10" />
        
        {/* Close Button */}
        <button
          className={`absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full ${theme.closeButton} shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50`}
          onClick={handleClose}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header Content */}
        <div className="relative px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm mb-4 shadow-lg">
            <Logo size="lg" showText={false} className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{role === "ADMIN" ? "Admin Dashboard" : "Timetable"}</h1>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm">
            <span className="text-sm font-medium text-white/90">{getRoleBadge()}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {role === "ADMIN" ? (
        <div className="flex-1 overflow-y-auto px-1 py-2">
          {Object.entries(adminNavItems.reduce((acc, item) => {
            if (!acc[item.group]) acc[item.group] = [];
            acc[item.group].push(item);
            return acc;
          }, {} as Record<string, typeof adminNavItems>)).map(([group, items], groupIdx, arr) => (
            <div key={group} className="mb-2">
              <div className={adminGroupHeaderClass}>{group}</div>
              <div className="space-y-0.5">
                {items.map((item, index) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className={`${adminNavButtonClass} ${isActive(item.href) ? theme.navActive : `${theme.navHover} hover:scale-[1.02]`}`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <Link
                      href={item.href}
                      className={adminNavItemInnerClass}
                      onClick={() => { if (onClose) onClose(); }}
                    >
                      <div className={`${adminIconClass} ${isActive(item.href)
                        ? 'bg-white/20 dark:bg-black/20 shadow-sm'
                        : 'bg-white/10 dark:bg-black/10 group-hover:bg-white/20 dark:group-hover:bg-black/20'}`}
                      >
                        <item.icon className="h-4 w-4 transition-all duration-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-[15px] truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${theme.badge}`}>{item.badge}</span>
                          )}
                          {item.showNotification && userId && (
                            <SwapRequestNotification userId={userId} userRole={role} />
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs opacity-60 truncate">{item.description}</p>
                        )}
                      </div>
                      <ChevronRight className={adminChevronClass + ` ${isActive(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                    </Link>
                  </Button>
                ))}
              </div>
              {groupIdx < arr.length - 1 && (
                <div className="my-2 border-t border-orange-100 dark:border-orange-900/40" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map((item, index) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={`w-full justify-start h-auto p-0 text-left rounded-xl font-medium transition-all duration-200 group relative ${
                isActive(item.href) ? theme.navActive : `${theme.navHover} hover:scale-[1.02]`
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                href={item.href}
                className="flex items-center w-full p-4 gap-4"
                onClick={() => { if (onClose) onClose(); }}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-white/20 dark:bg-black/20 shadow-sm' 
                    : 'bg-white/10 dark:bg-black/10 group-hover:bg-white/20 dark:group-hover:bg-black/20'
                }`}>
                  <item.icon className={`h-5 w-5 transition-all duration-200 ${
                    isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${theme.badge}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.showNotification && userId && (
                      <SwapRequestNotification userId={userId} userRole={role} />
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs opacity-70 truncate">{item.description}</p>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                  isActive(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                }`} />
              </Link>
            </Button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="relative px-6 py-4 border-t border-white/10 dark:border-black/10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm">
            <Calendar className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">{dateString}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}