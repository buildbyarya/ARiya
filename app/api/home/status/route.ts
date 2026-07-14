import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(request.url)


  const code =
    searchParams.get("code")


  if (!code) {

    return NextResponse.json(
      {
        error: "Code required"
      },
      {
        status:400
      }
    )

  }


  const pendingHome =
    await prisma.pendingHome.findUnique({

      where:{
        inviteCode: code
      }

    })


  // Still waiting
  if(pendingHome){

    return NextResponse.json({

      joined:false

    })

  }



  // Home already created
  const home =
    await prisma.home.findUnique({

      where:{
        inviteCode: code
      }

    })



  if(home){

    return NextResponse.json({

      joined:true,

      homeId:home.id

    })

  }



  return NextResponse.json({

    error:"Home not found"

  },{
    status:404
  })


}