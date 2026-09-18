"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ParkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [message, setMessage] = useState("")
  const [createdCode, setCreatedCode] = useState("")

  useEffect(() => {
    if (!createdCode) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/home/check?code=${createdCode}`)
      const data = await res.json()
      if (data.joined) router.push("/home")
    }, 3000)
    return () => clearInterval(interval)
  }, [createdCode, router])

  async function createHome() {
    if (!nickname.trim()) return setMessage("Please choose a nickname ❤️")
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/home/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })
      const data = await res.json()
      if (data.inviteCode) setCreatedCode(data.inviteCode)
      else setMessage(data.error ?? "Could not create your home.")
    } catch {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function joinHome() {
    if (!nickname.trim()) return setMessage("Please choose a nickname ❤️")
    if (!joinCode.trim()) return setMessage("Enter your invite code first.")
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/home/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase(), nickname: nickname.trim() }),
      })
      const data = await res.json()
      if (data.success) router.push("/home")
      else setMessage(data.error ?? "Could not join this home.")
    } catch {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-5 py-10 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-950/50 via-zinc-950 to-violet-950/60" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center">
        <section className="w-full rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">♡</div>
            <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-pink-200/70">Your space for two</p>
            <h1 className="mt-2 text-4xl font-black">Set up Satella</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">Choose a nickname, then create a home or join your partner's.</p>
          </div>

          <label className="mt-8 block text-sm font-medium text-white/80">Your nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="What should your partner call you?"
            maxLength={24}
            className="mt-2 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-pink-300/50 focus:ring-2 focus:ring-pink-300/10"
          />

          <button
            onClick={createHome}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-white px-5 py-3.5 font-semibold text-zinc-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Create our home"}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-white/35">
            <span className="h-px flex-1 bg-white/10" /> OR <span className="h-px flex-1 bg-white/10" />
          </div>

          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Partner's invite code"
            maxLength={16}
            className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3.5 font-mono tracking-widest text-white outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-white/30 focus:border-violet-300/50"
          />
          <button
            onClick={joinHome}
            disabled={loading}
            className="mt-3 w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 font-semibold transition hover:bg-white/15 disabled:opacity-50"
          >
            Join with invite code
          </button>

          {createdCode && (
            <div className="mt-6 rounded-2xl border border-pink-300/20 bg-pink-300/10 p-5 text-center">
              <p className="font-semibold">Home created ✨</p>
              <p className="mt-2 text-sm text-white/60">Share this code with your partner:</p>
              <p className="mt-3 font-mono text-2xl font-bold tracking-[0.2em]">{createdCode}</p>
              <button onClick={() => navigator.clipboard.writeText(createdCode).then(() => setMessage("Invite code copied ✨"))} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900">
                Copy invite code
              </button>
            </div>
          )}

          {message && <p className="mt-5 text-center text-sm font-medium text-pink-200">{message}</p>}
        </section>
      </div>
    </main>
  )
}