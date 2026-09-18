"use client"

import PageHeader from "@/components/common/PageHeader"
import { useState } from "react"
import { createPlaylist } from "@/stores/libraryStore"

export default function PlaylistsPage() { const [name,setName]=useState(""); const [saved,setSaved]=useState(false); return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6"><div className="mx-auto max-w-md"><PageHeader title="📂 Playlists" /><div className="mt-6 rounded-3xl bg-white/10 p-5"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Playlist name" className="w-full rounded-2xl bg-black/30 px-4 py-3 outline-none"/><button onClick={()=>{if(name.trim()){createPlaylist(name.trim());setName("");setSaved(true)}}} className="mt-3 w-full rounded-2xl bg-white/15 p-3 active:scale-95">Create Playlist</button>{saved&&<p className="mt-3 text-sm text-white/60">Playlist created.</p>}</div></div></main> }