import Link from "next/link"
import { getServerSession } from "next-auth"
import PageHeader from "@/components/common/PageHeader"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

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
  const otherNickname =
    otherMember?.user.nickname ||
    otherMember?.nickname ||
    otherMember?.user.name ||
    "Other user's"

  const otherNotebook = otherMember && membership
    ? await prisma.noteBook.findFirst({
        where: { homeId: membership.home.id, ownerId: otherMember.userId, type: "PERSONAL" },
        select: { isPrivate: true },
      })
    : null

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="📝 Notes Room" backHref="/home" />

        <div className="mt-6 grid gap-4">
          <Link href="/notes/my" className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-lg backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-[0.99]">
            <span className="block text-lg font-semibold">📒 My Notes</span>
            <span className="mt-1 block text-sm text-white/45">Your notebook · you can edit it</span>
          </Link>

          <Link href="/notes/other" className="relative rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-lg backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-[0.99]">
            <span className="block text-lg font-semibold">📒 {otherNickname} Notes</span>
            <span className="mt-1 block text-sm text-white/45">Read only for you</span>
            {otherNotebook?.isPrivate ? (
              <span className="absolute bottom-3 right-4 text-lg" aria-label="Private">🔒</span>
            ) : null}
          </Link>

          <Link href="/notes/shared" className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-lg backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-[0.99]">
            <span className="block text-lg font-semibold">🤝 Shared Notes</span>
            <span className="mt-1 block text-sm text-white/45">Both can read and edit</span>
          </Link>

          <Link href="/notes/quick" className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-lg backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-[0.99]">
            <span className="block text-lg font-semibold">⚡ Quick Note</span>
            <span className="mt-1 block text-sm text-white/45">Send a temporary message</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
