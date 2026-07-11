import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"


export async function POST(request: Request) {


  const session = await getServerSession(authOptions)


  if (!session?.user?.email) {

    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      {
        status: 401,
      }
    )

  }



  const user = await prisma.user.findUnique({

    where: {
      email: session.user.email,
    },

  })



  if (!user) {

    return NextResponse.json(
      {
        error: "User not found",
      },
      {
        status: 404,
      }
    )

  }



  // Check if user already has a home

  const existingHome =
    await prisma.homeMember.findUnique({

      where: {
        userId: user.id,
      },

    })



  if (existingHome) {

    return NextResponse.json(
      {
        error: "You already belong to a home",
      },
      {
        status: 400,
      }
    )

  }



  const body = await request.json()

  const code = body.code?.trim()



  if (!code) {

    return NextResponse.json(
      {
        error: "Invite code required",
      },
      {
        status: 400,
      }
    )

  }



  // Find waiting home

  const pendingHome =
    await prisma.pendingHome.findUnique({

      where: {
        inviteCode: code,
      },

    })



  if (!pendingHome) {

    return NextResponse.json(
      {
        error: "Invalid or expired code",
      },
      {
        status: 404,
      }
    )

  }



  // Check expiry

  if (pendingHome.expiresAt < new Date()) {


    await prisma.pendingHome.delete({

      where: {
        id: pendingHome.id,
      },

    })


    return NextResponse.json(
      {
        error: "Code expired",
      },
      {
        status: 400,
      }
    )

  }



  // Prevent creator joining own code

  if (pendingHome.creatorId === user.id) {

    return NextResponse.json(
      {
        error: "You cannot join your own home",
      },
      {
        status: 400,
      }
    )

  }



  // Create actual home

  const home =
    await prisma.home.create({

      data: {

        name: "New ARiya Home 🏠",

        inviteCode: code,


        members: {

          create: [

            {
              userId: pendingHome.creatorId,
            },


            {
              userId: user.id,
            },

          ],

        },

      },

    })



  // Remove waiting room

  await prisma.pendingHome.delete({

    where: {
      id: pendingHome.id,
    },

  })



  return NextResponse.json({

    success: true,

    homeId: home.id,

  })


}