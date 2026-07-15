"use client"

import Link from "next/link"

export default function SupportButton() {
  return (
    <Link
      href="/support"
      className="flex items-center gap-4 w-full rounded-2xl px-4 py-3 transition-all duration-200 active:scale-95 hover:bg-white/10"
    >
      <span className="text-xl">❓</span>
      <span>Help & Support</span>
    </Link>
  )
}