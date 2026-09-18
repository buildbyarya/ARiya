"use client"

import Link from "next/link"

type TopBarProps = {
  isOpen?: boolean
  onMenuClick?: () => void
  title?: string
  showBack?: boolean
  backHref?: string
}

export default function TopBar({
  isOpen = false,
  onMenuClick,
  title = "Satella",
  showBack = false,
  backHref = "/home",
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={onMenuClick}
          className="rounded-xl px-2 py-1 text-3xl text-white transition hover:bg-white/10 active:scale-95"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? "✕" : "≡"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">♡</span>
          <h1 className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-xl font-bold text-transparent">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {showBack && (
            <Link href={backHref} className="rounded-xl px-2 py-1 text-2xl transition hover:bg-white/10 active:scale-95" aria-label="Back">
              ←
            </Link>
          )}
          <button className="rounded-xl px-2 py-1 text-xl transition hover:bg-white/10" aria-label="Notifications">
            ♡
          </button>
        </div>
      </div>
    </header>
  )
}