"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 rounded-lg bg-black text-white"
      >
        Continue with Google
      </button>
    </main>
  )
}