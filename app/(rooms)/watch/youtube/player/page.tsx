"use client"

import { useSearchParams } from "next/navigation"

import PageHeader from "@/components/common/PageHeader"

import {
  addLiked,
  addWatchLater,
} from "@/stores/libraryStore"

import {
  addToQueue,
} from "@/components/watch/youtube/youtubeStore"



export default function PlayerPage() {

  const searchParams = useSearchParams()

  const videoId =
    searchParams.get("id")

  const title =
    searchParams.get("title") || "Untitled"

  const thumbnail =
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  const channel =
    searchParams.get("channel") || "Unknown Channel"



  const video = {
    id: videoId || "",
    title,
    thumbnail,
    channel,
  }



  return (

    <main
      className="
      min-h-screen
      bg-gradient-to-br
      from-purple-950
      via-black
      to-pink-950
      p-6
      "
    >

      <div className="mx-auto max-w-md">


        <PageHeader
          title="▶ Player"
        />


        {videoId ? (

          <iframe

            className="
            w-full
            aspect-video
            rounded-3xl
            "

            src={`https://www.youtube.com/embed/${videoId}`}

            allowFullScreen

          />

        ) : (

          <p>No video selected.</p>

        )}



        <h2
          className="
          mt-5
          text-xl
          font-bold
          "
        >
          {title}
        </h2>



        <p
          className="
          text-white/60
          mt-2
          "
        >
          {channel}
        </p>



        <div
          className="
          mt-6
          grid
          grid-cols-4
          gap-3
          "
        >

          <button

            onClick={()=>{
              addLiked(video)
              alert("❤️ Added to Likes")
            }}

            className="
            rounded-2xl
            bg-white/10
            py-4
            text-2xl
            "
          >
            ❤️
          </button>



          <button

            onClick={()=>{
              addWatchLater(video)
              alert("⏰ Added to Watch Later")
            }}

            className="
            rounded-2xl
            bg-white/10
            py-4
            text-2xl
            "
          >
            ⏰
          </button>



          <button

            onClick={()=>{
              addToQueue(video)
              alert("➕ Added to Play Next")
            }}

            className="
            rounded-2xl
            bg-white/10
            py-4
            text-2xl
            "
          >
            ➕
          </button>



          <button

            onClick={()=>{
              alert("👥 Invite Partner coming soon!")
            }}

            className="
            rounded-2xl
            bg-white/10
            py-4
            text-2xl
            "
          >
            👥
          </button>

        </div>



        <div
          className="
          mt-10
          rounded-2xl
          bg-white/10
          p-5
          "
        >

          <h3
            className="
            font-bold
            mb-3
            "
          >
            Next Up
          </h3>

          <p className="text-white/60">
            Related videos coming soon...
          </p>

        </div>



        <div
          className="
          mt-6
          rounded-2xl
          bg-white/10
          p-5
          "
        >

          <h3
            className="
            font-bold
            mb-3
            "
          >
            Comments
          </h3>

          <p className="text-white/60">
            Coming soon...
          </p>

        </div>

      </div>

    </main>

  )

}