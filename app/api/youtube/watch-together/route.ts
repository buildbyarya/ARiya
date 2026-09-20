import {getServerSession} from "next-auth"
import {NextResponse} from "next/server"
import {authOptions} from "@/lib/auth"
import {prisma} from "@/lib/prisma"

async function ctx(){
 const session=await getServerSession(authOptions);if(!session?.user?.email)return null
 const user=await prisma.user.findUnique({where:{email:session.user.email}})
 if(!user)return null
 const membership=await prisma.homeMember.findUnique({where:{userId:user.id},include:{home:{include:{members:true}}}})
 return membership?{user,membership}:null
}
const num=(v:any,f:number)=>{const n=Number(v);return Number.isFinite(n)?n:f}

export async function GET(req:Request){
 const c=await ctx();if(!c)return NextResponse.json({error:"Unauthorized"},{status:401})
 const q=new URL(req.url).searchParams;const roomId=q.get("roomId");const wantsChat=q.get("chat")==="1"
 if(!roomId){
  const invites=await prisma.watchInvite.findMany({where:{recipientId:c.user.id,status:"PENDING",expiresAt:{gt:new Date()}},include:{sender:true},orderBy:{createdAt:"desc"}})
  return NextResponse.json({invites:invites.map(i=>({id:i.id,text:(i.sender.nickname||i.sender.name||"Someone")+" invited you to watch YouTube",customMessage:i.customMessage,expiresAt:i.expiresAt.toISOString()}))})
 }
 const room=await prisma.watchRoom.findFirst({where:{id:roomId,homeId:c.membership.home.id},include:{members:{include:{user:true},orderBy:{joinedAt:"asc"}}}})
 if(!room)return NextResponse.json({error:"Room not found"},{status:404})
 const me=room.members.find(m=>m.userId===c.user.id);if(!me)return NextResponse.json({error:"Not in room"},{status:403})
 await prisma.watchRoomMember.update({where:{id:me.id},data:{lastSeenAt:new Date()}})
 const active=room.members.filter(m=>!m.leftAt);const leader=active[0];const other=active.find(m=>m.userId!==c.user.id)
 const elapsed=room.playing?Math.max(0,(Date.now()-room.lastActionAt.getTime())/1000):0
 if(wantsChat){
  const chat=await prisma.watchChatMessage.findMany({where:{roomId},orderBy:{createdAt:"asc"},take:100})
  return NextResponse.json({chat:chat.map(m=>({id:m.id,senderId:m.senderId,senderNickname:m.senderNickname,content:m.content,createdAt:m.createdAt.toISOString()}))})
 }
 return NextResponse.json({room:{id:room.id,videoId:room.videoId,position:room.position+elapsed,playing:room.playing,volume:room.volume,playbackRate:room.playbackRate,version:room.version,isLeader:leader?.userId===c.user.id,leaderId:leader?.userId||"",leaderNickname:leader?.user.nickname||leader?.user.name||"Your partner",otherPresent:Boolean(other),otherNickname:other?.user.nickname||other?.user.name||"Your partner",otherLeftAt:other?.leftAt?.toISOString()||null}})
}

export async function POST(req:Request){
 try{
  const c=await ctx();if(!c)return NextResponse.json({error:"You are not signed in or your account is not connected to a home."},{status:401})
  const b=await req.json();const now=new Date()
  if(b.action==="chat-send"){
   const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}})
   if(!room||!room.members.some(m=>m.userId===c.user.id&&!m.leftAt))return NextResponse.json({error:"You are not in this Watch Together room."},{status:403})
   const content=String(b.content||"").trim().slice(0,500);if(!content)return NextResponse.json({error:"Write a message first."},{status:400})
   const member=room.members.find(m=>m.userId===c.user.id)
   const message=await prisma.watchChatMessage.create({data:{roomId:room.id,senderId:c.user.id,senderNickname:c.user.nickname||member?.userId||"Someone",content}})
   return NextResponse.json({message:{id:message.id,senderId:message.senderId,senderNickname:message.senderNickname,content:message.content,createdAt:message.createdAt.toISOString()}})
  }
  if(b.action==="create-invite"){
   const videoId=String(b.videoId||"").trim();if(!videoId)return NextResponse.json({error:"No YouTube video was selected."},{status:400})
   const other=c.membership.home.members.find(m=>m.userId!==c.user.id);if(!other)return NextResponse.json({error:"No partner is connected to your Satella home."},{status:400})
   let setting;try{setting=await prisma.watchSetting.upsert({where:{userId:c.user.id},create:{userId:c.user.id},update:{}})}catch(e){console.error("Watch Together setting error",e);return NextResponse.json({error:"Could not access Watch Together settings."},{status:500})}
   const mins=[2,5,10,15].includes(setting.expiryMinutes)?setting.expiryMinutes:10
   const room=await prisma.watchRoom.create({data:{homeId:c.membership.home.id,videoId,position:num(b.position,0),playing:Boolean(b.playing),volume:Math.max(0,Math.min(100,num(b.volume,100))),playbackRate:Math.max(.25,Math.min(2,num(b.playbackRate,1)))}})
   await prisma.watchRoomMember.create({data:{roomId:room.id,userId:c.user.id}})
   const invite=await prisma.watchInvite.create({data:{homeId:room.homeId,roomId:room.id,senderId:c.user.id,recipientId:other.userId,videoId:room.videoId,position:room.position,expiresAt:new Date(now.getTime()+mins*60000)}})
   return NextResponse.json({inviteId:invite.id,roomId:room.id})
  }
  if(b.action==="respond"){
   const i=await prisma.watchInvite.findFirst({where:{id:String(b.inviteId),recipientId:c.user.id}})
   if(!i)return NextResponse.json({error:"Invitation not found."},{status:404})
   if(i.status==="PENDING"&&i.expiresAt<=now)return NextResponse.json({error:"Invitation expired."},{status:410})
   if(b.response==="decline"){await prisma.watchInvite.update({where:{id:i.id},data:{status:"DECLINED",respondedAt:now}});return NextResponse.json({status:"DECLINED"})}
   if(b.response==="reply"){
    const message=String(b.message||"").trim().slice(0,500);if(!message)return NextResponse.json({error:"Write a message first."},{status:400})
    await prisma.watchInvite.update({where:{id:i.id},data:{customMessage:message}});return NextResponse.json({status:"PENDING"})
   }
   if(b.response==="accept"){
    await prisma.watchInvite.update({where:{id:i.id},data:{status:"ACCEPTED",respondedAt:now}})
    await prisma.watchRoomMember.upsert({where:{roomId_userId:{roomId:i.roomId,userId:c.user.id}},create:{roomId:i.roomId,userId:c.user.id},update:{leftAt:null,lastSeenAt:now}})
    return NextResponse.json({status:"ACCEPTED",roomId:i.roomId})
   }
   return NextResponse.json({error:"Invalid invitation response."},{status:400})
  }
  if(b.action==="take-control"){
   const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}})
   const me=room?.members.find(m=>m.userId===c.user.id&&!m.leftAt);if(!me)return NextResponse.json({error:"You are not in this Watch Together room."},{status:403})
   await prisma.watchRoomMember.update({where:{id:me.id},data:{joinedAt:now,lastSeenAt:now}})
   return NextResponse.json({ok:true})
  }
  if(b.action==="sync"){
   const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}})
   if(!room||!room.members.some(m=>m.userId===c.user.id&&!m.leftAt))return NextResponse.json({error:"You are not a member of this Watch Together room."},{status:403})
   const active=room.members.filter(m=>!m.leftAt).sort((a,b)=>a.joinedAt.getTime()-b.joinedAt.getTime());const leader=active[0]
   if(leader?.userId!==c.user.id)return NextResponse.json({error:"Playback is controlled by the current Watch Together leader."},{status:409})
   const u=await prisma.watchRoom.update({where:{id:room.id},data:{videoId:String(b.videoId||room.videoId),position:Math.max(0,num(b.position,room.position)),playing:Boolean(b.playing),volume:Math.max(0,Math.min(100,num(b.volume,room.volume))),playbackRate:Math.max(.25,Math.min(2,num(b.playbackRate,room.playbackRate))),version:{increment:1},lastActionAt:now}})
   return NextResponse.json({version:u.version})
  }
  if(b.action==="leave"){
   const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}})
   const me=room?.members.find(m=>m.userId===c.user.id);if(!me)return NextResponse.json({error:"You are not a member of this Watch Together room."},{status:403})
   await prisma.watchRoomMember.update({where:{id:me.id},data:{leftAt:now}})
   const remaining=room!.members.filter(m=>m.userId!==c.user.id).every(m=>m.leftAt||m.userId===c.user.id)
   if(remaining)await prisma.watchChatMessage.deleteMany({where:{roomId:room!.id}})
   return NextResponse.json({ok:true,rejoinUntil:new Date(now.getTime()+180000).toISOString()})
  }
  if(b.action==="rejoin"){
   const room=await prisma.watchRoom.findFirst({where:{id:String(b.roomId),homeId:c.membership.home.id},include:{members:true}})
   const me=room?.members.find(m=>m.userId===c.user.id)
   if(!me||!me.leftAt||me.leftAt.getTime()+180000<now.getTime())return NextResponse.json({error:"Rejoin window expired."},{status:410})
   await prisma.watchRoomMember.update({where:{id:me.id},data:{leftAt:null,lastSeenAt:now}});return NextResponse.json({ok:true})
  }
  return NextResponse.json({error:"Invalid Watch Together action."},{status:400})
 }catch(e){console.error("Watch Together API error",e);return NextResponse.json({error:"Watch Together encountered a server error. Please try again."},{status:500})}
}
