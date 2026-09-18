import RoomGrid from "@/components/home/RoomGrid"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getUserHome } from "@/lib/home"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  const home = await getUserHome(user.id)
  if (!home) redirect("/park")

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-fuchsia-950/40 to-violet-950/50 px-4 pb-12 pt-8 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-pink-200/60">Your shared space</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{home.name}</h1>
              <p className="mt-3 text-white/60">Welcome back, {user.nickname ?? "friend"}. ✨</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
              <span className="text-white">{home.members.length}</span> {home.members.length === 1 ? "member" : "members"}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Our rooms</h2>
            <p className="mt-1 text-sm text-white/45">Little places inside Satella for the things you share.</p>
            <RoomGrid />
          </div>
        </section>
      </div>
    </main>
  )
}