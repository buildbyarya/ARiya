import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function context() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return null
  const membership = await prisma.homeMember.findUnique({ where: { userId: user.id }, include: { home: true } })
  return membership ? { user, membership } : null
}

function cleanHtml(value: unknown) {
  if (typeof value !== "string") return ""
  return value.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
}

async function setting(homeId: string) {
  return prisma.chatSetting.upsert({ where: { homeId }, create: { homeId }, update: {} })
}

async function expireMedia(homeId: string) {
  await prisma.chatMessage.updateMany({
    where: { homeId, mediaExpiresAt: { lte: new Date() }, mediaData: { not: null } },
    data: { mediaData: null },
  })
}

async function payload(homeId: string, userId: string) {
  await expireMedia(homeId)
  const messages = await prisma.chatMessage.findMany({
    where: { homeId },
    orderBy: { createdAt: "asc" },
    take: 300,
    include: {
      sender: { select: { id: true, nickname: true, name: true } },
      replyTo: { include: { sender: { select: { nickname: true, name: true } } } },
      views: { where: { userId }, select: { views: true } },
      reactions: { select: { id: true, userId: true, emoji: true } },
    },
  })
  const read = await prisma.chatRead.findUnique({ where: { homeId_userId: { homeId, userId } } })
  return messages.map((m) => {
    const used = m.views[0]?.views ?? 0
    const reactionMap: Record<string, {count:number;mine:boolean}> = {}
    for (const r of m.reactions) {
      reactionMap[r.emoji] ??= { count: 0, mine: false }
      reactionMap[r.emoji].count++
      if (r.userId === userId) reactionMap[r.emoji].mine = true
    }
    return {
      id: m.id, senderId: m.senderId,
      senderName: m.sender.nickname || m.sender.name || "User",
      content: m.content, kind: m.kind, pinned: m.pinned,
      editedAt: m.editedAt?.toISOString() || null,
      createdAt: m.createdAt.toISOString(),
      replyTo: m.replyTo ? { id: m.replyTo.id, senderName: m.replyTo.sender.nickname || m.replyTo.sender.name || "User", content: m.replyTo.content, kind: m.replyTo.kind } : null,
      media: m.mediaData ? { data: m.mediaData, mime: m.mediaMime, remaining: Math.max(0, 3-used), expiresAt: m.mediaExpiresAt?.toISOString() || null } : (m.kind !== "TEXT" ? { data: null, mime: m.mediaMime, remaining: 0, expiresAt: m.mediaExpiresAt?.toISOString() || null } : null),
      reactions: reactionMap,
    }
  }).map((m) => ({ ...m, seenByPartner: m.senderId === userId || !!read && new Date(read.lastReadAt).getTime() >= new Date(m.createdAt).getTime() }))
}

export async function GET(request: Request) {
  const c = await context()
  if (!c) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim().toLowerCase()
  const [messages, chatSetting] = await Promise.all([payload(c.membership.homeId, c.user.id), setting(c.membership.homeId)])
  return NextResponse.json({ messages: q ? messages.filter(m => m.content.toLowerCase().includes(q)) : messages, setting: chatSetting })
}

export async function POST(request: Request) {
  const c = await context()
  if (!c) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const homeId = c.membership.homeId

  if (body.action === "read") {
    await prisma.chatRead.upsert({
      where: { homeId_userId: { homeId, userId: c.user.id } },
      create: { homeId, userId: c.user.id, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  }

  if (body.action === "send") {
    const kind = body.kind === "IMAGE" || body.kind === "VOICE" ? body.kind : "TEXT"
    const content = kind === "TEXT" ? cleanHtml(body.content).trim() : String(body.content || "")
    if (!content) return NextResponse.json({ error: "Empty message" }, { status: 400 })
    if (content.length > (kind === "TEXT" ? 20000 : 4000000)) return NextResponse.json({ error: "Message is too large" }, { status: 413 })
    const replyToId = typeof body.replyToId === "string" ? body.replyToId : null
    if (replyToId && !(await prisma.chatMessage.findFirst({ where: { id: replyToId, homeId } }))) return NextResponse.json({ error: "Reply target not found" }, { status: 400 })
    const msg = await prisma.chatMessage.create({
      data: { homeId, senderId: c.user.id, content, kind, replyToId,
        mediaMime: kind === "TEXT" ? null : String(body.mime || "application/octet-stream"),
        mediaExpiresAt: kind === "TEXT" ? null : new Date(Date.now()+86400000) },
    })
    return NextResponse.json({ id: msg.id })
  }

  if (body.action === "edit") {
    const id=String(body.messageId||""), content=cleanHtml(body.content).trim()
    const msg=await prisma.chatMessage.findFirst({where:{id,homeId,senderId:c.user.id,kind:"TEXT"}})
    if(!msg)return NextResponse.json({error:"Message not found"},{status:404})
    if(!content)return NextResponse.json({error:"Empty message"},{status:400})
    const updated=await prisma.chatMessage.update({where:{id},data:{content,editedAt:new Date()}})
    return NextResponse.json({ok:true,editedAt:updated.editedAt})
  }

  if (body.action === "view-media") {
    const messageId=String(body.messageId||"")
    const msg=await prisma.chatMessage.findFirst({where:{id:messageId,homeId}})
    if(!msg||msg.kind==="TEXT")return NextResponse.json({error:"Media not found"},{status:404})
    if(!msg.mediaData||(msg.mediaExpiresAt&&msg.mediaExpiresAt<=new Date())){
      if(msg.mediaData)await prisma.chatMessage.update({where:{id:msg.id},data:{mediaData:null}})
      return NextResponse.json({dead:true,remaining:0})
    }
    const view=await prisma.chatMediaView.upsert({
      where:{messageId_userId:{messageId,userId:c.user.id}},
      create:{messageId,userId:c.user.id,views:1},update:{views:{increment:1}},
    })
    const remaining=Math.max(0,3-view.views)
    if(remaining===0)await prisma.chatMessage.update({where:{id:messageId},data:{mediaData:null}})
    return NextResponse.json({dead:remaining===0,remaining,data:remaining===0?null:msg.mediaData,mime:msg.mediaMime,download:body.download===true})
  }

  if (body.action === "pin") {
    const id=String(body.messageId||"")
    const msg=await prisma.chatMessage.findFirst({where:{id,homeId}})
    if(!msg)return NextResponse.json({error:"Message not found"},{status:404})
    const updated=await prisma.chatMessage.update({where:{id},data:{pinned:!msg.pinned}})
    return NextResponse.json({pinned:updated.pinned})
  }

  if (body.action === "react") {
    const id=String(body.messageId||""), emoji=String(body.emoji||"").slice(0,8)
    const msg=await prisma.chatMessage.findFirst({where:{id,homeId}})
    if(!msg||!emoji)return NextResponse.json({error:"Message not found"},{status:404})
    const existing=await prisma.chatReaction.findUnique({where:{messageId_userId_emoji:{messageId:id,userId:c.user.id,emoji}}})
    if(existing)await prisma.chatReaction.delete({where:{id:existing.id}})
    else await prisma.chatReaction.create({data:{messageId:id,userId:c.user.id,emoji}})
    return NextResponse.json({ok:true})
  }

  if (body.action === "delete") {
    const id=String(body.messageId||"")
    const msg=await prisma.chatMessage.findFirst({where:{id,homeId,senderId:c.user.id}})
    if(!msg)return NextResponse.json({error:"Message not found"},{status:404})
    await prisma.chatMessage.delete({where:{id}})
    return NextResponse.json({ok:true})
  }

  if (body.action === "settings") {
    const current=await setting(homeId)
    const data:{background?:string;fontSize?:number;textColor?:string;fontFamily?:string}={}
    if(typeof body.background==="string")data.background=body.background.slice(0,1000)
    if(Number.isFinite(Number(body.fontSize)))data.fontSize=Math.min(24,Math.max(12,Number(body.fontSize)))
    if(typeof body.textColor==="string")data.textColor=body.textColor.slice(0,32)
    if(typeof body.fontFamily==="string")data.fontFamily=body.fontFamily.slice(0,80)
    const updated=await prisma.chatSetting.update({where:{id:current.id},data})
    return NextResponse.json({setting:updated})
  }

  return NextResponse.json({error:"Unknown action"},{status:400})
}
