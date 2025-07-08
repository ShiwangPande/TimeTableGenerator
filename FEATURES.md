# Timetable Generator – Feature Documentation

## Table of Contents
1. [Feature Checklist & Status](#feature-checklist--status)
2. [File Structure Overview](#file-structure-overview)
3. [Feature Details & Implementation](#feature-details--implementation)
4. [Extra Features & Utilities](#extra-features--utilities)

---

## Feature Checklist & Status

| Feature                                      | Status      | Key Files/Notes                                      |
|-----------------------------------------------|-------------|------------------------------------------------------|
| AM/PM labels                                 | ✅          | `lib/timetable.ts`, `components/timeslots-table.tsx` |
| Bulk-apply slots                             | ✅          | `components/bulk-timeslot-entry.tsx`                 |
| No Sat/Sun                                   | ✅          | `lib/timetable.ts`                                   |
| Grade dropdown                               | ✅          | `components/generate-timetable-form.tsx`             |
| Teacher dropdown                             | ✅          | `components/generate-timetable-form.tsx`             |
| 1 teacher → many grades                      | ✅          | `components/timetable-view.tsx`                      |
| IB filters                                   | ✅          | `components/timetable-filters.tsx`, `lib/timetable.ts`, `prisma/schema.prisma` |
| Calendar event blocking (holidays, exams)     | ✅          | `prisma/schema.prisma`, `prisma/seed.ts`, `lib/timetable.ts` |
| Full-week grid                               | ✅          | `components/timetable-grid.tsx`                      |
| Multi-section                                | ✅          | `components/classes-table.tsx`                       |
| Drag-and-drop                                | ✅          | `components/dnd-provider.tsx`                        |
| Multi-subject per slot                       | ✅          | `components/multi-subject-assignment.tsx`            |
| Color-coding                                 | ✅          | `lib/timetable.ts`, `components/timetable-slot.tsx`  |
| Excel export                                 | ✅          | `app/api/teacher/export/excel/route.ts`              |
| Print view                                   | ✅          | `app/teacher/print/route.ts`                         |
| Year-view calendar                           | ✅          | `components/year-calendar.tsx`                       |
| Assign events to timetable                   | ✅          | `components/simple-calendar.tsx`, `prisma/seed.ts`   |
| Color-picker for subjects                    | ✅          | `components/create-subject-dialog.tsx`               |
| Persistence of edits                         | ✅          | API routes, DB                                       |
| Responsive UI                                | ✅          | Tailwind, UI components                              |
| User management (roles)                      | ✅          | `components/user-management.tsx`, `app/admin/users/page.tsx` |
| Notification badge for swap requests         | ✅          | `components/notification-badge.tsx`, `components/top-nav.tsx` |
| Student/teacher onboarding                   | ✅          | Onboarding flows in student/teacher pages, server actions |
| AcademicEvent model & IB schema              | ✅          | `prisma/schema.prisma`, `prisma/seed.ts`             |

---

## File Structure Overview

```
timetable-generator/
├── app/
│   ├── admin/
│   │   ├── classes/...
│   │   ├── dashboard/...
│   │   ├── timetable/generate/...
│   │   ├── users/...
│   │   └── ...
│   ├── api/
│   │   ├── teacher/export/...
│   │   ├── student/export/...
│   │   ├── timetable/assign/route.ts
│   │   ├── ...
│   ├── student/
│   │   ├── timetable/page.tsx
│   │   ├── export/page.tsx
│   │   ├── print/page.tsx
│   │   └── ...
│   ├── teacher/
│   │   ├── timetable/page.tsx
│   │   ├── download/page.tsx
│   │   ├── print/page.tsx
│   │   └── ...
│   └── ...
├── components/
│   ├── timetable-grid.tsx
│   ├── timetable-slot.tsx
│   ├── dnd-provider.tsx
│   ├── multi-subject-assignment.tsx
│   ├── bulk-timeslot-entry.tsx
│   ├── generate-timetable-form.tsx
│   ├── classes-table.tsx
│   ├── create-subject-dialog.tsx
│   ├── year-calendar.tsx
│   ├── simple-calendar.tsx
│   ├── timetable-filters.tsx
│   ├── ...
├── lib/
│   ├── timetable.ts
│   ├── auth.ts
│   ├── notifications.ts
│   ├── prisma.ts
│   └── ...
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── styles/
│   └── globals.css
├── tailwind.config.ts
├── README.md
├── FEATURES.md (this file)
└── ...
```

---

## Feature Details & Implementation

### 1. Time‑Slot Management
- **AM/PM labels:**
  - `lib/timetable.ts` (time slot logic, label formatting)
  - `components/timeslots-table.tsx` (renders time slots)
- **Bulk-apply one day's slots:**
  - `components/bulk-timeslot-entry.tsx` (UI for bulk entry)
- **No Saturday/Sunday:**
  - `lib/timetable.ts` (logic only for Mon–Fri)

### 2. User Flows & Filters
- **Grade/Teacher dropdowns:**
  - `components/generate-timetable-form.tsx` (dropdowns for class/teacher)
- **1 teacher → many grades:**
  - `components/timetable-view.tsx` (multi-grade/teacher view)
- **IB filters:**
  - `components/timetable-filters.tsx` (HL/SL, subject group filters)

### 3. Timetable Views
- **Full-week grid:**
  - `components/timetable-grid.tsx` (Mon–Fri grid)
- **Multi-section:**
  - `components/classes-table.tsx` (sections)
  - `prisma/schema.prisma` (class model)

### 4. Editing & Interaction
- **Drag-and-drop:**
  - `components/dnd-provider.tsx`, `components/timetable-grid.tsx`, `components/timetable-slot.tsx`
- **Multi-subject per slot:**
  - `components/multi-subject-assignment.tsx`, `app/api/timetable/assign/route.ts`
- **Color-coding:**
  - `lib/timetable.ts`, `components/timetable-slot.tsx`

### 5. Data Integration & Export
- **Excel export:**
  - `app/api/teacher/export/excel/route.ts`, `app/api/student/export/excel/route.ts`
- **Print view:**
  - `app/teacher/print/route.ts`, `app/student/print/route.ts`

### 6. Calendar & Events
- **Year-view calendar:**
  - `components/year-calendar.tsx`, `components/simple-year-calendar.tsx`
- **Assign events to timetable:**
  - `components/simple-calendar.tsx` (partial, see also `prisma/seed.ts` for holidays)

### 7. Admin & UX Enhancements
- **Color-picker for subjects:**
  - `components/create-subject-dialog.tsx`
- **Persistence of edits:**
  - All API routes (e.g., `app/api/timetable/assign/route.ts`)
- **Responsive UI:**
  - Tailwind classes in all UI components, `styles/globals.css`, `tailwind.config.ts`

---

## Extra Features & Utilities

### 1. Notifications
- **Description:** Email and in-app notifications for events like swap requests.
- **Location:** `lib/notifications.ts`, `components/notification-badge.tsx`, `components/top-nav.tsx`

### 2. User Management
- **Description:** Admins can view and change user roles.
- **Location:** `components/user-management.tsx`, `app/admin/users/page.tsx`, `app/api/users/[id]/role/route.ts`

### 3. Tour/Onboarding
- **Description:** Interactive onboarding tours for Admin, Teacher, and Student roles.
- **Location:** `components/admin-welcome-tour.tsx`, `components/teacher-welcome-tour.tsx`, `components/student-welcome-tour.tsx`, `components/tour-provider.tsx`

### 4. Role-based Access Control
- **Description:** Middleware and utility functions to restrict access by user role.
- **Location:** `middleware.ts`, `lib/auth.ts`

### 5. Swap Requests
- **Description:** Teachers can request and process timetable swaps.
- **Location:** `components/swap-requests-table.tsx`, `app/api/timetable/swap/route.ts`, `TEACHER_SWAP_GUIDE.md`

### 6. Bulk Data Entry
- **Description:** Bulk entry for time slots and assignments.
- **Location:** `components/bulk-timeslot-entry.tsx`, `app/api/timetable/assign/route.ts`

### 7. Debug/Testing Endpoints
- **Description:** API endpoints for testing and debugging (e.g., create test swap, check teacher).
- **Location:** `app/api/debug/`

### 8. Theming/Providers
- **Description:** Theme provider and context for consistent UI.
- **Location:** `components/theme-provider.tsx`, `components/providers.tsx`

### 9. Academic Calendar
- **Description:** Academic periods, holidays, and calendar integration.
- **Location:** `prisma/seed.ts`, `components/simple-calendar.tsx`, `components/year-calendar.tsx`

### 10. Multi-auth Support
- **Description:** Clerk integration for authentication.
- **Location:** `lib/auth.ts`, `middleware.ts`, `app/auth/`

---

## Notes
- For any feature marked as partial, see the referenced files for extension points.
- For deeper code-level references, search for the feature keyword in the codebase. 