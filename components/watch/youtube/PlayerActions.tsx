"use client"

type PlayerActionsProps = {
  videoId: string
}

export default function PlayerActions({
  videoId,
}: PlayerActionsProps) {

  async function saveWatchLater() {

    const response = await fetch(
      "/api/library/watch-later",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          videoId,
        }),
      }
    )

    if (response.ok) {

      alert("⏰ Added to Watch Later")

    } else {

      alert("Something went wrong")

    }

  }

  return (

    <div className="grid grid-cols-2 gap-3 mt-6">

      <button
        className="
        rounded-2xl
        bg-white/10
        p-4
        hover:bg-white/20
        transition
        "
      >
        ❤️ Like
      </button>

      <button

        onClick={saveWatchLater}

        className="
        rounded-2xl
        bg-white/10
        p-4
        hover:bg-white/20
        transition
        "

      >
        ⏰ Watch Later
      </button>

      <button
        className="
        rounded-2xl
        bg-white/10
        p-4
        hover:bg-white/20
        transition
        "
      >
        ➕ Playlist
      </button>

      <button
        className="
        rounded-2xl
        bg-white/10
        p-4
        hover:bg-white/20
        transition
        "
      >
        👥 Invite Partner
      </button>

    </div>

  )
}