import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { addVideoToLibrary } from "@/lib/library"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      homeMembership: true,
    },
  })

  if (!user?.homeMembership) {
    return NextResponse.json(
      { error: "Home not found" },
      { status: 404 }
    )
  }

  const body = await request.json()

  const { videoId } = body

  if (typeof videoId !== "string" || !videoId) {
    return NextResponse.json(
      { error: "videoId is required" },
      { status: 400 }
    )
  }

  const saved = await addVideoToLibrary({
    homeId: user.homeMembership.homeId,
    videoId,
    type: "WATCH_LATER",
  })

  return NextResponse.json(saved)
}
