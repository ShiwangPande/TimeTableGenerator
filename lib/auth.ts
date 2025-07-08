import { auth } from "@clerk/nextjs/server"
import { prisma } from "./prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

export function isAdmin(userId: string): boolean {
  if (!ADMIN_USER_ID) return false;
  return ADMIN_USER_ID.split(',').map(id => id.trim()).includes(userId);
}

export interface UserWithRole {
  id: string
  email: string
  name: string
  role: Role
  clerkId: string
  teacher?: {
    id: string
    userId: string
    createdAt: Date
    updatedAt: Date
    subjects: Array<{
      id: string
      name: string
      classId: string
    }>
  } | null
  student?: {
    id: string
    userId: string
    classId: string
    createdAt: Date
    updatedAt: Date
    class: {
      id: string
      name: string
      section: string
    }
  } | null
}

export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const hasClerkConfig = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                          process.env.CLERK_SECRET_KEY &&
                          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_here'

    if (!hasClerkConfig) {
      console.log("Clerk not configured, using mock authentication")
      const mockUser = await prisma.user.findFirst({
        where: { role: Role.ADMIN },
        include: {
          teacher: {
            include: {
              subjects: {
                select: {
                  id: true,
                  name: true,
                  classId: true,
                },
              },
            },
          },
          student: {
            include: {
              class: true,
            },
          },
        },
      })

      if (mockUser) {
        return mockUser
      }

      return await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User",
          role: Role.ADMIN,
          clerkId: "mock_admin_id",
        },
        include: {
          teacher: {
            include: {
              subjects: {
                select: {
                  id: true,
                  name: true,
                  classId: true,
                },
              },
            },
          },
          student: {
            include: {
              class: true,
            },
          },
        },
      })
    }

    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    let emailToUse: string | null = null
    try {
      const { currentUser } = await import("@clerk/nextjs/server")
      const clerkUser = await currentUser()
      
      if (clerkUser?.emailAddresses && clerkUser.emailAddresses.length > 0) {
        const primaryEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)
        emailToUse = primaryEmail?.emailAddress || clerkUser.emailAddresses[0].emailAddress
        
        console.log("Got email from Clerk user object:", emailToUse)
      }
    } catch (error) {
      console.error("Error getting email from Clerk user:", error)
      return null
    }

    if (!emailToUse) {
      try {
        const clerkUserData = await auth()
        emailToUse = clerkUserData.sessionClaims?.email as string
        console.log("Got email from session claims:", emailToUse)
      } catch (error) {
        console.error("Error getting email from session claims:", error)
        return null
      }
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        teacher: {
          include: {
            subjects: {
              select: {
                id: true,
                name: true,
                classId: true,
              },
            },
          },
        },
        student: {
          include: {
            class: true,
          },
        },
      },
    })

    console.log("User found by clerkId:", user ? `Yes - Role: ${user.role}` : "No")

    if (!user && emailToUse) {
      console.log("Looking for existing user with email:", emailToUse)
      
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: emailToUse,
            mode: 'insensitive'
          }
        },
        include: {
          teacher: {
            include: {
              subjects: {
                select: {
                  id: true,
                  name: true,
                  classId: true,
                },
              },
            },
          },
          student: {
            include: {
              class: true,
            },
          },
        },
      })

      console.log("User found by email:", user ? `Yes - Role: ${user.role}` : "No")

      if (user) {
        console.log("Updating clerkId for existing user:", user.email, "Role:", user.role)
        user = await prisma.user.update({
          where: { id: user.id },
          data: { clerkId: userId },
          include: {
            teacher: {
              include: {
                subjects: {
                  select: {
                    id: true,
                    name: true,
                    classId: true,
                  },
                },
              },
            },
            student: {
              include: {
                class: true,
              },
            },
          },
        })
        
        console.log("Updated user successfully. Final role:", user.role)
        return user
      }
    }

    if (!user) {
      const tempUser = await prisma.user.findFirst({
        where: {
          clerkId: {
            startsWith: "temp_"
          }
        },
        include: {
          teacher: {
            include: {
              subjects: {
                select: {
                  id: true,
                  name: true,
                  classId: true,
                },
              },
            },
          },
          student: {
            include: {
              class: true,
            },
          },
        },
      })

      if (tempUser) {
        console.log("Found user with temporary clerkId:", tempUser.email, "Role:", tempUser.role)
        user = await prisma.user.update({
          where: { id: tempUser.id },
          data: { clerkId: userId },
          include: {
            teacher: {
              include: {
                subjects: {
                  select: {
                    id: true,
                    name: true,
                    classId: true,
                  },
                },
              },
            },
            student: {
              include: {
                class: true,
              },
            },
          },
        })
        
        console.log("Updated temp user successfully. Final role:", user.role)
        return user
      }
    }

    if (!user) {
      if (!emailToUse) {
        console.log("No email available, cannot create user")
        return null
      }

      const existingUserByEmail = await prisma.user.findFirst({
        where: {
          email: {
            equals: emailToUse,
            mode: 'insensitive'
          }
        }
      })

      if (existingUserByEmail) {
        console.log("Found existing user by email during safety check:", existingUserByEmail.email, "Role:", existingUserByEmail.role)
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: { clerkId: userId },
          include: {
            teacher: {
              include: {
                subjects: {
                  select: {
                    id: true,
                    name: true,
                    classId: true,
                  },
                },
              },
            },
            student: {
              include: {
                class: true,
              },
            },
          },
        })
        
        console.log("Updated existing user during safety check. Final role:", user.role)
        return user
      }

      console.log("Creating new user with email:", emailToUse)
      user = await prisma.user.create({
        data: {
          email: emailToUse,
          name: emailToUse.split('@')[0],
          role: isAdmin(userId) ? Role.ADMIN : Role.STUDENT,
          clerkId: userId,
        },
        include: {
          teacher: {
            include: {
              subjects: {
                select: {
                  id: true,
                  name: true,
                  classId: true,
                },
              },
            },
          },
          student: {
            include: {
              class: true,
            },
          },
        },
      })

      console.log("Created new user. Role:", user.role)
    }

    return user
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  return user
}

export async function requireRole(role: Role): Promise<UserWithRole> {
  const user = await requireAuth()
  
  if (user.role !== role) {
    throw new Error(`Access denied. Required role: ${role}`)
  }
  
  return user
}

export async function requireAdminOrTeacher() {
  const user = await requireAuth()

  if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
    redirect("/")
  }

  return user
}

export async function requireAdmin(): Promise<UserWithRole> {
  return requireRole(Role.ADMIN)
}

export async function getRoleBasedRedirect() {
  const user = await getCurrentUser()
  
  if (!user) {
    return '/sign-in'
  }

  let redirectPath: string
  
  switch (user.role) {
    case Role.ADMIN:
      redirectPath = '/admin/dashboard'
      break
    case Role.TEACHER:
      redirectPath = '/teacher/timetable'
      break
    case Role.STUDENT:
      redirectPath = '/student/timetable'
      break
    default:
      redirectPath = '/student/timetable'
  }
  
  return redirectPath
}

export async function getUserRole(): Promise<Role | null> {
  const user = await getCurrentUser()
  return user?.role || null
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === Role.ADMIN
}

export async function isCurrentUserTeacher(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === Role.TEACHER
}

export async function isCurrentUserStudent(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === Role.STUDENT
}

export async function canTeacherEditSubject(subjectId: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user || user.role !== Role.TEACHER || !user.teacher) {
    return false
  }
  
  return user.teacher.subjects.some(subject => subject.id === subjectId)
}

export async function canTeacherEditTimetableEntry(entryId: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user || user.role !== Role.TEACHER || !user.teacher) {
    return false
  }
  
  const entry = await prisma.timetableEntry.findUnique({
    where: { id: entryId },
    include: { subject: true },
  })
  
  if (!entry) {
    return false
  }
  
  return user.teacher.subjects.some(subject => subject.id === entry.subjectId)
}

export async function canStudentViewClass(classId: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user || user.role !== Role.STUDENT || !user.student) {
    return false
  }
  
  return user.student.classId === classId
}

export async function getUserAccessibleData() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }
  
  switch (user.role) {
    case Role.ADMIN:
      return {
        type: 'admin',
        canEdit: true,
        canDelete: true,
        canCreate: true,
        accessibleClasses: 'all',
        accessibleSubjects: 'all',
        accessibleTeachers: 'all',
      }
      
    case Role.TEACHER:
      return {
        type: 'teacher',
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canRequestSwaps: true,
        accessibleSubjects: user.teacher?.subjects.map(s => s.id) || [],
        accessibleClasses: user.teacher?.subjects.map(s => s.classId) || [],
      }
      
    case Role.STUDENT:
      return {
        type: 'student',
        canEdit: false,
        canDelete: false,
        canCreate: false,
        accessibleClass: user.student?.classId,
        accessibleClassData: user.student?.class,
      }
      
    default:
      return null
  }
}
