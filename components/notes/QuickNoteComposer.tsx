"use client"

import { useState } from "react"

export default function QuickNoteComposer() {
  const [content, setContent] = useState("")
  const [sent, setSent] = useState(false)

  async function send() {
    const response = await fetch("/api/notes/quick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    if (response.ok) {
      setContent("")
      setSent(true)
      setTimeout(() => setSent(false), 2500)
    }
  }

  return (
    <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">📌 Send a Quick Note</p>
          <p className="mt-1 text-sm text-white/45">It will appear on the other person's Home page.</p>
        </div>
        <span className="text-2xl">📄</span>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="I missed you ❤️"
        className="mt-4 min-h-40 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none placeholder:text-white/30 focus:border-pink-300/40"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-white/45">
          {sent ? "Sent ❤️" : "Sending a new note replaces your previous one."}
        </span>
        <button
          onClick={send}
          disabled={content.length === 0}
          className="rounded-xl bg-pink-500/80 px-4 py-2 font-semibold transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          📌 Send
        </button>
      </div>
    </div>
  )
}
