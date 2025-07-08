# Timetable Generator – System Design

## Overview
A modern, role-based timetable management system for schools, built with Next.js, TypeScript, Prisma, and Clerk.js. Supports admin, teacher, and student flows, robust export features, notifications, and advanced filtering (IB, calendar events).

---

## Architecture
- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes (app/api/), server actions
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** Clerk.js (multi-role, social login)
- **Notifications:** In-app (real-time), Email (Nodemailer/Gmail)
- **Export:** Excel, PDF, CSV, ZIP (XLSX, JSZip)

---

## Main Modules & Flows
- **Authentication & Role Routing:**
  - Users log in via Clerk.js
  - Role-based routing directs to Admin, Teacher, or Student dashboards
- **Admin Dashboard:**
  - Manage classes, teachers, subjects, rooms
  - Generate timetables (for all, by class, or by teacher)
  - User management (change roles)
  - View and process swap requests
- **Teacher Dashboard:**
  - View, export, and print personal timetable
  - Request swaps
  - Download all-in-one ZIP (Excel, PDF, CSV, summary)
- **Student Dashboard:**
  - View class timetable
  - Export/print timetable
  - Onboarding flow for new students (class selection)
- **Timetable Generation:**
  - Admin triggers generation via UI
  - API `/api/generate` calls `lib/timetable.ts` logic
  - Data: Classes, Subjects, Teachers, TimeSlots, Rooms, AcademicEvents
  - IB filtering and calendar event blocking applied
- **Export/Download:**
  - Teacher/Student can export timetable in multiple formats
  - API endpoints: `/api/teacher/export/*`, `/api/student/export/*`
- **Swap Requests:**
  - Teachers can request swaps via UI
  - API `/api/timetable/swap` handles logic
- **Notifications:**
  - In-app badge for pending swaps
  - Email notifications for key events
- **Academic Calendar:**
  - Events/holidays block timetable generation
  - Seeded via `prisma/seed.ts`, used in `lib/timetable.ts`

---

## Data Model (Prisma)
- **User** (Clerk)
- **Class** (name, section, level)
- **Teacher** (userId, ...)
- **Student** (userId, classId)
- **Subject** (name, ibGroup, level, teacherId, classId)
- **Room** (name, capacity)
- **TimeSlot** (label, startTime, endTime)
- **TimetableEntry** (classId, subjectId, roomId, timeSlotId, dayOfWeek, colorCode)
- **AcademicEvent** (date, type, description)
- **SwapRequest** (fromTeacherId, toTeacherId, timetableEntryId, status)

---

## Key Technologies
- **Next.js 14 (App Router)**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Clerk.js**
- **Tailwind CSS, shadcn/ui**
- **React DnD**
- **Nodemailer**
- **XLSX, JSZip**

---

## Flow Chart
See `FLOW_CHART.md` for a visual flow of the main system processes.

---

## Notes
- All API routes are protected by role-based access control.
- Timetable generation is idempotent and clears previous entries for the selected scope.
- Export endpoints provide multi-format, all-in-one downloads for teachers and students.
- Academic events and IB filtering are enforced at generation time. 