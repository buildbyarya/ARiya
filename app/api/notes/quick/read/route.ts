import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const id = typeof body?.id === "string" ? body.id : ""

  const membership = await prisma.homeMember.findUnique({
    where: { userId: user.id },
    include: { home: true },
  })
  if (!membership) return NextResponse.json({ error: "Home not found" }, { status: 404 })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.quickNote.findFirst({
        where: { id, homeId: membership.home.id, recipientId: user.id },
      })
      if (!note) return null

      const nextCount = note.readCount + 1

      if (nextCount >= 3) {
        await tx.quickNote.delete({ where: { id: note.id } })
        return {
          id: note.id,
          content: note.content,
          readCount: 3,
          remainingReads: 0,
          createdAt: note.createdAt.toISOString(),
          consumed: true,
        }
      }

      const updated = await tx.quickNote.update({
        where: { id: note.id },
        data: { readCount: nextCount },
      })

      return {
        id: updated.id,
        content: updated.content,
        readCount: updated.readCount,
        remainingReads: 3 - updated.readCount,
        createdAt: updated.createdAt.toISOString(),
        consumed: false,
      }
    })

    if (!result) return NextResponse.json({ error: "Quick Note not found" }, { status: 404 })
    return NextResponse.json({ note: result })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Quick Note is no longer available" }, { status: 404 })
    }
    throw error
  }
}
