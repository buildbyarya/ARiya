"use client"

import PageHeader from "@/components/common/PageHeader"
import LibraryCard from "@/components/library/LibraryCard"

export default function LibraryPage() {

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

        <div className="mt-6 space-y-5">

          <LibraryCard
            href="/library/liked"
            emoji="❤️"
            title="Liked Videos"
            subtitle="0 videos"
          />

          <LibraryCard
            href="/library/watch-later"
            emoji="⏰"
            title="Watch Later"
            subtitle="0 videos"
          />

          <LibraryCard
            href="/library/playlist"
            emoji="📂"
            title="Playlists"
            subtitle="0 playlists"
          />

          <LibraryCard
            href="/library/history"
            emoji="🕘"
            title="History"
            subtitle="Nothing watched yet"
          />

          <LibraryCard
            href="/library/subscriptions"
            emoji="📺"
            title="Subscriptions"
            subtitle="0 channels"
          />

        </div>

      </div>

    </main>

  )

}