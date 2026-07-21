import { NextRequest, NextResponse } from "next/server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

import { prisma } from "@/lib/prisma"



export async function GET() {

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

  const videos =
    await prisma.libraryVideo.findMany({

      where: {
        homeId: user.homeMembership.homeId,
      },

      orderBy: {
        createdAt: "desc",
      },

    })

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

  const video =
    await prisma.libraryVideo.create({

      data: {

        homeId:
          user.homeMembership.homeId,

        videoId:
          body.videoId,

        title:
          body.title,

        thumbnail:
          body.thumbnail,

        channel:
          body.channel,

        type:
          body.type,

      },

    })

  return NextResponse.json(video)

}