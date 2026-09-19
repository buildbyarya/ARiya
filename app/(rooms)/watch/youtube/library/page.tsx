"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import PageHeader from "@/components/common/PageHeader"

type LibraryVideo = {
  id: string
  videoId: string
  type: "liked" | "watch_later"
}

export default function LibraryPage() {
  const [videos, setVideos] = useState<LibraryVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/youtube/library", { cache: "no-store" })
      .then(response => response.json())
      .then(data => setVideos(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const liked = videos.filter(video => video.type === "liked")
  const watchLater = videos.filter(video => video.type === "watch_later")

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="📚 Library" />

        <div className="mt-8 space-y-4">
          <Link href="/watch/youtube/library/liked" className="block rounded-3xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95">
            <h2 className="text-xl font-bold">❤️ Liked Videos</h2>
            <p className="mt-2 text-white/60">{loading ? "Loading..." : `${liked.length} videos`}</p>
          </Link>

          <Link href="/watch/youtube/library/watch-later" className="block rounded-3xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95">
            <h2 className="text-xl font-bold">⏰ Watch Later</h2>
            <p className="mt-2 text-white/60">{loading ? "Loading..." : `${watchLater.length} videos`}</p>
          </Link>

          <Link href="/watch/youtube/library/playlists" className="block rounded-3xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95">
            <h2 className="text-xl font-bold">📂 Playlists</h2>
            <p className="mt-2 text-white/60">Playlists will be added next.</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
