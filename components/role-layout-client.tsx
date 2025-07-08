"use client"

import { ReactNode, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { TopNav } from "@/components/top-nav"
import { AdminWelcomeTour } from "@/components/admin-welcome-tour"
import { TeacherWelcomeTour } from "@/components/teacher-welcome-tour"
import { StudentWelcomeTour } from "@/components/student-welcome-tour"
import { useIsMobile } from "@/hooks/use-mobile"
import { TooltipProvider } from "@/components/ui/tooltip"

interface RoleLayoutClientProps {
  children: ReactNode
  user: any
}

// CSS variables for layout
const NAVBAR_HEIGHT = "4rem" // 64px
const SIDEBAR_WIDTH_EXPANDED = "20rem" // 320px
const SIDEBAR_WIDTH_COLLAPSED = "4rem" // 64px

export function RoleLayoutClient({ children, user }: RoleLayoutClientProps) {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const role = user?.role

  // Role-based theme backgrounds
  const bgClass =
    role === "ADMIN"
      ? "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"
      : role === "TEACHER"
      ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-950"
      : "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-950"

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen flex flex-col overflow-x-hidden ${bgClass}`}
        style={{
          ['--navbar-height' as any]: NAVBAR_HEIGHT,
          ['--sidebar-width' as any]: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        }}
      >
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 w-full z-50 shadow-md border-b bg-background/90 backdrop-blur-md">
          <TopNav user={user} onMenuClick={isMobile ? () => setDrawerOpen(true) : !isMobile ? () => setDrawerOpen(true) : undefined} />
        </div>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className="hidden md:block fixed left-0 z-40 shadow-lg border-r bg-background/80 backdrop-blur-xl"
            style={{
              top: `var(--navbar-height)`,
              width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
              height: `calc(100vh - var(--navbar-height))`,
            }}
          >
            <Sidebar role={role} userId={user?.id} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </aside>
        )}
        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="fixed inset-0 z-[100] p-0 flex flex-col max-w-full w-full h-full overflow-hidden border-0">
              <MobileSidebar role={role} userId={user?.id} onClose={() => setDrawerOpen(false)} />
            </DrawerContent>
          </Drawer>
        )}
        {/* Main Content */}
        <main
          className="flex-1 flex flex-col transition-all duration-300 min-h-screen"
          style={{
            paddingTop: "var(--navbar-height)",
            paddingLeft: !isMobile ? (isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED) : undefined,
          }}
        >
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">{children}</div>
          </div>
        </main>
        {/* Role-based Welcome Tours */}
        {role === "ADMIN" && <AdminWelcomeTour user={user} />}
        {role === "TEACHER" && <TeacherWelcomeTour user={user} />}
        {role === "STUDENT" && <StudentWelcomeTour user={user} />}
      </div>
    </TooltipProvider>
  )
} 