import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function ctx() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return null
  const membership = await prisma.homeMember.findUnique({ where: { userId: user.id }, include: { home: { include: { members: true } } } })
  return membership ? { user, membership } : null
}
export async function GET(req: Request) {
  const c = await ctx(); if (!c) return NextResponse.json({error:"Unauthorized"},{status:401})
  const q = new URL(req.url).searchParams; const roomId=q.get("roomId")
  if (!roomId) {
    const invites=await prisma.watchInvite.findMany({where:{recipientId:c.user.id,status:"PENDING",expiresAt:{gt:new Date()}},include:{sender:true},orderBy:{createdAt:"desc"}})
    return NextResponse.json({invites:invites.map(i=>({id:i.id,text:`${i.sender.nickname||i.sender.name||"Someone"} invited you to watch YouTube`,customMessage:i.customMessage,expiresAt:i.expiresAt.toISOString()}))})
  }
  const room=await prisma.watchRoom.findFirst({where:{id:roomId,homeId:c.membership.home.id},include:{members:{include:{user:true}}}})
  if(!room)return NextResponse.json({error:"Room not found"},{status:404})
  const me=room.members.find(m=>m.userId===c.user.id); if(!me)return NextResponse.json({error:"Not in room"},{status:403})
  await prisma.watchRoomMember.update({where:{id:me.id},data:{lastSeenAt:new Date()}})
  const other=room.members.find(m=>m.userId!==c.user.id)
  return NextResponse.json({room:{id:room.id,videoId:room.videoId,position:room.position,playing:room.playing,volume:room.volume,playbackRate:room.playbackRate,version:room.version,otherPresent:Boolean(other&&!other.leftAt),otherNickname:other?.user.nickname||other?.user.name||"Your partner",otherLeftAt:other?.leftAt?.toISOString()||null}})
}
export async function POST(req:Request){
  const c=await ctx();if(!c)return NextResponse.json({error:"Unauthorized"},{status:401});const b=await req.json();const now=new Date()
  if(b.action==="create-invite"){const other=c.membership.home.members.find(m=>m.userId!==c.user.id);if(!other)return NextResponse.json({error:"No partner"},{status:400});const setting=await prisma.watchSetting.upsert({where:{userId:c.user.id},create:{userId:c.user.id},update:{}});const mins=[2,5,10,15].includes(setting.expiryMinutes)?setting.expiryMinutes:10;const room=await prisma.watchRoom.create({data:{homeId:c.membership.home.id,videoId:String(b.videoId),position:Number(b.position)||0,playing:Boolean(b.playing),volume:Math.max(0,Math.min(100,Number(b.volume)||100)),playbackRate:Number(b.playbackRate)||1}});await prisma.watchRoomMember.create({data:{roomId:room.id,userId:c.user.id}});const invite=await prisma.watchInvite.create({data:{homeId:room.homeId,roomId:room.id,senderId:c.user.id,recipientId:other.userId,videoId:room.videoId,position:room.position,expiresAt:new Date(now.getTime()+mins*60000)}});return NextResponse.json({inviteId:invite.id,roomId:room.id})}
  if(b.action==="respond"){const i=await prisma.watchInvite.findFirst({where:{id:String(b.inviteId),recipientId:c.user.id}});if(!i)return NextResponse.json({error:"Not found"},{status:404});if(i.status==="PENDING"&&i.expiresAt<=now)return NextResponse.json({error:"Expired"},{status:410});if(b.response==="decline"){await prisma.watchInvite.update({where:{id:i.id},data:{status:"DECLINED",respondedAt:now}});return NextResponse.json({status:"DECLINED"})}if(b.response==="reply"){await prisma.watchInvite.update({where:{id:i.id},data:{customMessage:String(b.message||"").slice(0,500)}});return NextResponse.json({status:"PENDING"})}if(b.response==="accept"){await prisma.watchInvite.update({where:{id:i.id},data:{status:"ACCEPTED",respondedAt:now}});await prisma.watchRoomMember.upsert({where:{roomId_userId:{roomId:i.roomId,userId:c.user.id}},create:{roomId:i.roomId,userId:c.user.id},update:{leftAt:null,lastSeenAt:now}});return NextResponse.json({status:"ACCEPTED",roomId:i.roomId})}}
  if(b.action==="sync"){const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}});if(!room||!room.members.some(m=>m.userId===c.user.id))return NextResponse.json({error:"Not in room"},{status:403});const u=await prisma.watchRoom.update({where:{id:room.id},data:{videoId:String(b.videoId||room.videoId),position:Math.max(0,Number(b.position)||0),playing:Boolean(b.playing),volume:Math.max(0,Math.min(100,Number(b.volume)||0)),playbackRate:Math.max(.25,Math.min(2,Number(b.playbackRate)||1)),version:{increment:1},lastActionAt:now}});return NextResponse.json({version:u.version})}
  if(b.action==="leave"){const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}});const me=room?.members.find(m=>m.userId===c.user.id);if(!me)return NextResponse.json({error:"Not in room"},{status:403});await prisma.watchRoomMember.update({where:{id:me.id},data:{leftAt:now}});return NextResponse.json({ok:true,rejoinUntil:new Date(now.getTime()+180000).toISOString()})}
  if(b.action==="rejoin"){const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}});const me=room?.members.find(m=>m.userId===c.user.id);if(!me||!me.leftAt||me.leftAt.getTime()+180000<now.getTime())return NextResponse.json({error:"Rejoin window expired"},{status:410});await prisma.watchRoomMember.update({where:{id:me.id},data:{leftAt:null,lastSeenAt:now}});return NextResponse.json({ok:true})}
  return NextResponse.json({error:"Invalid action"},{status:400})
}