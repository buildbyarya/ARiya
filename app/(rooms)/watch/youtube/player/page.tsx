"use client"

import {Suspense,useEffect,useRef,useState} from "react"
import {useRouter,useSearchParams} from "next/navigation"
import PageHeader from "@/components/common/PageHeader"

declare global{interface Window{YT:any;onYouTubeIframeAPIReady?:()=>void}}

function Page(){
  const router=useRouter()
  const p=useSearchParams()
  const videoId=p.get("id")
  const title=p.get("title")||"YouTube Video"
  const channel=p.get("channel")||""
  const [saved,setSaved]=useState({liked:false,watch_later:false})
  const [busy,setBusy]=useState<"liked"|"watch_later"|"invite"|null>(null)
  const [message,setMessage]=useState("")
  const player=useRef<any>(null)

  useEffect(()=>{
    if(!videoId)return
    fetch("/api/youtube/library",{cache:"no-store"}).then(r=>r.json()).then(a=>Array.isArray(a)&&setSaved({liked:a.some((x:any)=>x.videoId===videoId&&x.type==="LIKED"),watch_later:a.some((x:any)=>x.videoId===videoId&&x.type==="WATCH_LATER")})).catch(()=>setMessage("Could not load your YouTube library."))
  },[videoId])

  useEffect(()=>{
    if(!videoId)return
    const make=()=>{if(!window.YT?.Player||player.current)return;player.current=new window.YT.Player("solo-player",{videoId,playerVars:{playsinline:1,enablejsapi:1}})}
    if(window.YT?.Player)make()
    else{window.onYouTubeIframeAPIReady=make;const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.body.appendChild(s)}
    return()=>{player.current?.destroy?.();player.current=null}
  },[videoId])

  async function toggle(action:"liked"|"watch_later"){
    if(!videoId||busy)return
    setBusy(action);setMessage("")
    const is=saved[action]
    try{
      const r=await fetch("/api/youtube/library",{method:is?"DELETE":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({videoId,type:action})})
      const d=await r.json().catch(()=>({}))
      if(!r.ok){setMessage(d?.error||"Could not update library.");return}
      setSaved(x=>({...x,[action]:!is}))
    }catch{setMessage("Network error. Please try again.")}finally{setBusy(null)}
  }

  async function invite(){
    if(!videoId||busy)return
    setBusy("invite");setMessage("")
    try{
      const r=await fetch("/api/youtube/watch-together",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"create-invite",videoId,position:player.current?.getCurrentTime?.()||0,playing:player.current?.getPlayerState?.()===1,volume:player.current?.getVolume?.()??100,playbackRate:player.current?.getPlaybackRate?.()??1})})
      const d=await r.json().catch(()=>({}))
      if(!r.ok){setMessage(d?.error||"Could not send Watch Together invitation.");return}
      router.push("/watch/youtube/watch-together?roomId="+encodeURIComponent(d.roomId))
    }catch{setMessage("Network error. Please try again.")}finally{setBusy(null)}
  }

  return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-4 text-white"><div className="mx-auto max-w-2xl"><PageHeader title="▶ Player" backHref="/watch/youtube"/>{videoId?<div id="solo-player" className="mt-4 aspect-video w-full overflow-hidden rounded-3xl bg-black"/>:<p>No video selected.</p>}<h2 className="mt-5 text-xl font-bold">{title}</h2>{channel&&<p className="mt-2 text-white/60">{channel}</p>}{message&&<div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-center text-sm">{message}</div>}<div className="mt-5 grid grid-cols-3 gap-3"><button disabled={busy!==null} onClick={()=>void toggle("liked")} className="rounded-2xl bg-white/10 py-4 text-xl disabled:opacity-50">{saved.liked?"❤️":"🤍"}</button><button disabled={busy!==null} onClick={()=>void toggle("watch_later")} className="rounded-2xl bg-white/10 py-4 text-xl disabled:opacity-50">{saved.watch_later?"⏰":"🕒"}</button><button disabled={busy!==null} onClick={()=>void invite()} className="rounded-2xl bg-white/10 py-4 text-xl disabled:opacity-50">👥</button></div><p className="mt-2 text-center text-xs text-white/40">Watch Together</p></div></main>
}

export default function PlayerPage(){return <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading…</main>}><Page/></Suspense>}
