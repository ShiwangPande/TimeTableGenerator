import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const periods = await prisma.academicPeriod.findMany({
    orderBy: { startDate: "asc" }
  })
  return NextResponse.json(periods)
} 