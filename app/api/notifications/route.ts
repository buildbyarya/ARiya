import {getServerSession} from "next-auth"
import {NextResponse} from "next/server"
import {authOptions} from "@/lib/auth"
import {prisma} from "@/lib/prisma"

export async function GET(){
 const s=await getServerSession(authOptions);if(!s?.user?.email)return NextResponse.json({notifications:[],events:[]},{status:401})
 const u=await prisma.user.findUnique({where:{email:s.user.email}});if(!u)return NextResponse.json({notifications:[],events:[]},{status:401})
 const [a,declined]=await Promise.all([
  prisma.watchInvite.findMany({where:{recipientId:u.id,status:"PENDING",expiresAt:{gt:new Date()}},include:{sender:true},orderBy:{createdAt:"desc"}}),
  prisma.watchInvite.findMany({where:{senderId:u.id,status:"DECLINED",respondedAt:{gt:new Date(Date.now()-120000)}},include:{recipient:true},orderBy:{respondedAt:"desc"}})
 ])
 return NextResponse.json({
  notifications:a.map(i=>({id:i.id,text:(i.sender.nickname||i.sender.name||"Someone")+" invited you to watch YouTube",customMessage:i.customMessage,expiresAt:i.expiresAt.toISOString()})),
  events:declined.map(i=>({id:"declined-"+i.id,text:(i.recipient.nickname||i.recipient.name||"Your partner")+" declined your Watch Together invitation."}))
 })
}