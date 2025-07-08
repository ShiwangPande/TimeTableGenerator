export const dynamic = 'force-dynamic';

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, Calendar, LogIn, UserPlus, Star, Quote, ChevronDown } from "lucide-react"

const testimonials = [
  {
    name: "Priya S.",
    role: "School Admin",
    quote: "This timetable generator has saved us countless hours every semester. The automation and export features are a game changer!",
  },
  {
    name: "Mr. Sharma",
    role: "Teacher",
    quote: "I love how easy it is to view and print my teaching schedule. No more confusion or last-minute changes!",
  },
  {
    name: "Aarav P.",
    role: "Student",
    quote: "I can always check my class timings and download my timetable. It’s so convenient!",
  },
]

const faqs = [
  {
    q: "Is this platform free for schools?",
    a: "Yes! The core timetable management features are free for schools and educators.",
  },
  {
    q: "Can I export my timetable to Excel or PDF?",
    a: "Absolutely. You can export your schedule in Excel, PDF, CSV, and more formats with a single click.",
  },
  {
    q: "Is my data secure?",
    a: "We use industry-standard security and privacy practices to keep your data safe.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes, the platform is fully responsive and works great on all devices.",
  },
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 flex flex-col items-center justify-center px-4 overflow-x-hidden">
      {/* Animated background illustration */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" className="absolute left-0 top-0 opacity-30 animate-pulse" style={{zIndex:0}}>
          <defs>
            <radialGradient id="bg-gradient" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#f0abfc" />
            </radialGradient>
          </defs>
          <ellipse cx="60%" cy="40%" rx="500" ry="220" fill="url(#bg-gradient)" />
        </svg>
      </div>
      {/* Hero Section */}
      <section className="relative z-10 max-w-2xl w-full text-center py-20">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-20 w-20 text-blue-600 mb-2 animate-bounce" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-3 drop-shadow-lg">Timetable Generator</h1>
          <p className="text-xl md:text-2xl text-blue-700 mb-8 max-w-xl mx-auto">
            Effortless, automated, and beautiful timetables for schools, teachers, and students.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-2">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Link href="/sign-in">
                <LogIn className="mr-2 h-5 w-5" /> Sign In
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-100">
              <Link href="/sign-up">
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-blue-700 hover:bg-blue-100">
              <Link href="/student/timetable">
                <Calendar className="mr-2 h-5 w-5" /> Student Dashboard
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-blue-700 hover:bg-blue-100">
              <Link href="/teacher/timetable">
                <Users className="mr-2 h-5 w-5" /> Teacher Dashboard
              </Link>
            </Button>
          </div>
          <div className="mt-4 text-sm text-blue-800/80">
            <span className="font-semibold">Are you a school admin?</span> <Link href="/sign-up" className="underline hover:text-blue-600">Get started for free</Link>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="relative z-10 max-w-4xl w-full mx-auto py-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Why Choose Our Timetable Generator?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Calendar className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Automated Scheduling</h3>
            <p className="text-gray-600 text-sm">Generate conflict-free timetables for classes, teachers, and rooms in seconds.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Role-Based Access</h3>
            <p className="text-gray-600 text-sm">Admins, teachers, and students each get a tailored dashboard and features.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <GraduationCap className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Easy Sharing & Export</h3>
            <p className="text-gray-600 text-sm">Download, print, or share timetables in Excel, PDF, and more formats.</p>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="relative z-10 max-w-4xl w-full mx-auto py-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center">
              <Quote className="h-8 w-8 text-blue-400 mb-2" />
              <p className="italic text-blue-900 mb-3">“{t.quote}”</p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold text-blue-800">{t.name}</span>
                <span className="text-xs text-blue-600">({t.role})</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl w-full mx-auto py-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white rounded-lg shadow p-4 group">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-blue-800 group-open:text-blue-600">
                {faq.q}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 text-blue-700 text-sm pl-2">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
      <footer className="w-full text-center py-6 text-blue-700 text-sm opacity-80 z-10">
        &copy; {new Date().getFullYear()} Timetable Generator. All rights reserved.
      </footer>
    </main>
  )
}
