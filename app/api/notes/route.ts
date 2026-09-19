import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type NoteType = "PERSONAL" | "SHARED"

function cleanHtml(value: unknown) {
  if (typeof value !== "string") return ""
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
}

async function getContext() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return null

  const membership = await prisma.homeMember.findUnique({
    where: { userId: user.id },
    include: { home: { include: { members: { include: { user: true } } } } },
  })

  return membership ? { user, membership } : null
}

async function getOrCreatePersonal(homeId: string, ownerId: string) {
  const existing = await prisma.noteBook.findFirst({
    where: { homeId, ownerId, type: "PERSONAL" },
  })
  if (existing) return existing

  return prisma.noteBook.create({
    data: { homeId, ownerId, type: "PERSONAL" },
  })
}

async function getOrCreateShared(homeId: string, ownerId: string) {
  const existing = await prisma.noteBook.findFirst({
    where: { homeId, type: "SHARED" },
  })
  if (existing) return existing

  return prisma.noteBook.create({
    data: { homeId, ownerId, type: "SHARED" },
  })
}

export async function GET(request: Request) {
  const context = await getContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { user, membership } = context
  const type = new URL(request.url).searchParams.get("type")

  if (type === "personal") {
    const notebook = await getOrCreatePersonal(membership.home.id, user.id)
    return NextResponse.json({
      id: notebook.id,
      content: notebook.content,
      checkboxMode: notebook.checkboxMode,
      isPrivate: notebook.isPrivate,
      backgroundImage: notebook.backgroundImage,
      canEdit: true,
      locked: false,
    })
  }

  if (type === "shared") {
    const notebook = await getOrCreateShared(membership.home.id, user.id)
    return NextResponse.json({
      id: notebook.id,
      content: notebook.content,
      checkboxMode: notebook.checkboxMode,
      isPrivate: false,
      backgroundImage: notebook.backgroundImage,
      canEdit: true,
      locked: false,
    })
  }

  if (type === "other") {
    const other = membership.home.members.find((member) => member.userId !== user.id)
    if (!other) {
      return NextResponse.json({
        id: null,
        content: "",
        checkboxMode: false,
        isPrivate: false,
        canEdit: false,
        locked: false,
      })
    }

    const notebook = await getOrCreatePersonal(membership.home.id, other.userId)
    return NextResponse.json({
      id: notebook.id,
      content: notebook.isPrivate ? "" : notebook.content,
      checkboxMode: notebook.checkboxMode,
      isPrivate: notebook.isPrivate,
      backgroundImage: notebook.isPrivate ? null : notebook.backgroundImage,
      canEdit: false,
      locked: notebook.isPrivate,
    })
  }

  return NextResponse.json({ error: "Invalid note type" }, { status: 400 })
}

export async function PATCH(request: Request) {
  const context = await getContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const type = body?.type as string
  if (type !== "personal" && type !== "shared") {
    return NextResponse.json({ error: "This notebook is read only" }, { status: 403 })
  }

  const { user, membership } = context
  const notebook = type === "shared"
    ? await getOrCreateShared(membership.home.id, user.id)
    : await getOrCreatePersonal(membership.home.id, user.id)

  const data: { content?: string; checkboxMode?: boolean; isPrivate?: boolean; backgroundImage?: string | null } = {}
  if (typeof body.content === "string") data.content = cleanHtml(body.content)
  if (typeof body.checkboxMode === "boolean") data.checkboxMode = body.checkboxMode
  if (type === "personal" && typeof body.isPrivate === "boolean") data.isPrivate = body.isPrivate
  if (typeof body.backgroundImage === "string" || body.backgroundImage === null) data.backgroundImage = body.backgroundImage
  if (type === "shared") data.isPrivate = false

  const updated = await prisma.noteBook.update({ where: { id: notebook.id }, data })

  return NextResponse.json({
    id: updated.id,
    content: updated.content,
    checkboxMode: updated.checkboxMode,
    isPrivate: updated.isPrivate,
    canEdit: true,
    locked: false,
  })
}
