"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import PageHeader from "@/components/common/PageHeader"

function PlayerContent() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("id")
  const title = searchParams.get("title") || "YouTube Video"
  const channel = searchParams.get("channel") || ""

  const [saved, setSaved] = useState({ liked: false, watch_later: false })

  useEffect(() => {
    fetch("/api/youtube/library", { cache: "no-store" })
      .then(response => response.json())
      .then((items) => {
        if (!Array.isArray(items)) return
        setSaved({
          liked: items.some((item) => item.videoId === videoId && item.type === "liked"),
          watch_later: items.some((item) => item.videoId === videoId && item.type === "watch_later"),
        })
      })
  }, [videoId])

  async function toggle(type: "liked" | "watch_later") {
    if (!videoId) return

    const isSaved = saved[type]
    const response = await fetch("/api/youtube/library", {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, type }),
    })

    if (!response.ok) {
      alert("Couldn't update your library right now.")
      return
    }

    setSaved(current => ({ ...current, [type]: !isSaved }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="▶ Player" />

        {videoId ? (
          <iframe
            className="w-full aspect-video rounded-3xl"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p>No video selected.</p>
        )}

        <h2 className="mt-5 text-xl font-bold">{title}</h2>
        {channel ? <p className="text-white/60 mt-2">{channel}</p> : null}

        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => toggle("liked")}
            className="rounded-2xl bg-white/10 py-4 text-xl"
          >
            {saved.liked ? "❤️" : "🤍"}
          </button>

          <button
            onClick={() => toggle("watch_later")}
            className="rounded-2xl bg-white/10 py-4 text-xl"
          >
            {saved.watch_later ? "⏰" : "🕒"}
          </button>

          <button
            onClick={() => alert("👥 Watch Together will be added in the next YouTube batch.")}
            className="rounded-2xl bg-white/10 py-4 text-xl"
          >
            👥
          </button>
        </div>
      </div>
    </main>
  )
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><p>Loading...</p></main>}>
      <PlayerContent />
    </Suspense>
  )
}
