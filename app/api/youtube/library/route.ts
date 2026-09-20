import { NextResponse } from "next/server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

import { prisma } from "@/lib/prisma"

import { getUserHome } from "@/lib/home"

async function getContext() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!email) return null

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) return null

  const home = await getUserHome(user.id)

  if (!home) return null

  return { user, home }
}

function normalizeType(value: unknown) {
  if (value === "liked") return "LIKED"
  if (value === "watch_later") return "WATCH_LATER"
  return null
}

export async function GET() {
  const context = await getContext()

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const videos = await prisma.libraryVideo.findMany({
    where: {
      homeId: context.home.id,
      type: { in: ["LIKED", "WATCH_LATER"] },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(videos)
}

export async function POST(request: Request) {
  const context = await getContext()

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const videoId = String(body?.videoId || "").trim()
  const type = normalizeType(body?.type)

  if (!videoId || !type) {
    return NextResponse.json(
      { error: "Invalid library item" },
      { status: 400 }
    )
  }

  const existing = await prisma.libraryVideo.findFirst({
    where: {
      homeId: context.home.id,
      videoId,
      type,
    },
  })

  if (existing) return NextResponse.json(existing)

  const created = await prisma.libraryVideo.create({
    data: {
      homeId: context.home.id,
      videoId,
      type,
      title: null,
      thumbnail: null,
      channel: null,
    },
  })

  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(request: Request) {
  const context = await getContext()

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const videoId = String(body?.videoId || "").trim()
  const type = normalizeType(body?.type)

  if (!videoId || !type) {
    return NextResponse.json(
      { error: "Invalid library item" },
      { status: 400 }
    )
  }

  await prisma.libraryVideo.deleteMany({
    where: {
      homeId: context.home.id,
      videoId,
      type,
    },
  })

  return NextResponse.json({ ok: true })
}