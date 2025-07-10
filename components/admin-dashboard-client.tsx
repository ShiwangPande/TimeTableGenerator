"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Users, BookOpen, Clock, Calendar, Settings, CheckCircle, HelpCircle, PlayCircle, Bell } from "lucide-react";

export default function AdminDashboardClient({
  classCount,
  teacherCount,
  subjectCount,
  timeSlotCount,
  timetableCount,
  roomCount,
  pendingSwapRequests
}: {
  classCount: number;
  teacherCount: number;
  subjectCount: number;
  timeSlotCount: number;
  timetableCount: number;
  roomCount: number;
  pendingSwapRequests: number;
}) {
  const steps = [
    { label: "Add Classes", done: classCount > 0, href: "/admin/classes" },
    { label: "Add Teachers", done: teacherCount > 0, href: "/admin/teachers" },
    { label: "Add Subjects", done: subjectCount > 0, href: "/admin/subjects" },
    { label: "Add Rooms", done: roomCount > 0, href: "/admin/rooms" },
    { label: "Add Time Slots", done: timeSlotCount > 0, href: "/admin/timeslots" },
    { label: "Generate Timetable", done: timetableCount > 0, href: "/admin/timetable/generate" },
    { label: "Export/Print", done: timetableCount > 0, href: "/admin/export" },
  ];
  return (
    <>
      <WelcomeModal steps={steps} />
      <div className="space-y-6">
        {/* Checklist/Progress Bar */}
        <div className="bg-white/90 border border-orange-100 rounded-xl shadow p-4 mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-orange-900">Setup Progress</h2>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1">
                <Link href="/admin/guide"><HelpCircle className="w-4 h-4" /> Help</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-1">
                <Link href="#" onClick={() => window.dispatchEvent(new CustomEvent('start-admin-tour'))}><PlayCircle className="w-4 h-4" /> Tour</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {steps.map((step, i) => (
              <Link key={step.label} href={step.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${step.done ? 'bg-green-50 border-green-200 text-green-800' : 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100'} ${i > 0 && !steps[i-1].done ? 'opacity-50 pointer-events-none' : ''}`}
                title={step.label}
              >
                {step.done ? <CheckCircle className="w-4 h-4 text-green-500" /> : <span className="w-4 h-4 border-2 border-orange-300 rounded-full inline-block" />}
                {step.label}
              </Link>
            ))}
          </div>
        </div>
        {/* Dashboard Cards (copied from original dashboard) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage classes, subjects, teachers, and timetables
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Classes Management */}
          <Card data-tour="classes">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classCount}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
              <div className="mt-4 space-y-2">
                <Button asChild size="sm" className="w-full bg-orange-400 hover:bg-red-400 hover:text-black" >
                  <Link href="/admin/classes">Manage Classes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Teachers Management */}
          <Card data-tour="teachers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherCount}</div>
              <p className="text-xs text-muted-foreground">Active teachers</p>
              <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full bg-orange-400 hover:bg-red-400 hover:text-black" >
                  <Link href="/admin/teachers">Manage Teachers</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Subjects Management */}
          <Card data-tour="subjects">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjectCount}</div>
              <p className="text-xs text-muted-foreground">Available subjects</p>
              <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full bg-orange-400 hover:bg-red-400 hover:text-black" >
                  <Link href="/admin/subjects">Manage Subjects</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Time Slots */}
          <Card data-tour="time-slots">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timeSlotCount}</div>
              <p className="text-xs text-muted-foreground">Daily time slots</p>
              <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full bg-orange-400 hover:bg-red-400 hover:text-black" >
                  <Link href="/admin/timeslots">Manage Time Slots</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Timetable Management */}
          <Card data-tour="timetable">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timetables</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetableCount}</div>
              <p className="text-xs text-muted-foreground">Generated timetables</p>
              <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full bg-orange-400 hover:bg-red-400 hover:text-black" >
                  <Link href="/admin/timetable">Manage Timetables</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Rooms Management */}
          <Card data-tour="rooms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rooms</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomCount}</div>
              <p className="text-xs text-muted-foreground">Available rooms</p>
              <div className="mt-4 space-y-2">
              <Button asChild size="sm" className="w-full bg-orange-400 hover:bg-red-400 hover:text-black" >
                  <Link href="/admin/rooms">Manage Rooms</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Notifications */}
        {pendingSwapRequests > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Bell className="h-5 w-5" />
                Pending Swap Requests
              </CardTitle>
              <CardDescription className="text-orange-700">
                There are {pendingSwapRequests} swap request{pendingSwapRequests > 1 ? 's' : ''} waiting for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/admin/timetable">View Swap Requests</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function WelcomeModal({ steps }: { steps: { label: string; done: boolean; href: string }[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("admin_welcome_modal_seen");
      if (!seen) setOpen(true);
    }
  }, []);
  const handleClose = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_welcome_modal_seen", "1");
    }
  };
  const handleTour = () => {
    handleClose();
    window.dispatchEvent(new CustomEvent('start-admin-tour'));
  };
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in-0 slide-in-from-top-6">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={handleClose} aria-label="Close">×</button>
        <h2 className="text-2xl font-bold mb-2 text-orange-900">Welcome, Admin!</h2>
        <p className="mb-4 text-orange-800">To get started, follow these steps. You can always revisit this guide or start the interactive tour at any time.</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm mb-4">
          {steps.map((step, i) => (
            <li key={step.label} className={`flex items-center gap-2 ${step.done ? 'text-green-700' : 'text-orange-900'}`}>
              {step.done ? <CheckCircle className="w-4 h-4 text-green-500" /> : <span className="w-4 h-4 border-2 border-orange-300 rounded-full inline-block" />}
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleTour} variant="theme"><PlayCircle className="w-4 h-4 mr-1" /> Start Tour</Button>
          <Button asChild variant="theme"><Link href="/admin/guide"><HelpCircle className="w-4 h-4 mr-1" /> Open Guide</Link></Button>
          <Button onClick={handleClose} variant="theme">Dismiss</Button>
        </div>
      </div>
    </div>
  ) : null;
} 