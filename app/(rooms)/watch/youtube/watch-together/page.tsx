"use client"
import {Suspense,useEffect,useRef,useState} from "react"
import {useRouter,useSearchParams} from "next/navigation"
import VideoList from "@/components/watch/youtube/VideoList"
declare global{interface Window{YT:any;onYouTubeIframeAPIReady?:()=>void}}
function Page(){
 const p=useSearchParams();const router=useRouter();const roomId=p.get("roomId")||""
 const[room,setRoom]=useState<any>();const[results,setResults]=useState<any[]>([]);const[query,setQuery]=useState("")
 const[playerReady,setPlayerReady]=useState(false);const[searching,setSearching]=useState(false);const[searchMessage,setSearchMessage]=useState("")
 const[popup,setPopup]=useState<string|null>(null);const player=useRef<any>(null);const suppress=useRef(false);const version=useRef(-1)
 const lastObserved=useRef(0);const lastVolume=useRef(-1);const lastRate=useRef(1);const previousOther=useRef<boolean|null>(null)

 async function sync(force=false){
  if(!player.current||suppress.current)return
  const id=player.current.getVideoData?.().video_id;if(!id)return
  const position=Number(player.current.getCurrentTime?.()||0);const playing=player.current.getPlayerState?.()===1
  const volume=Number(player.current.getVolume?.()??100);const playbackRate=Number(player.current.getPlaybackRate?.()||1)
  const r=await fetch("/api/youtube/watch-together",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"sync",roomId,videoId:id,position,playing,volume,playbackRate,force})})
  if(r.ok){lastObserved.current=position;lastVolume.current=volume;lastRate.current=playbackRate}
 }

 useEffect(()=>{
  if(!room?.id)return
  let cancelled=false
  const make=()=>{
   if(cancelled||!window.YT?.Player||player.current||!document.getElementById("wt-player"))return
   player.current=new window.YT.Player("wt-player",{videoId:room.videoId,playerVars:{playsinline:1,controls:1,rel:0,origin:window.location.origin},events:{
    onReady:()=>setPlayerReady(true),
    onStateChange:()=>void sync(true),
    onPlaybackRateChange:()=>void sync(true),
    onError:(e:any)=>console.error("Watch Together YouTube player error",e)
   }})
  }
  if(window.YT?.Player)make()
  else{
   const previous=window.onYouTubeIframeAPIReady
   window.onYouTubeIframeAPIReady=()=>{previous?.();make()}
   if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){
    const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.body.appendChild(s)
   }
  }
  return()=>{cancelled=true;player.current?.destroy?.();player.current=null;setPlayerReady(false)}
 },[Boolean(room?.id)])

 useEffect(()=>{
  if(!roomId)return
  let stop=false
  async function poll(){
   const r=await fetch("/api/youtube/watch-together?roomId="+encodeURIComponent(roomId),{cache:"no-store"})
   if(!r.ok)return
   const d=await r.json();if(stop||!d.room)return
   setRoom(d.room)
   if(previousOther.current===true&&!d.room.otherPresent)setPopup((d.room.otherNickname||"Your partner")+" left the Watch Together room.")
   previousOther.current=Boolean(d.room.otherPresent)
   if(!playerReady||!player.current)return
   const remote=d.room.version!==version.current
   const expected=Number(d.room.position||0)
   if(remote){
    version.current=d.room.version;suppress.current=true
    const current=player.current.getVideoData?.().video_id
    if(current!==d.room.videoId)player.current.loadVideoById({videoId:d.room.videoId,startSeconds:expected})
    else player.current.seekTo(expected,true)
    if(d.room.playing)player.current.playVideo();else player.current.pauseVideo()
    player.current.setVolume(d.room.volume)
    try{player.current.setPlaybackRate(d.room.playbackRate)}catch{}
    lastObserved.current=expected;lastVolume.current=d.room.volume;lastRate.current=d.room.playbackRate
    setTimeout(()=>{suppress.current=false},900)
   }else if(d.room.playing){
    const local=Number(player.current.getCurrentTime?.()||0)
    if(Math.abs(local-expected)>1.5){suppress.current=true;player.current.seekTo(expected,true);lastObserved.current=expected;setTimeout(()=>{suppress.current=false},500)}
   }
  }
  void poll();const t=setInterval(poll,1000);return()=>{stop=true;clearInterval(t)}
 },[roomId,playerReady])

 useEffect(()=>{
  if(!room||!playerReady)return
  const t=setInterval(()=>{
   if(!player.current||suppress.current)return
   const now=Number(player.current.getCurrentTime?.()||0);const volume=Number(player.current.getVolume?.()??100);const rate=Number(player.current.getPlaybackRate?.()||1)
   const state=player.current.getPlayerState?.()
   const jumped=Math.abs(now-lastObserved.current)>1.25
   const volumeChanged=Math.abs(volume-lastVolume.current)>0.5
   const rateChanged=Math.abs(rate-lastRate.current)>0.01
   if(jumped||volumeChanged||rateChanged){void sync(true);return}
   lastObserved.current=now
  },500)
  return()=>clearInterval(t)
 },[room?.id,playerReady])

 async function search(){
  const q=query.trim();if(!q||searching)return
  setSearching(true);setSearchMessage("")
  try{
   const r=await fetch("/api/youtube/search?q="+encodeURIComponent(q),{cache:"no-store"});const d=await r.json()
   if(!r.ok){setResults([]);setSearchMessage(d?.message||"YouTube search is temporarily unavailable.");return}
   setResults(Array.isArray(d)?d:[])
  }catch{setResults([]);setSearchMessage("Search failed. Please try again.")}finally{setSearching(false)}
 }
 async function choose(id:string){
  if(!player.current||!playerReady)return
  suppress.current=true;version.current=-1;player.current.cueVideoById({videoId:id,startSeconds:0})
  setTimeout(()=>{suppress.current=false;void sync(true)},700)
 }
 async function leave(){
  await fetch("/api/youtube/watch-together",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"leave",roomId})})
  router.push("/watch/youtube")
 }
 if(!room)return <main className="min-h-screen bg-black text-white flex items-center justify-center">Joining Watch Together…</main>
 return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-4 text-white"><div className="mx-auto max-w-2xl">
  <div className="flex items-center justify-between"><h1 className="text-xl font-bold">🫂 Watch Together</h1><button onClick={leave} className="rounded-xl bg-white/10 px-4 py-2">🚪 Leave</button></div>
  <div id="wt-player" className="mt-4 aspect-video w-full overflow-hidden rounded-3xl bg-black"/>
  <div className="mt-4 flex gap-2"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void search()} placeholder="🔍 Search another video" className="flex-1 rounded-2xl bg-white/10 px-4 py-3 outline-none"/><button disabled={searching} onClick={()=>void search()} className="rounded-2xl bg-white/10 px-4 py-3 disabled:opacity-40">{searching?"…":"Search"}</button></div>
  <button onClick={()=>router.push("/watch/youtube/library")} className="mt-3 w-full rounded-2xl bg-white/10 py-3">📚 Library — Liked, Watch Later & Playlists</button>
  {searchMessage&&<p className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-white/60">{searchMessage}</p>}
  {results.length>0&&<div className="mt-3"><VideoList videos={results} onSelect={choose}/></div>}
  {popup&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-6 text-center shadow-2xl"><p className="text-base">{popup}</p><button onClick={()=>setPopup(null)} className="mt-5 w-full rounded-xl bg-white/10 py-3">OK</button></div></div>}
 </div></main>
}
export default function WatchTogetherPage(){return <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading…</main>}><Page/></Suspense>}
