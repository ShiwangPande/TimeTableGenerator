import { prisma } from "./prisma"
import { DayOfWeek, type SubjectCategory } from "@prisma/client"

interface GenerateOptions {
  classId?: string
  teacherId?: string
}

const DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
]

const SUBJECT_COLORS: Record<SubjectCategory, string> = {
  Individual: "#3B82F6", // Blue
  Societies: "#10B981", // Green
  Sciences: "#F59E0B", // Amber
}

export async function generateTimetable(options: GenerateOptions = {}) {
  const { classId, teacherId } = options
  const [timeSlots, rooms, subjects] = await Promise.all([
    prisma.timeSlot.findMany({
      orderBy: { startTime: "asc" },
    }),
    prisma.room.findMany(),
    classId 
      ? prisma.subject.findMany({
          where: { classId },
          include: { teacher: true, class: true },
        })
      : teacherId
      ? prisma.subject.findMany({
          where: { teacherId },
          include: { teacher: true, class: true },
        })
      : prisma.subject.findMany({
          include: { teacher: true, class: true },
        })
  ])
  if (timeSlots.length === 0) {
    throw new Error("No time slots found. Please create time slots first.")
  }
  if (rooms.length === 0) {
    throw new Error("No rooms found. Please create rooms first.")
  }
  if (subjects.length === 0) {
    throw new Error("No subjects found. Please create subjects first.")
  }
  if (classId) {
    await prisma.timetableEntry.deleteMany({
      where: { classId },
    })
  } else if (teacherId) {
    const teacherSubjects = await prisma.subject.findMany({
      where: { teacherId },
    })
    const subjectIds = teacherSubjects.map((s) => s.id)
    await prisma.timetableEntry.deleteMany({
      where: { subjectId: { in: subjectIds } },
    })
  } else {
    await prisma.timetableEntry.deleteMany({})
  }
  const mondayEntries = []
  const usedSlots = new Set<string>()
  for (const subject of subjects) {
    const availableSlots = timeSlots.filter((slot) => !usedSlots.has(`${subject.classId}-${slot.id}`))

    if (availableSlots.length === 0) continue

    const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)]


    
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)]

    const entry = {
      classId: subject.classId,
      subjectId: subject.id,
      roomId: randomRoom.id,
      timeSlotId: randomSlot.id,
      dayOfWeek: DayOfWeek.MONDAY,
      colorCode: SUBJECT_COLORS[subject.category],
    }

    mondayEntries.push(entry)

    if (!subject.multiSlotAllowed) {
      usedSlots.add(`${subject.classId}-${randomSlot.id}`)
    }
  }
  await prisma.timetableEntry.createMany({
    data: mondayEntries,
  })
  for (const day of DAYS.slice(1)) {
    const dayEntries = mondayEntries.map((entry) => ({
      ...entry,
      dayOfWeek: day,
    }))

    await prisma.timetableEntry.createMany({
      data: dayEntries,
    })
  }

  return { success: true, message: "Timetable generated successfully" }
}

export async function getTimetable(options: {
  classId?: string
  teacherId?: string
  studentId?: string
  curriculum?: string
  section?: string
}) {
  const { classId, teacherId, studentId, curriculum, section } = options

  const whereClause: any = {}

  if (classId) {
    whereClause.classId = classId
  } else if (teacherId) {
    whereClause.subject = {
      teacherId,
    }
  } else if (studentId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })
    if (student) {
      whereClause.classId = student.classId
    }
  }

  // Add curriculum and section filters
  if (curriculum || section) {
    whereClause.class = {}
    
    if (curriculum) {
      whereClause.class.level = curriculum
    }
    
    if (section) {
      whereClause.class.section = section
    }
  }

  const entries = await prisma.timetableEntry.findMany({
    where: whereClause,
    include: {
      subject: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
      },
      room: true,
      timeSlot: true,
      class: true,
    },
    orderBy: [{ dayOfWeek: "asc" }, { timeSlot: { startTime: "asc" } }],
  })

  return entries
}
