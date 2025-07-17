"use client";
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { GraduationCap, Users, Calendar, LogIn, UserPlus, Star, Quote, ChevronDown, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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
];

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
];

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(data => setRole(data.role));
    } else {
      setRole(null);
    }
  }, [isSignedIn]);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 flex flex-col items-center justify-center px-4 overflow-x-hidden">
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
      <section className="relative z-10 max-w-2xl w-full text-center py-20">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-20 w-20 text-orange-500 mb-2 animate-bounce" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-orange-900 mb-3 drop-shadow-lg">Timetable Generator</h1>
          <p className="text-xl md:text-2xl text-orange-700 mb-8 max-w-xl mx-auto">
            Effortless, automated, and beautiful timetables for schools, teachers, and students.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-2">
            {!isLoaded ? null : !isSignedIn ? (
              <>
                <Button asChild size="lg">
                  <Link href="/sign-in">
                    <LogIn className="mr-2 h-5 w-5" /> Sign In
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sign-up">
                    <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                  </Link>
                </Button>
              </>
            ) : role === null ? null : role === "ADMIN" ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/admin" >
                  <Users className="mr-2 h-5 w-5" /> Join as Admin
                </Link>
              </Button>
            ) : role === "TEACHER" ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/teacher">
                  <Users className="mr-2 h-5 w-5" /> Join as Teacher
                </Link>
              </Button>
            ) : role === "STUDENT" ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/student">
                  <Users className="mr-2 h-5 w-5" /> Join as Student
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col gap-4 items-center">
                <div className="text-orange-800 bg-orange-50 border border-orange-200 rounded-lg p-4 text-lg font-semibold">
                  You do not have a role assigned. To get another role, contact admin.
                </div>
                <Button asChild size="lg" className="animate-pulse bg-orange-500 hover:bg-red-400 text-white">
                  <Link href="/student/onboard">
                    <GraduationCap className="mr-2 h-5 w-5" /> Join as Student
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-primary/80">
            <span className="font-semibold">Are you a school admin?</span> <Link href="/sign-up" className="underline hover:text-primary">Get started for free</Link>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="relative z-10 max-w-4xl w-full mx-auto py-12">
        <h2 className="text-3xl font-extrabold text-orange-900 mb-6 text-center tracking-tight">Why Choose Our Timetable Generator?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center border-t-4 border-orange-200 hover:scale-105 transition-transform">
            <Calendar className="h-10 w-10 text-orange-500 mb-3" />
            <h3 className="font-semibold text-xl mb-2">Automated Scheduling</h3>
            <p className="text-gray-600 text-base">Generate conflict-free timetables for classes, teachers, and rooms in seconds.</p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center border-t-4 border-green-200 hover:scale-105 transition-transform">
            <Users className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="font-semibold text-xl mb-2">Role-Based Access</h3>
            <p className="text-gray-600 text-base">Admins, teachers, and students each get a tailored dashboard and features.</p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center border-t-4 border-orange-400 hover:scale-105 transition-transform">
            <GraduationCap className="h-10 w-10 text-orange-500 mb-3" />
            <h3 className="font-semibold text-xl mb-2">Easy Sharing & Export</h3>
            <p className="text-gray-600 text-base">Download, print, or share timetables in Excel, PDF, and more formats.</p>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="relative z-10 max-w-4xl w-full mx-auto py-12">
        <h2 className="text-3xl font-extrabold text-orange-900 mb-6 text-center tracking-tight">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-lg p-8 flex flex-col items-center border-l-4 border-orange-300">
              <Quote className="h-8 w-8 text-orange-400 mb-2" />
              <p className="italic text-orange-900 mb-3 text-lg">“{t.quote}”</p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold text-orange-800">{t.name}</span>
                <span className="text-xs text-orange-600">({t.role})</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl w-full mx-auto py-12">
        <h2 className="text-2xl font-bold text-orange-900 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white rounded-lg shadow p-4 group">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-orange-800 group-open:text-orange-600">
                {faq.q}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 text-orange-700 text-sm pl-2">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
      <footer className="w-full text-center py-8 text-orange-700 text-base opacity-90 z-10 bg-gradient-to-t from-orange-50 via-red-50 to-transparent mt-8 rounded-t-2xl shadow-inner">
        &copy; {new Date().getFullYear()} Timetable Generator. All rights reserved.
      </footer>
    </main>
  );
}
