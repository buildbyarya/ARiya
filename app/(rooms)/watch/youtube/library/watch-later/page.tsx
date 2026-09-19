"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/common/PageHeader"

type LibraryItem = {
  id: string
  videoId: string
}

type VideoMeta = {
  title: string
  thumbnail: string
  channel?: string
}

export default function WatchLaterPage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [metadata, setMetadata] = useState<Record<string, VideoMeta>>({})

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/youtube/library", { cache: "no-store" })
      const data = await response.json()
      const nextItems = Array.isArray(data)
        ? data.filter((item: any) => item.type === "watch_later")
        : []
      setItems(nextItems)

      if (!nextItems.length) return

      const metaResponse = await fetch("/api/youtube/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds: nextItems.map((item: LibraryItem) => item.videoId) }),
      })
      const metaData = await metaResponse.json()
      setMetadata(metaData?.videos || {})
    }

    load()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="⏰ Watch Later" />
        <div className="mt-6 space-y-3">
          {items.map(item => {
            const meta = metadata[item.videoId]
            return (
              <a
                key={item.id}
                href={`/watch/youtube/player?id=${item.videoId}`}
                className="block overflow-hidden rounded-2xl bg-white/10 transition hover:bg-white/15 active:scale-[0.99]"
              >
                {meta?.thumbnail ? (
                  <img
                    src={meta.thumbnail}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="aspect-video w-full animate-pulse bg-white/5" />
                )}
                <div className="p-4">
                  <p className="font-semibold">
                    {meta?.title || "Loading video..."}
                  </p>
                  {meta?.channel ? (
                    <p className="mt-1 text-sm text-white/50">{meta.channel}</p>
                  ) : null}
                </div>
              </a>
            )
          })}
          {!items.length ? <p className="text-white/50">Nothing saved for later yet.</p> : null}
        </div>
      </div>
    </main>
  )
}
