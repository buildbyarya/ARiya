import { NextRequest, NextResponse } from "next/server"

import { LibraryVideoType } from "@prisma/client"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import {
  addVideoToLibrary,
  getLibrary,
  removeVideo,
} from "@/lib/library"
import { prisma } from "@/lib/prisma"



export async function GET(request: NextRequest) {

  const session =
    await getServerSession(authOptions)

  if (!session?.user?.email) {

    return NextResponse.json([], { status: 401 })

  }

  const user =
    await prisma.user.findUnique({

      where: {
        email: session.user.email,
      },

      include: {
        homeMembership: true,
      },

    })

  if (!user?.homeMembership) {

    return NextResponse.json([])

  }

  const requestedType = request.nextUrl.searchParams.get("type")

  if (
    requestedType !== null &&
    !Object.values(LibraryVideoType).includes(
      requestedType as LibraryVideoType
    )
  ) {
    return NextResponse.json(
      { error: "Invalid library type" },
      { status: 400 }
    )
  }

  const videos = await getLibrary(
    user.homeMembership.homeId,
    (requestedType as LibraryVideoType | null) ?? undefined
  )

  return NextResponse.json(videos)

}



export async function POST(
  request: NextRequest
) {

  const session =
    await getServerSession(authOptions)

  if (!session?.user?.email) {

    return NextResponse.json(
      {},
      { status: 401 }
    )

  }

  const user =
    await prisma.user.findUnique({

      where: {
        email: session.user.email,
      },

      include: {
        homeMembership: true,
      },

    })

  if (!user?.homeMembership) {

    return NextResponse.json(
      {},
      { status: 400 }
    )

  }

  const body =
    await request.json()

  const { videoId, type } = body

  if (
    typeof videoId !== "string" ||
    !Object.values(LibraryVideoType).includes(type)
  ) {
    return NextResponse.json(
      { error: "Invalid library video" },
      { status: 400 }
    )
  }

  const video = await addVideoToLibrary({
    homeId: user.homeMembership.homeId,
    videoId,
    type,
  })

  return NextResponse.json(video)

}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { error: "Library video ID is required" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { homeMembership: true },
  })

  if (!user?.homeMembership) {
    return NextResponse.json({ error: "Home not found" }, { status: 404 })
  }

  const removed = await removeVideo(id, user.homeMembership.homeId)

  if (!removed) {
    return NextResponse.json(
      { error: "Library video not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}
