"use client"

import Link from "next/link"

export default function NotesRoom() {
  return (
    <Link
      href="/notes"
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        bg-white/10
        backdrop-blur-md
        p-6
        transition
        hover:scale-105
      "
    >
      <span className="text-4xl">📝</span>

      <span className="mt-3 font-semibold">
        Notes
      </span>
    </Link>
  )
}