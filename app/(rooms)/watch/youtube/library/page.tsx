"use client"

import PageHeader from "@/components/common/PageHeader"

import {
  getLiked,
  getWatchLater,
} from "@/stores/libraryStore"

export default function LibraryPage() {

  const liked = getLiked()

  const watchLater = getWatchLater()

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
          title="📚 Library"
        />



        <div
          className="
          mt-8
          space-y-6
          "
        >

          <div
            className="
            rounded-3xl
            bg-white/10
            p-5
            "
          >

            <h2 className="text-xl font-bold">
              ❤️ Liked Videos
            </h2>

            <p className="mt-2 text-white/60">
              {liked.length} videos
            </p>

          </div>



          <div
            className="
            rounded-3xl
            bg-white/10
            p-5
            "
          >

            <h2 className="text-xl font-bold">
              ⏰ Watch Later
            </h2>

            <p className="mt-2 text-white/60">
              {watchLater.length} videos
            </p>

          </div>



          <div
            className="
            rounded-3xl
            bg-white/10
            p-5
            "
          >

            <h2 className="text-xl font-bold">
              📂 Playlists
            </h2>

            <p className="mt-2 text-white/60">
              Coming soon
            </p>

          </div>



          <div
            className="
            rounded-3xl
            bg-white/10
            p-5
            "
          >

            <h2 className="text-xl font-bold">
              📺 Subscriptions
            </h2>

            <p className="mt-2 text-white/60">
              Coming soon
            </p>

          </div>

        </div>

      </div>

    </main>

  )

}