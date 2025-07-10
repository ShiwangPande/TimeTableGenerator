export const dynamic = 'force-dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { AdminTourButton } from '@/components/admin-tour-button';
import Link from 'next/link';
import { GraduationCap, Users, BookOpen, MapPin, Clock, Calendar, Filter, Download, Printer, Settings, HelpCircle, RefreshCw, Sparkles, Bell, Info, ChevronRight } from 'lucide-react';

const howDoISections = [
  {
    value: 'classes',
    icon: <GraduationCap className="h-6 w-6 text-blue-500" />, 
    title: 'Add or Edit Classes, Teachers, Subjects, or Rooms',
    steps: [
      'Go to the Admin Dashboard.',
      'Use the sidebar to access Classes, Teachers, Subjects, or Rooms.',
      'Click Add or Edit to manage entries. Fill in all required fields.',
      'Assign teachers to subjects and classes for timetable accuracy.'
    ]
  },
  {
    value: 'generate',
    icon: <Sparkles className="h-6 w-6 text-purple-500" />, 
    title: 'Generate a Timetable',
    steps: [
      'Go to Timetable > Generate in the sidebar.',
      'Choose to generate for all classes, a specific class, or a teacher.',
      'Click Generate Timetable. Previous entries will be cleared.',
      'Review and adjust the timetable as needed (drag-and-drop supported).'
    ]
  },
  {
    value: 'export',
    icon: <Download className="h-6 w-6 text-green-600" />, 
    title: 'Export or Print Timetables',
    steps: [
      'Go to Export in the sidebar or the relevant dashboard.',
      'Choose Excel, PDF, CSV, or ZIP format.',
      'Click Download or Print. Use the browser print dialog for best results.'
    ]
  },
  {
    value: 'users',
    icon: <Users className="h-6 w-6 text-pink-500" />, 
    title: 'Manage Users and Roles',
    steps: [
      'Go to Users in the sidebar.',
      'View all users and their roles.',
      'Click Edit to change a user’s role (Admin, Teacher, Student).',
      'Changes are immediate; users may need to refresh.'
    ]
  },
  {
    value: 'swaps',
    icon: <RefreshCw className="h-6 w-6 text-orange-500" />, 
    title: 'Handle Swap Requests',
    steps: [
      'Check the Swap Requests section or notification badge.',
      'Review pending requests and approve or reject.',
      'Teachers are notified of the outcome.'
    ]
  },
  {
    value: 'calendar',
    icon: <Calendar className="h-6 w-6 text-cyan-600" />, 
    title: 'Set Up the Academic Calendar',
    steps: [
      'Go to Academic Calendar in the sidebar.',
      'Add holidays, exams, or events. These block timetable generation for those dates.',
      'Events are enforced automatically.'
    ]
  },
  {
    value: 'ib',
    icon: <BookOpen className="h-6 w-6 text-indigo-500" />, 
    title: 'Use IB Filtering and Levels',
    steps: [
      'When editing subjects, set the IB Group and Level (HL/SL).',
      'Timetable generation and filters will respect these settings.',
      'Use timetable filters to view IB-specific schedules.'
    ]
  },
  {
    value: 'notifications',
    icon: <Bell className="h-6 w-6 text-yellow-500" />, 
    title: 'How Notifications Work',
    steps: [
      'Admins and teachers receive in-app notifications for swaps and key events.',
      'Email notifications are sent for important actions (if email is configured).',
      'Check the notification badge for pending actions.'
    ]
  },
];

export default function AdminGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-6 px-1 sm:px-2 flex justify-center items-start">
      <div className="w-full max-w-3xl space-y-12 animate-fade-in rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md p-0 mx-auto">
        {/* Header with Logo and Welcome */}
        <div className="flex flex-col items-center gap-3 bg-gradient-to-r from-orange-400 via-orange-300 to-red-400 rounded-t-2xl p-4 sm:p-8 shadow-lg -mt-8 relative z-10">
          <Logo size="lg" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 drop-shadow text-center">Welcome, Admin!</h1>
          <p className="text-base sm:text-lg text-blue-100 text-center max-w-xl">
            This guide will help you master every aspect of the Timetable Generator. Start with the basics, explore advanced features, and get help whenever you need it.
          </p>
          <div className="mt-4">
            <AdminTourButton />
          </div>
        </div>

        {/* Getting Started Section with Alert */}
        <Card className="bg-white/80 dark:bg-gray-900/80 shadow-md border-0 mx-1 sm:mx-0">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Getting Started: Admin Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-5 w-5" />
              <AlertTitle>Tip</AlertTitle>
              <AlertDescription>
                Complete these steps in order for a smooth setup. You can always revisit this guide or start the interactive tour at any time.
              </AlertDescription>
            </Alert>
            <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base">
              <li>Add <b>Classes</b> (with sections/levels)</li>
              <li>Add <b>Teachers</b> and <b>Subjects</b> (assign teachers to subjects/classes)</li>
              <li>Add <b>Rooms</b> and <b>Time Slots</b></li>
              <li>Set up <b>Academic Calendar</b> (add holidays/events)</li>
              <li>
                Go to <b>Generate Timetable</b> and create your first timetable
                <Button asChild variant="outline" size="sm" className="ml-2 mt-2">
                  <Link href="/admin/timetable/generate">Go to Generate</Link>
                </Button>
              </li>
              <li>Review, export, or print the generated timetable</li>
            </ol>
          </CardContent>
        </Card>

        {/* Gradient Divider */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-transparent rounded-full my-6 sm:my-8" />

        {/* Redesigned How Do I Section */}
        <div className="space-y-8 px-1 sm:px-0">
          {howDoISections.map((section, idx) => (
            <Card key={section.value} className="bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-gray-900/90 dark:to-blue-950/60 border-blue-100 dark:border-gray-800 shadow-md mx-1 sm:mx-0">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-4 sm:p-6">
                <div className="flex flex-col items-center md:items-start md:col-span-1">
                  <div className="mb-2">{section.icon}</div>
                  <div className="font-semibold text-base sm:text-lg text-blue-900 dark:text-blue-100 text-center md:text-left">{section.title}</div>
                </div>
                <div className="md:col-span-4">
                  <ol className="space-y-3 list-decimal pl-5 text-sm sm:text-base">
                    {section.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-blue-400 shrink-0" />
                        <span className="text-gray-800 dark:text-gray-100 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {/* Render action button if needed */}
                  {section.value === 'generate' && (
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/admin/timetable/generate">Go to Generate</Link>
                    </Button>
                  )}
                  {section.value === 'export' && (
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/admin/export">Go to Export</Link>
                    </Button>
                  )}
                  {section.value === 'users' && (
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/admin/users">Go to User Management</Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Gradient Divider */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-200/40 via-blue-200/40 to-transparent rounded-full my-6 sm:my-8" />

        {/* More Resources */}
        <Card className="bg-white/80 dark:bg-gray-900/80 shadow-md border-0 rounded-b-2xl mx-1 sm:mx-0">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">More Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base overflow-x-auto">
              <li><Link href="/FEATURES.md" className="underline">Feature List</Link></li>
              <li><Link href="/SYSTEM_DESIGN.md" className="underline">System Design</Link></li>
              <li><Link href="/FLOW_CHART.md" className="underline">System Flow Chart</Link></li>
              <li><Link href="/SETUP_GUIDE.md" className="underline">Setup Guide</Link></li>
              <li><Link href="/TEACHER_SWAP_GUIDE.md" className="underline">Teacher Swap Guide</Link></li>
              <li><Link href="/TOUR_GUIDE.md" className="underline">Tour/Onboarding Guide</Link></li>
            </ul>
          </CardContent>
        </Card>

        {/* Troubleshooting & Tips Section */}
        <Card className="bg-white/80 dark:bg-gray-900/80 shadow-md border-0 rounded-b-2xl mx-1 sm:mx-0">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Troubleshooting & Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base overflow-x-auto">
              <li>If you encounter errors, try refreshing the page or signing out and back in.</li>
              <li>Check your internet connection if actions seem slow.</li>
              <li>For help, see the <Link href="/TOUR_GUIDE.md" className="underline">Tour Guide</Link> or contact your system administrator.</li>
              <li>For technical setup, see the <Link href="/SETUP_GUIDE.md" className="underline">Setup Guide</Link>.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 