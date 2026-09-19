"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function OtherNotesButton({ href, nickname, isPrivate }: { href: string; nickname: string; isPrivate: boolean }) {
  const router = useRouter()
  const [locked, setLocked] = useState(false)

  function handleClick() {
    if (!isPrivate) {
      router.push(href)
      return
    }
    setLocked(true)
    window.setTimeout(() => setLocked(false), 700)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative w-full rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-lg backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-[0.99]"
    >
      <span className="block text-lg font-semibold">📒 {nickname} Notes</span>
      <span className="mt-1 block text-sm text-white/45">Read only for you</span>

      {isPrivate ? (
        <span
          className={`absolute bottom-3 right-4 text-lg ${locked ? "animate-[wiggle_0.6s_ease-in-out]" : ""}`}
          aria-label="Private"
        >
          🔒
        </span>
      ) : null}

      {locked ? (
        <span className="mt-3 block text-sm text-pink-200/75">
          🔒 This notebook is private right now.
        </span>
      ) : null}
    </button>
  )
}
