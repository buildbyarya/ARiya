"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-fuchsia-950/70 to-violet-950 px-6">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">♡</div>
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-pink-200/80">Welcome to</p>
        <h1 className="mt-2 bg-gradient-to-r from-pink-200 via-fuchsia-200 to-violet-200 bg-clip-text text-5xl font-black text-transparent">Satella</h1>
        <p className="mx-auto mt-4 max-w-sm leading-6 text-white/65">
          A little space for two people to stay close, even when they are apart.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-semibold text-zinc-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
        >
          <span className="text-lg">G</span>
          Continue with Google
        </button>

        <p className="mt-6 text-xs text-white/40">Your private space starts here.</p>
      </section>
    </main>
  )
}