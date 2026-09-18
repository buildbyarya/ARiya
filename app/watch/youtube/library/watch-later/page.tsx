"use client"

import PageHeader from "@/components/common/PageHeader"
import { getWatchLater } from "@/stores/libraryStore"

export default function WatchLaterPage() { const items=getWatchLater(); return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6"><div className="mx-auto max-w-md"><PageHeader title="⏰ Watch Later" /><div className="mt-6 space-y-3">{items.length ? items.map(v=><div key={v.id} className="rounded-2xl bg-white/10 p-4">{v.title}</div>) : <div className="rounded-2xl bg-white/10 p-5 text-white/60">Nothing saved for later yet.</div>}</div></div></main> }