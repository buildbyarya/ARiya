import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"


function generateInviteCode() {

  const random =
    Math.random()
      .toString(36)
      .substring(2,8)
      .toUpperCase()


  return `AR-${random}`

}



export async function POST() {


  const session = await getServerSession(authOptions)


  if(!session?.user?.email){

    return NextResponse.json(
      {
        error:"Not authenticated"
      },
      {
        status:401
      }
    )

  }



  const user = await prisma.user.findUnique({

    where:{
      email:session.user.email
    }

  })



  if(!user){

    return NextResponse.json(
      {
        error:"User not found"
      },
      {
        status:404
      }
    )

  }



  const existingHome =
    await prisma.homeMember.findUnique({

      where:{
        userId:user.id
      }

    })



  if(existingHome){

    return NextResponse.json(
      {
        error:"You already have a home"
      },
      {
        status:400
      }
    )

  }



  const existingPending =
    await prisma.pendingHome.findFirst({

      where:{
        creatorId:user.id
      }

    })



  if(existingPending){

    return NextResponse.json({

      inviteCode: existingPending.inviteCode

    })

  }



  const inviteCode =
    generateInviteCode()



  const pendingHome =
    await prisma.pendingHome.create({

      data:{

        inviteCode,

        creatorId:user.id,

        expiresAt:
          new Date(
            Date.now() + 60 * 60 * 1000
          )

      }

    })



  return NextResponse.json({

    success:true,

    inviteCode:
      pendingHome.inviteCode

  })


}