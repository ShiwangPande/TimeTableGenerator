export const dynamic = 'force-dynamic';
import { requireRole } from "@/lib/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import nextDynamic from "next/dynamic";

const AdminDashboardClient = nextDynamic(() => import("@/components/admin-dashboard-client"), { ssr: false });

export default async function AdminDashboard() {
  await requireRole(Role.ADMIN)

  // Get dynamic statistics from database
  const [
    classCount,
    teacherCount,
    subjectCount,
    timeSlotCount,
    timetableCount,
    roomCount,
    pendingSwapRequests
  ] = await Promise.all([
    prisma.class.count(),
    prisma.teacher.count(),
    prisma.subject.count(),
    prisma.timeSlot.count(),
    prisma.timetableEntry.count(),
    prisma.room.count(),
    prisma.swapRequest.count({
      where: { status: "PENDING" }
    })
  ])

  return (
    <AdminDashboardClient
      classCount={classCount}
      teacherCount={teacherCount}
      subjectCount={subjectCount}
      timeSlotCount={timeSlotCount}
      timetableCount={timetableCount}
      roomCount={roomCount}
      pendingSwapRequests={pendingSwapRequests}
    />
  );
} 