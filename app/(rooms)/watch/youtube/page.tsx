"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { extractVideoId } from "@/lib/youtube"
import Queue from "@/components/watch/youtube/Queue"
import PageHeader from "@/components/common/PageHeader"
import VideoList from "@/components/watch/youtube/VideoList"

function YouTubeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const existingQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(existingQuery)
  const [videoLink, setVideoLink] = useState("")
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => {
    async function loadVideos() {
      if (!existingQuery) {
        setVideos([])
        return
      }
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(existingQuery)}`)
      const data = await response.json()
      setVideos(Array.isArray(data) ? data : [])
      setQuery(existingQuery)
    }
    loadVideos()
  }, [existingQuery])

  function searchVideos() {
    if (query.trim()) router.push(`/watch/youtube?q=${encodeURIComponent(query)}`)
  }

  function openFromLink() {
    const id = extractVideoId(videoLink)
    if (!id) {
      alert("Invalid YouTube link")
      return
    }
    router.push(`/watch/youtube/player?id=${id}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="🎬 YouTube" />
        <div className="mt-6 flex gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchVideos()}
            placeholder="🔍 Search YouTube"
            className="flex-1 rounded-2xl bg-white/10 px-5 py-4 outline-none border border-white/10" />
          <button onClick={searchVideos} className="rounded-2xl bg-white/10 px-5 active:scale-95">🔍</button>
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/50 text-sm">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="flex gap-3">
          <input value={videoLink} onChange={e => setVideoLink(e.target.value)}
            onKeyDown={e => e.key === "Enter" && openFromLink()}
            placeholder="🔗 Paste YouTube Link"
            className="flex-1 rounded-2xl bg-white/10 px-5 py-4 outline-none border border-white/10" />
          <button onClick={openFromLink} className="rounded-2xl bg-white/10 px-5 active:scale-95">Open</button>
        </div>

        <button onClick={() => router.push("/watch/youtube/library")}
          className="mt-4 w-full rounded-2xl bg-white/10 py-4">📚 Open Library</button>

        <VideoList videos={videos} />
        <Queue />
      </div>
    </main>
  )
}

export default function YouTubePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><p>Loading...</p></main>}>
      <YouTubeContent />
    </Suspense>
  )
}