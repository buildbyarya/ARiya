import Link from "next/link"
import { getServerSession } from "next-auth"
import PageHeader from "@/components/common/PageHeader"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function NotesPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null

  const membership = user
    ? await prisma.homeMember.findUnique({
        where: { userId: user.id },
        include: { home: { include: { members: { include: { user: true } } } } },
      })
    : null

  const otherMember = membership?.home.members.find((member) => member.userId !== user?.id)
  const otherNickname = otherMember?.user.nickname || otherMember?.nickname || otherMember?.user.name || "Other user's"

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="📝 Notes Room" backHref="/home" />
        <div className="grid gap-4">
          <Link href="/notes/my" className="rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/20 active:scale-95">
            📒 My Notes
          </Link>
          <Link href="/notes/other" className="rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/20 active:scale-95">
            📒 {otherNickname} Notes
          </Link>
          <Link href="/notes/shared" className="rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/20 active:scale-95">
            🤝 Shared Notes
          </Link>
          <Link href="/notes/quick" className="rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/20 active:scale-95">
            ⚡ Quick Note
          </Link>
        </div>
      </div>
    </main>
  )
}