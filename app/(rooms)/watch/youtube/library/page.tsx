"use client"

import Link from "next/link"
import PageHeader from "@/components/common/PageHeader"
import { getLiked, getWatchLater } from "@/stores/libraryStore"

export default function LibraryPage() {
  const liked = getLiked()
  const watchLater = getWatchLater()

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="📚 Library" />
        <div className="mt-8 space-y-4">
          <Link href="/watch/youtube/library/liked" className="block rounded-3xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95">
            <h2 className="text-xl font-bold">❤️ Liked Videos</h2>
            <p className="mt-2 text-white/60">{liked.length} videos</p>
          </Link>
          <Link href="/watch/youtube/library/watch-later" className="block rounded-3xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95">
            <h2 className="text-xl font-bold">⏰ Watch Later</h2>
            <p className="mt-2 text-white/60">{watchLater.length} videos</p>
          </Link>
          <Link href="/watch/youtube/library/playlists" className="block rounded-3xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95">
            <h2 className="text-xl font-bold">📂 Playlists</h2>
            <p className="mt-2 text-white/60">Manage your playlists</p>
          </Link>
          <Link href="/watch/youtube/library/subscriptions" className="block rounded-3xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95">
            <h2 className="text-xl font-bold">📺 Subscriptions</h2>
            <p className="mt-2 text-white/60">Manage your subscriptions</p>
          </Link>
        </div>
      </div>
    </main>
  )
}