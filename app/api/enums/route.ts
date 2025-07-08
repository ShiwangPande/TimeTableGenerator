export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { Role, ClassLevel, IBLevel, IBGroup, SubjectCategory } from "@prisma/client"

export async function GET() {
  try {
    await requireRole(Role.ADMIN)
    
    return NextResponse.json({
      classLevels: Object.values(ClassLevel),
      ibLevels: Object.values(IBLevel),
      ibGroups: Object.values(IBGroup),
      subjectCategories: Object.values(SubjectCategory),
    })
  } catch (error) {
    console.error("Get enums error:", error)
    return NextResponse.json(
      { error: "Failed to fetch enum values" },
      { status: 500 }
    )
  }
} 