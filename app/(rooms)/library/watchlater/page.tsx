"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import PageHeader from "@/components/common/PageHeader"

type SavedVideo = {
  id: string
  videoId: string
}

type YouTubeVideo = {
  id: string
  title: string
  channel: string
  thumbnail: string
}

export default function WatchLaterPage() {
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])
  const [details, setDetails] = useState<Record<string, YouTubeVideo>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadWatchLater() {
      try {
        const libraryResponse = await fetch("/api/library?type=WATCH_LATER")

        if (!libraryResponse.ok) {
          throw new Error("Unable to load Watch Later")
        }

        const saved: SavedVideo[] = await libraryResponse.json()
        setSavedVideos(saved)

        if (saved.length === 0) {
          return
        }

        const videoResponse = await fetch(
          `/api/youtube/videos?ids=${encodeURIComponent(
            saved.map((video) => video.videoId).join(",")
          )}`
        )

        if (!videoResponse.ok) {
          throw new Error("Unable to load YouTube video details")
        }

        const videos: YouTubeVideo[] = await videoResponse.json()
        setDetails(Object.fromEntries(videos.map((video) => [video.id, video])))
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Something went wrong"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadWatchLater()
  }, [])

  async function removeFromWatchLater(id: string) {
    setRemovingId(id)

    try {
      const response = await fetch(`/api/library?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Unable to remove this video")
      }

      setSavedVideos((videos) => videos.filter((video) => video.id !== id))
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong"
      )
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="Watch Later" />

        {isLoading && (
          <p className="mt-8 text-center text-white/60">Loading saved videos…</p>
        )}

        {!isLoading && error && (
          <p className="mt-8 rounded-2xl bg-red-500/10 p-4 text-center text-sm text-red-200">
            {error}
          </p>
        )}

        {!isLoading && !error && savedVideos.length === 0 && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-7 text-center">
            <p className="text-lg font-semibold">Nothing saved yet</p>
            <p className="mt-2 text-sm text-white/60">
              Save a video from the player and it will appear here.
            </p>
            <Link
              href="/watch/youtube"
              className="mt-5 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              Browse YouTube
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {savedVideos.map((saved) => {
            const video = details[saved.videoId]

            if (!video) {
              return (
                <div
                  key={saved.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="font-semibold">Video unavailable</p>
                  <p className="mt-1 text-sm text-white/60">
                    This YouTube video may be private or no longer available.
                  </p>
                  <button
                    onClick={() => removeFromWatchLater(saved.id)}
                    disabled={removingId === saved.id}
                    className="mt-4 text-sm font-semibold text-red-300 disabled:opacity-50"
                  >
                    {removingId === saved.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              )
            }

            return (
              <article
                key={saved.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <Link
                  href={`/watch/youtube/player?id=${video.id}&title=${encodeURIComponent(video.title)}&channel=${encodeURIComponent(video.channel)}`}
                  className="block"
                >
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-semibold text-white">{video.title}</h2>
                    <p className="mt-1 text-sm text-white/60">{video.channel}</p>
                  </div>
                </Link>
                <button
                  onClick={() => removeFromWatchLater(saved.id)}
                  disabled={removingId === saved.id}
                  className="w-full border-t border-white/10 py-3 text-sm font-semibold text-red-200 hover:bg-white/5 disabled:opacity-50"
                >
                  {removingId === saved.id ? "Removing…" : "Remove from Watch Later"}
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
