# Timetable Generator – System Flow Chart

```mermaid
flowchart TD
  Login[Login/Signup (Clerk.js)] --> RoleCheck{Role?}
  RoleCheck -- Admin --> AdminDash[Admin Dashboard]
  RoleCheck -- Teacher --> TeacherDash[Teacher Dashboard]
  RoleCheck -- Student --> StudentDash[Student Dashboard]

  AdminDash --> Manage[Manage Classes/Teachers/Subjects/Rooms]
  AdminDash --> Generate[Generate Timetable]
  AdminDash --> UserMgmt[User Management]
  AdminDash --> Swaps[View Swap Requests]
  Generate --> APIGen[API: /api/generate]
  APIGen --> DB[Prisma DB]
  DB --> Calendar[Academic Events/Calendar Blocking]
  DB --> IB[IB Filtering]

  TeacherDash --> ViewTT[View Timetable]
  TeacherDash --> ExportTT[Export/Print/Download Timetable]
  TeacherDash --> RequestSwap[Request Swap]
  ExportTT --> APIExport[API: /api/teacher/export/*]
  RequestSwap --> APISwap[API: /api/timetable/swap]

  StudentDash --> ViewClassTT[View Class Timetable]
  StudentDash --> ExportClassTT[Export/Print Timetable]
  StudentDash --> Onboard[Onboarding (Class Selection)]
  ExportClassTT --> APIStudentExport[API: /api/student/export/*]

  Swaps & RequestSwap --> Notif[Notifications/Email]
  Notif --> Badge[Notification Badge]
``` 