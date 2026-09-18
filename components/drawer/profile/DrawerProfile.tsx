"use client"

import Link from "next/link"

export default function DrawerProfile() {
  return (
    <Link href="/profile" className="mb-8 block rounded-2xl p-3 transition hover:bg-white/10 active:scale-95">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400/30 to-violet-400/30 text-2xl">
        ♡
      </div>
      <h2 className="mt-3 text-xl font-bold">Your profile</h2>
      <p className="text-sm text-white/60">Make Satella yours</p>
    </Link>
  )
}