"use client"

import PageHeader from "@/components/common/PageHeader"
import { getSubscriptions } from "@/stores/libraryStore"

export default function SubscriptionsPage() { const items=getSubscriptions(); return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6"><div className="mx-auto max-w-md"><PageHeader title="📺 Subscriptions" /><div className="mt-6 rounded-2xl bg-white/10 p-5">{items.length ? items.map(x=><div key={x} className="py-2">{x}</div>) : <p className="text-white/60">No subscriptions yet.</p>}</div></div></main> }