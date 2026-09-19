import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getContext() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return null

  const membership = await prisma.homeMember.findUnique({
    where: { userId: user.id },
    include: { home: { include: { members: true } } },
  })

  return membership ? { user, membership } : null
}

export async function GET() {
  const context = await getContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { user, membership } = context
  const note = await prisma.quickNote.findFirst({
    where: { homeId: membership.home.id, recipientId: user.id },
    orderBy: { createdAt: "desc" },
  })

  if (!note) return NextResponse.json({ note: null })

  return NextResponse.json({
    note: {
      id: note.id,
      content: note.content,
      readCount: note.readCount,
      remainingReads: Math.max(0, 3 - note.readCount),
      createdAt: note.createdAt.toISOString(),
    },
  })
}

export async function POST(request: Request) {
  const context = await getContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const content = typeof body?.content === "string" ? body.content : ""
  const { user, membership } = context
  const recipient = membership.home.members.find((member) => member.userId !== user.id)

  if (!recipient) return NextResponse.json({ error: "A second user is required" }, { status: 400 })

  const note = await prisma.quickNote.upsert({
    where: { homeId_senderId: { homeId: membership.home.id, senderId: user.id } },
    create: {
      homeId: membership.home.id,
      senderId: user.id,
      recipientId: recipient.userId,
      content,
      readCount: 0,
    },
    update: {
      recipientId: recipient.userId,
      content,
      readCount: 0,
      createdAt: new Date(),
    },
  })

  return NextResponse.json({ id: note.id, sent: true })
}
