import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : undefined
  const image = typeof body.image === "string" ? body.image.trim() : undefined

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      ...(nickname !== undefined ? { nickname: nickname || null } : {}),
      ...(image !== undefined ? { image: image || null } : {}),
    },
    select: { nickname: true, image: true },
  })

  return NextResponse.json(user)
}
