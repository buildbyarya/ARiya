"use client"

export default function PlayerActions() {
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