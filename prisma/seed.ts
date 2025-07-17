import { PrismaClient, Role, AcademicPeriodType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const timeSlots = [
    { label: "08:00 AM", startTime: new Date("2024-01-01T08:00:00"), endTime: new Date("2024-01-01T09:00:00") },
    { label: "09:00 AM", startTime: new Date("2024-01-01T09:00:00"), endTime: new Date("2024-01-01T10:00:00") },
    { label: "10:00 AM", startTime: new Date("2024-01-01T10:00:00"), endTime: new Date("2024-01-01T11:00:00") },
    { label: "11:00 AM", startTime: new Date("2024-01-01T11:00:00"), endTime: new Date("2024-01-01T12:00:00") },
    { label: "12:00 PM", startTime: new Date("2024-01-01T12:00:00"), endTime: new Date("2024-01-01T13:00:00") },
    { label: "01:00 PM", startTime: new Date("2024-01-01T13:00:00"), endTime: new Date("2024-01-01T14:00:00") },
    { label: "02:00 PM", startTime: new Date("2024-01-01T14:00:00"), endTime: new Date("2024-01-01T15:00:00") },
    { label: "03:00 PM", startTime: new Date("2024-01-01T15:00:00"), endTime: new Date("2024-01-01T16:00:00") },
  ]

  for (const slot of timeSlots) {
    await prisma.timeSlot.upsert({
      where: { label: slot.label },
      update: {},
      create: slot,
    })
  }

  const rooms = [
    { name: "Room A1", capacity: 30 },
    { name: "Room A2", capacity: 25 },
    { name: "Room B1", capacity: 35 },
    { name: "Room B2", capacity: 30 },
    { name: "Lab 1", capacity: 20 },
    { name: "Lab 2", capacity: 20 },
  ]

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {},
      create: room,
    })
  }

  const academicPeriods = [
    {
      name: "Fall Term",
      type: AcademicPeriodType.TERM,
      startDate: new Date("2024-09-01"),
      endDate: new Date("2024-12-20"),
      description: "First semester of the academic year",
      colorCode: "#3B82F6",
      isActive: true,
    },
    {
      name: "Winter Break",
      type: AcademicPeriodType.HOLIDAY,
      startDate: new Date("2024-12-21"),
      endDate: new Date("2025-01-05"),
      description: "Winter holiday break",
      colorCode: "#EF4444",
      isActive: true,
    },
    {
      name: "Spring Term",
      type: AcademicPeriodType.TERM,
      startDate: new Date("2025-01-06"),
      endDate: new Date("2025-05-15"),
      description: "Second semester of the academic year",
      colorCode: "#10B981",
      isActive: true,
    },
    {
      name: "Spring Break",
      type: AcademicPeriodType.HOLIDAY,
      startDate: new Date("2025-03-15"),
      endDate: new Date("2025-03-22"),
      description: "Spring break holiday",
      colorCode: "#F59E0B",
      isActive: true,
    },
    {
      name: "Final Exams",
      type: AcademicPeriodType.EXAM,
      startDate: new Date("2025-05-16"),
      endDate: new Date("2025-05-30"),
      description: "End of year examinations",
      colorCode: "#8B5CF6",
      isActive: true,
    },
    {
      name: "Summer Break",
      type: AcademicPeriodType.HOLIDAY,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
      description: "Summer vacation",
      colorCode: "#06B6D4",
      isActive: true,
    },
  ]

  for (const period of academicPeriods) {
    await prisma.academicPeriod.upsert({
      where: { 
        name_type: {
          name: period.name,
          type: period.type,
        }
      },
      update: {},
      create: period,
    })
  }

  await prisma.user.upsert({
    where: { email: "pandeyshiwang2003@gmail.com" },
    update: {},
    create: {
      email: "pandeyshiwang2003@gmail.com",
      name: "System Administrator",
      role: Role.ADMIN,
      clerkId: "user_2zVqVoO7848pGi2vnJNY87CRTaw",
    },
  })

  const ibSubjects = [
    // Languages
    { name: "English A: Language and Literature", ibGroup: "LANGUAGES", level: "DP" },
    { name: "Spanish B", ibGroup: "LANGUAGES", level: "MYP" },
    { name: "French B", ibGroup: "LANGUAGES", level: "DP" },
    
    // Individuals and Societies
    { name: "History", ibGroup: "INDIVIDUALS_AND_SOCIETIES", level: "DP" },
    { name: "Geography", ibGroup: "INDIVIDUALS_AND_SOCIETIES", level: "MYP" },
    { name: "Economics", ibGroup: "INDIVIDUALS_AND_SOCIETIES", level: "DP" },
    { name: "Psychology", ibGroup: "INDIVIDUALS_AND_SOCIETIES", level: "DP" },
    
    // Sciences
    { name: "Biology", ibGroup: "SCIENCES", level: "DP" },
    { name: "Chemistry", ibGroup: "SCIENCES", level: "MYP" },
    { name: "Physics", ibGroup: "SCIENCES", level: "DP" },
    { name: "Environmental Systems", ibGroup: "SCIENCES", level: "MYP" },
    
    // Mathematics
    { name: "Mathematics: Analysis and Approaches", ibGroup: "MATHEMATICS", level: "DP" },
    { name: "Mathematics: Applications and Interpretation", ibGroup: "MATHEMATICS", level: "DP" },
    { name: "Mathematics", ibGroup: "MATHEMATICS", level: "MYP" },
    
    // Arts
    { name: "Visual Arts", ibGroup: "ARTS", level: "DP" },
    { name: "Music", ibGroup: "ARTS", level: "MYP" },
    { name: "Theatre", ibGroup: "ARTS", level: "DP" },
  ]
  // Seed IB subjects (assign to first teacher/class for demo)
  const firstTeacher = await prisma.teacher.findFirst()
  const firstClass = await prisma.class.findFirst()
  if (firstTeacher && firstClass) {
    for (const subj of ibSubjects) {
      await prisma.subject.create({
        data: {
          name: subj.name,
          ibGroup: subj.ibGroup as any,
          level: subj.level as any,
          teacherId: firstTeacher.id,
          classId: firstClass.id,
        },
      })
    }
  }
  // Seed AcademicEvents
  const academicEvents = [
    { title: "Winter Break", startDate: new Date("2024-12-21"), endDate: new Date("2025-01-05"), type: "Holiday" },
    { title: "Final Exams", startDate: new Date("2025-05-16"), endDate: new Date("2025-05-30"), type: "Exam" },
  ]
  for (const event of academicEvents) {
    await prisma.academicEvent.upsert({
      where: { title_type: { title: event.title, type: event.type } },
      update: {},
      create: event,
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
