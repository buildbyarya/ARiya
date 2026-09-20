"use client"
import Link from "next/link"
import { signOut } from "next-auth/react"
import PageHeader from "@/components/common/PageHeader"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const [expiry, setExpiry] = useState(10)

  useEffect(() => {
    fetch("/api/youtube/watch-together/settings")
      .then((r) => r.json())
      .then((d) => setExpiry(d.expiryMinutes || 10))
  }, [])

  async function save(v: number) {
    setExpiry(v)
    await fetch("/api/youtube/watch-together/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiryMinutes: v }),
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="⚙ Settings" backHref="/home" />

        <div className="mt-6 grid gap-3">
          <Link
            href="/account-settings"
            className="rounded-2xl bg-white/10 p-5 transition hover:bg-white/20 active:scale-95"
          >
            Account Settings
          </Link>

          <div className="rounded-2xl bg-white/10 p-5">
            <h2 className="font-semibold">🫂 Watch Together invitation expiry</h2>
            <p className="mt-1 text-sm text-white/50">
              Your setting is independent from your partner.
            </p>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {[2, 5, 10, 15].map((v) => (
                <button
                  key={v}
                  onClick={() => void save(v)}
                  className={`rounded-xl p-3 ${expiry === v ? "bg-pink-500/30" : "bg-white/10"}`}
                >
                  {v}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="rounded-2xl bg-red-500/15 p-5 text-left font-semibold text-red-200 transition hover:bg-red-500/25 active:scale-[0.99]"
          >
            Log out
          </button>

          <div className="rounded-2xl bg-white/10 p-5 text-white/60">
            More settings coming soon.
          </div>
        </div>
      </div>
    </main>
  )
}
