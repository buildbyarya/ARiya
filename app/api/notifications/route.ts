import {getServerSession} from "next-auth"
import {NextResponse} from "next/server"
import {authOptions} from "@/lib/auth"
import {prisma} from "@/lib/prisma"

export async function GET(){
 const s=await getServerSession(authOptions);if(!s?.user?.email)return NextResponse.json({notifications:[],events:[]},{status:401})
 const u=await prisma.user.findUnique({where:{email:s.user.email}});if(!u)return NextResponse.json({notifications:[],events:[]},{status:401})
 const since=new Date(Date.now()-120000)
 const [incoming,responded,replies]=await Promise.all([
  prisma.watchInvite.findMany({where:{recipientId:u.id,status:"PENDING",expiresAt:{gt:new Date()}},include:{sender:true},orderBy:{createdAt:"desc"}}),
  prisma.watchInvite.findMany({where:{senderId:u.id,status:{in:["DECLINED","ACCEPTED"]},respondedAt:{gt:since}},include:{recipient:true},orderBy:{respondedAt:"desc"}}),
  prisma.watchInvite.findMany({where:{senderId:u.id,status:"PENDING",customMessage:{not:null},createdAt:{gt:since}},include:{recipient:true},orderBy:{createdAt:"desc"}})
 ])
 return NextResponse.json({
  notifications:incoming.map(i=>({id:i.id,text:(i.sender.nickname||i.sender.name||"Someone")+" invited you to watch YouTube",customMessage:i.customMessage,createdAt:i.createdAt.toISOString(),expiresAt:i.expiresAt.toISOString()})),
  events:[
   ...responded.map(i=>({id:(i.status==="ACCEPTED"?"accepted-":"declined-")+i.id,text:(i.recipient.nickname||i.recipient.name||"Your partner")+(i.status==="ACCEPTED"?" accepted your Watch Together invitation. They are watching with you now.":" declined your Watch Together invitation."),kind:i.status==="ACCEPTED"?"accepted":"declined"})),
   ...replies.map(i=>({id:"reply-"+i.id+"-"+i.customMessage,text:(i.recipient.nickname||i.recipient.name||"Your partner")+" replied: "+i.customMessage,kind:"reply"}))
  ]
 })
}
