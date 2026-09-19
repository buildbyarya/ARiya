"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/common/PageHeader"

export default function LikedVideosPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/youtube/library", { cache: "no-store" })
      .then(response => response.json())
      .then(data => setItems(Array.isArray(data) ? data.filter((item: any) => item.type === "liked") : []))
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="❤️ Liked Videos" />
        <div className="mt-6 space-y-3">
          {items.map(item => (
            <a key={item.id} href={`/watch/youtube/player?id=${item.videoId}`} className="block rounded-2xl bg-white/10 p-4">
              YouTube video · {item.videoId}
            </a>
          ))}
          {!items.length ? <p className="text-white/50">No liked videos yet.</p> : null}
        </div>
      </div>
    </main>
  )
}
