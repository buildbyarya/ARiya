import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET(request:Request){


const {searchParams}=new URL(request.url)


const code =
searchParams.get("code")



if(!code){

return NextResponse.json({
joined:false
})

}



const home =
await prisma.home.findUnique({

where:{
inviteCode:code
}

})



return NextResponse.json({

joined:!!home

})


}