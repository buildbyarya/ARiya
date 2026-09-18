"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function WaitingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  useEffect(() => {
    if (!code) return

    const checkHome = async () => {
      try {
        const res = await fetch(`/api/home/status?code=${code}`)
        const data = await res.json()
        console.log("Home status:", data)

        if (data.joined) {
          router.push("/home")
        }
      } catch (error) {
        console.log("Checking home failed", error)
      }
    }

    checkHome()
    const interval = setInterval(checkHome, 3000)

    return () => clearInterval(interval)
  }, [code, router])

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/construction.gif')" }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10 text-white text-center">
        <h1 className="text-5xl font-bold">🏗️ Building Home</h1>

        <p className="mt-6 text-xl">
          🛠️👷 Building your ARiya home 🚜🚧
        </p>

        <div className="mt-8 p-6 bg-white/90 backdrop-blur rounded-xl shadow">
          <p className="text-gray-700">Share this code with your partner</p>

          <h2 className="text-4xl font-bold mt-3 text-black">
            {code}
          </h2>
        </div>

        <p className="mt-8 text-white text-lg">
          Waiting for your partner to join ❤️
        </p>

        <p className="mt-3 text-white/80">
          Checking every few seconds...
        </p>
      </div>
    </main>
  )
}

export default function WaitingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><p>Loading...</p></main>}>
      <WaitingContent />
    </Suspense>
  )
}
