import Link from "next/link"
import PageHeader from "@/components/common/PageHeader"

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="🎵 Music Together" backHref="/home" />
        <div className="grid gap-4">
          <Link
            href="/music/player"
            className="rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/20 active:scale-95"
          >
            🎧 Shared Player
          </Link>
        </div>
      </div>
    </main>
  )
}