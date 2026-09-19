"use client"

import { useEffect, useState } from "react"

type Note = {
  id: string
  content: string
  readCount: number
  remainingReads: number
  createdAt: string
}

function formatAge(createdAt: string) {
  const hours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 3600000)
  if (hours < 0.5) return "Just now"
  const halfHours = Math.round(hours * 2) / 2
  if (halfHours === 0.5) return "½ hr ago"
  if (halfHours === 1) return "1 hr ago"
  if (Number.isInteger(halfHours)) return `${halfHours} hrs ago`
  return `${Math.floor(halfHours)}½ hrs ago`
}

export default function QuickNotePin({ initialNote }: { initialNote: Note | null }) {
  const [note, setNote] = useState<Note | null>(initialNote)
  const [open, setOpen] = useState(false)
  const [reading, setReading] = useState(false)
  const [consumed, setConsumed] = useState(false)
  const [shownContent, setShownContent] = useState("")
  const [shownCreatedAt, setShownCreatedAt] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(async () => {
      if (open) return
      const response = await fetch("/api/notes/quick", { cache: "no-store" })
      if (!response.ok) return
      const data = await response.json()
      setNote(data.note)
    }, 60000)
    return () => clearInterval(timer)
  }, [open])

  async function openNote() {
    if (!note || reading) return
    setReading(true)

    const response = await fetch("/api/notes/quick/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id }),
    })

    if (!response.ok) {
      setReading(false)
      return
    }

    const data = await response.json()
    if (!data.note) {
      setNote(null)
      setReading(false)
      return
    }

    setShownContent(data.note.content)
    setShownCreatedAt(data.note.createdAt)
    setConsumed(Boolean(data.note.consumed))
    setNote(data.note.consumed ? null : data.note)
    setOpen(true)
    setReading(false)
  }

  function closeNote() {
    setOpen(false)
    setShownContent("")
    setShownCreatedAt(null)
    setConsumed(false)
  }

  return (
    <>
      {note ? (
        <div className="fixed right-14 top-2 z-[60]">
          <button
            onClick={openNote}
            className="relative animate-pulse rounded-full border border-pink-200/20 bg-white/10 p-2 text-2xl shadow-lg shadow-pink-500/20 backdrop-blur-xl transition hover:scale-105"
            aria-label="Open Quick Note"
          >
            📌
            <span className="absolute -bottom-2 -right-2 rounded-full bg-pink-300 px-1.5 py-0.5 text-xs font-bold text-black">
              {note.remainingReads}
            </span>
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-end bg-black/45 p-4 pt-20" onClick={closeNote}>
          <div
            className="w-80 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between text-xs text-white/45">
              <span>Quick Note</span>
              <span>{shownCreatedAt ? formatAge(shownCreatedAt) : "Just now"}</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-lg leading-7">{shownContent || " "}</p>
            <button
              onClick={closeNote}
              className="mt-5 w-full rounded-xl bg-white/10 px-4 py-2 font-semibold hover:bg-white/15"
            >
              Close
            </button>
            <p className="mt-2 text-center text-xs text-white/35">
              {consumed ? "This Quick Note has been used up." : `${note?.remainingReads ?? 0} read${(note?.remainingReads ?? 0) === 1 ? "" : "s"} left`}
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}