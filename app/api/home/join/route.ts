import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"



export async function POST(request: Request) {


  const session =
    await getServerSession(authOptions)



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




  const body =
    await request.json()



  const code =
    body.code?.trim()



  const nickname =
    body.nickname?.trim()





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



  if (!nickname) {

    return NextResponse.json(
      {
        error: "Nickname required",
      },
      {
        status: 400,
      }
    )

  }






  const user =
    await prisma.user.findUnique({

      where:{
        email: session.user.email
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
        error:"You already belong to a home"
      },
      {
        status:400
      }
    )

  }






  const pendingHome =
    await prisma.pendingHome.findUnique({

      where:{
        inviteCode:code
      }

    })




  if(!pendingHome){

    return NextResponse.json(
      {
        error:"Invalid or expired code"
      },
      {
        status:404
      }
    )

  }






  if(pendingHome.expiresAt < new Date()){


    await prisma.pendingHome.delete({

      where:{
        id:pendingHome.id
      }

    })


    return NextResponse.json(
      {
        error:"Code expired"
      },
      {
        status:400
      }
    )

  }






  if(pendingHome.creatorId === user.id){

    return NextResponse.json(
      {
        error:"You cannot join your own home"
      },
      {
        status:400
      }
    )

  }







  // Save joining user's nickname

  await prisma.user.update({

    where:{
      id:user.id
    },

    data:{
      nickname
    }

  })





const creator =
  await prisma.user.findUnique({

    where:{
      id: pendingHome.creatorId
    }

  })

  const home =
    await prisma.home.create({

      data:{


        name:"ARiya Home 🏠",


        inviteCode:code,



        members:{


          create:[

{

 userId:
   pendingHome.creatorId,

 nickname:
   creator?.nickname

},



            {

              userId:
                user.id,

              nickname

            }


          ]

        }


      }

    })






  await prisma.pendingHome.delete({

    where:{
      id:pendingHome.id
    }

  })







  return NextResponse.json({

    success:true,

    homeId:home.id

  })


}