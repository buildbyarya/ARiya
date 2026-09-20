"use client"

import {Suspense,useEffect,useRef,useState} from "react"
import {useRouter,useSearchParams} from "next/navigation"
import VideoList from "@/components/watch/youtube/VideoList"

declare global{interface Window{YT:any;onYouTubeIframeAPIReady?:()=>void}}

type ChatMessage={id:string;senderId:string;senderNickname:string;content:string;createdAt:string}

function Page(){
 const p=useSearchParams();const router=useRouter();const roomId=p.get("roomId")||""
 const[room,setRoom]=useState<any>();const[results,setResults]=useState<any[]>([]);const[query,setQuery]=useState("")
 const[playerReady,setPlayerReady]=useState(false);const[playerError,setPlayerError]=useState("");const[needsStart,setNeedsStart]=useState(false)
 const[searching,setSearching]=useState(false);const[searchMessage,setSearchMessage]=useState("");const[popup,setPopup]=useState<string|null>(null)
 const[chat,setChat]=useState<ChatMessage[]>([]);const[chatText,setChatText]=useState("");const[chatSending,setChatSending]=useState(false);const[latencyAssist,setLatencyAssist]=useState(false)
 const player=useRef<any>(null);const suppress=useRef(false);const version=useRef(-1);const initialized=useRef(false);const previousOther=useRef<boolean|null>(null)
 const lastLocalAction=useRef(0);const lastRemotePosition=useRef<number|null>(null);const lastRemoteVideo=useRef("");const lastRemotePlaying=useRef<boolean|null>(null);const lastRemoteRate=useRef(1)
 const lastLocal={position:useRef(0),video:useRef(""),volume:useRef(100),rate:useRef(1)}

 async function api(body:any){return fetch("/api/youtube/watch-together",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})}

 async function sync(force=false){
  if(!player.current||suppress.current||!initialized.current||!room?.isLeader)return
  const id=player.current.getVideoData?.().video_id;if(!id)return
  const position=Number(player.current.getCurrentTime?.()||0);const playing=player.current.getPlayerState?.()===1
  const volume=Number(player.current.getVolume?.()??100);const playbackRate=Number(player.current.getPlaybackRate?.()||1)
  const r=await api({action:"sync",roomId,videoId:id,position,playing,volume,playbackRate,force})
  if(r.ok)lastLocalAction.current=Date.now()
 }

 useEffect(()=>{
  if(!room?.id)return
  let cancelled=false
  const make=()=>{
   if(cancelled||!window.YT?.Player||player.current)return
   const el=document.getElementById("wt-player");if(!el)return
   player.current=new window.YT.Player(el,{videoId:room.videoId,playerVars:{playsinline:1,controls:1,rel:0,origin:window.location.origin},events:{
    onReady:()=>{setPlayerReady(true);initialized.current=false},
    onStateChange:()=>{if(initialized.current&&!suppress.current)void sync(true)},
    onPlaybackRateChange:()=>{if(initialized.current&&!suppress.current)void sync(true)},
    onError:(e:any)=>{console.error("Watch Together YouTube player error",e);setPlayerError("YouTube could not load this video.")},
   }})
  }
  if(window.YT?.Player)make()
  else{
   const previous=window.onYouTubeIframeAPIReady
   window.onYouTubeIframeAPIReady=()=>{previous?.();make()}
   if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.body.appendChild(s)}
  }
  return()=>{cancelled=true;player.current?.destroy?.();player.current=null;setPlayerReady(false);initialized.current=false}
 },[Boolean(room?.id)])

 useEffect(()=>{
  if(!roomId)return
  let stop=false
  async function poll(){
   const r=await fetch("/api/youtube/watch-together?roomId="+encodeURIComponent(roomId),{cache:"no-store"});if(!r.ok)return
   const d=await r.json();if(stop||!d.room)return
   setRoom(d.room)
   if(previousOther.current===true&&!d.room.otherPresent)setPopup((d.room.otherNickname||"Your partner")+" left the Watch Together room.")
   previousOther.current=Boolean(d.room.otherPresent)

   if(playerReady&&player.current&&!initialized.current){
    applyRemote(d.room,true);initialized.current=true
    return
   }
   if(!playerReady||!player.current||!initialized.current||suppress.current)return

   const incomingVersion=Number(d.room.version??-1)
   const expected=Number(d.room.position||0)+(latencyAssist&&!d.room.isLeader?2:0)
   const local=Number(player.current.getCurrentTime?.()||0)
   const currentVideo=player.current.getVideoData?.().video_id||""
   const drift=Math.abs(expected-local)
   const videoChanged=currentVideo!==d.room.videoId
   const playChanged=player.current.getPlayerState?.()===1!==Boolean(d.room.playing)
   const rateChanged=Math.abs(Number(player.current.getPlaybackRate?.()||1)-Number(d.room.playbackRate||1))>.01
   const remoteJump=lastRemotePosition.current!==null&&Math.abs(Number(d.room.position)-lastRemotePosition.current)>1.25
   const externalChange=videoChanged||playChanged||rateChanged||remoteJump
   if(incomingVersion!==version.current){
    version.current=incomingVersion
    if(!d.room.isLeader&&externalChange&&Date.now()-lastLocalAction.current>900){
     if(videoChanged)setPopup((d.room.leaderNickname||"Your partner")+" changed the video.")
     else if(rateChanged)setPopup((d.room.leaderNickname||"Your partner")+" changed playback speed.")
     else if(!d.room.playing&&lastRemotePlaying.current===true)setPopup((d.room.leaderNickname||"Your partner")+" paused the video.")
     else if(d.room.playing&&lastRemotePlaying.current===false)setPopup((d.room.leaderNickname||"Your partner")+" resumed the video.")
     else if(remoteJump){
      const delta=Number(d.room.position)-Number(lastRemotePosition.current)
      setPopup((d.room.leaderNickname||"Your partner")+" skipped "+(delta>0?"+":"")+Math.round(delta)+"s.")
     }
    }
    if(videoChanged||playChanged||rateChanged||(d.room.playing&&drift>=.8)||(!d.room.playing&&drift>=.35))applyRemote(d.room,false)
   }else if(d.room.playing&&drift>=1.2){applyRemote(d.room,false)}
   lastRemotePosition.current=Number(d.room.position);lastRemoteVideo.current=d.room.videoId;lastRemotePlaying.current=Boolean(d.room.playing);lastRemoteRate.current=Number(d.room.playbackRate||1)
  }
  poll();const t=setInterval(poll,700);return()=>{stop=true;clearInterval(t)}
 },[roomId,playerReady,latencyAssist])

 useEffect(()=>{
  if(!roomId||!room?.isLeader||!playerReady)return
  const t=setInterval(()=>{
   if(!player.current||suppress.current||!initialized.current)return
   const position=Number(player.current.getCurrentTime?.()||0);const video=player.current.getVideoData?.().video_id||""
   const volume=Number(player.current.getVolume?.()??100);const rate=Number(player.current.getPlaybackRate?.()||1);const playing=player.current.getPlayerState?.()===1
   const jump=Math.abs(position-lastLocal.position.current)>1.25
   const videoChanged=video&&video!==lastLocal.video.current
   const volumeChanged=Math.abs(volume-lastLocal.volume.current)>=2
   const rateChanged=Math.abs(rate-lastLocal.rate.current)>.01
   if(jump||videoChanged||volumeChanged||rateChanged){lastLocalAction.current=Date.now();void sync(true)}
   else if(playing)void sync(false)
   lastLocal.position.current=position;lastLocal.video.current=video;lastLocal.volume.current=volume;lastLocal.rate.current=rate
  },1200)
  return()=>clearInterval(t)
 },[roomId,room?.isLeader,playerReady])

 function applyRemote(r:any,initial:boolean){
  if(!player.current)return
  version.current=Number(r.version??-1);suppress.current=true
  const expected=Number(r.position||0)+(latencyAssist&&!r.isLeader?2:0)
  const current=player.current.getVideoData?.().video_id||""
  try{
   if(current!==r.videoId){
    if(r.playing)player.current.loadVideoById({videoId:r.videoId,startSeconds:expected})
    else player.current.cueVideoById({videoId:r.videoId,startSeconds:expected})
   }else{
    const drift=Math.abs(Number(player.current.getCurrentTime?.()||0)-expected)
    if(initial||drift>=.8)player.current.seekTo(expected,true)
   }
   if(r.playing)player.current.playVideo();else player.current.pauseVideo()
   player.current.setVolume(r.volume)
   try{player.current.setPlaybackRate(r.playbackRate)}catch{}
  }catch{}
  if(r.playing){
   setTimeout(()=>{suppress.current=false;const state=player.current?.getPlayerState?.();if(state!==1)setNeedsStart(true)},700)
  }else{setNeedsStart(false);setTimeout(()=>{suppress.current=false},500)}
 }

 useEffect(()=>{
  if(!roomId)return
  let stop=false
  async function loadChat(){const r=await fetch("/api/youtube/watch-together?roomId="+encodeURIComponent(roomId)+"&chat=1",{cache:"no-store"});if(!r.ok)return;const d=await r.json();if(!stop)setChat(Array.isArray(d.chat)?d.chat:[])}
  loadChat();const t=setInterval(loadChat,1000);return()=>{stop=true;clearInterval(t)}
 },[roomId])

 async function sendChat(){
  const content=chatText.trim().slice(0,500);if(!content||chatSending)return
  setChatSending(true)
  try{const r=await api({action:"chat-send",roomId,content});if(r.ok){setChatText("");const d=await r.json();setChat(x=>[...x,d.message])}}finally{setChatSending(false)}
 }
 function tagPartner(){const name=room?.otherNickname||"partner";setChatText(x=>x+(x&&!x.endsWith(" ")?" ":"")+"@"+name+" ")}
 async function search(){
  const q=query.trim();if(!q||searching)return
  setSearching(true);setSearchMessage("")
  try{const r=await fetch("/api/youtube/search?q="+encodeURIComponent(q),{cache:"no-store"});const d=await r.json();if(!r.ok){setResults([]);setSearchMessage(d?.message||"YouTube search is temporarily unavailable.");return}setResults(Array.isArray(d)?d:[])}
  catch{setResults([]);setSearchMessage("Search failed. Please try again.")}finally{setSearching(false)}
 }
 function choose(id:string){if(!player.current||!playerReady||!room?.isLeader)return;suppress.current=true;player.current.cueVideoById({videoId:id,startSeconds:0});version.current=-1;setTimeout(()=>{suppress.current=false;initialized.current=true;lastLocalAction.current=Date.now();void sync(true)},900)}
 async function takeControl(){const r=await api({action:"take-control",roomId});if(r.ok){setPopup("You now control playback.");await fetch("/api/youtube/watch-together?roomId="+encodeURIComponent(roomId),{cache:"no-store"})}}
 async function leave(){await api({action:"leave",roomId});router.push("/watch/youtube")}

 if(!room)return <main className="min-h-screen bg-black text-white flex items-center justify-center">Joining Watch Together…</main>

 return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-4 text-white"><div className="mx-auto max-w-2xl">
  <div className="flex items-center justify-between"><h1 className="text-xl font-bold">🫂 Watch Together</h1><button onClick={leave} className="rounded-xl bg-white/10 px-4 py-2">🚪 Leave</button></div>
  <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-3xl bg-black"><div id="wt-player" className="h-full w-full"/>{needsStart&&<button onClick={()=>{player.current?.playVideo?.();setNeedsStart(false)}} className="absolute inset-0 flex items-center justify-center bg-black/65 text-lg font-semibold">▶ Tap to start synced playback</button>}</div>
  {playerError&&<p className="mt-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{playerError}</p>}
  <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/10 px-3 py-2">{room.isLeader?"🎮 You control playback":"👀 Partner controls playback"}</span>{!room.isLeader&&<button onClick={()=>void takeControl()} className="rounded-full bg-white/10 px-3 py-2">Take control</button>}<button onClick={()=>setLatencyAssist(v=>!v)} className={"rounded-full px-3 py-2 "+(latencyAssist?"bg-pink-500/40":"bg-white/10")}>+2s assist {latencyAssist?"ON":"OFF"}</button><button onClick={()=>{player.current?.seekTo?.(Number(player.current?.getCurrentTime?.()||0)+2,true);lastLocalAction.current=Date.now();if(room.isLeader)void sync(true)}} className="rounded-full bg-white/10 px-3 py-2">⏩ +2s</button></div>

  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
   <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">💬 Watch Together Chat</span><span className="text-xs text-white/40">Temporary • no history</span></div>
   <div className="max-h-56 space-y-2 overflow-y-auto pr-1">{chat.length===0?<p className="py-3 text-center text-sm text-white/40">Say something while you watch 👋</p>:chat.map(m=><div key={m.id} className="rounded-xl bg-white/5 px-3 py-2"><p className="text-xs text-white/40">{m.senderNickname}</p><p className="break-words text-sm">{m.content.split(/(@[A-Za-z0-9_ -]+)/g).map((part,i)=>part.startsWith("@")?<span key={i} className="text-pink-200">{part}</span>:part)}</p></div>)}</div>
   <div className="mt-3 flex gap-2"><button onClick={tagPartner} className="rounded-xl bg-white/10 px-3 py-3 text-sm">@</button><input value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void sendChat()} maxLength={500} placeholder="Message… 😀" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-3 text-sm outline-none"/><button disabled={!chatText.trim()||chatSending} onClick={()=>void sendChat()} className="rounded-xl bg-white/10 px-4 disabled:opacity-40">Send</button></div>
  </div>

  <div className="mt-4 flex gap-2"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void search()} placeholder="🔍 Search another video" className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-3 outline-none"/><button disabled={searching} onClick={()=>void search()} className="rounded-2xl bg-white/10 px-4 py-3 disabled:opacity-40">{searching?"…":"Search"}</button></div>
  <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={()=>router.push("/watch/youtube/library/liked")} className="rounded-2xl bg-white/10 py-3">❤️ Liked</button><button onClick={()=>router.push("/watch/youtube/library/watch-later")} className="rounded-2xl bg-white/10 py-3">🕒 Watch Later</button></div>
  {searchMessage&&<p className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-white/60">{searchMessage}</p>}
  {results.length>0&&<div className="mt-3">{room.isLeader?<VideoList videos={results} onSelect={choose}/>:<p className="rounded-xl bg-white/5 p-3 text-sm text-white/50">Only the current controller can change the video. Tap “Take control” to search and change it.</p>}</div>}
  {popup&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-6 text-center shadow-2xl"><p className="text-base">{popup}</p><button onClick={()=>setPopup(null)} className="mt-5 w-full rounded-xl bg-white/10 py-3">OK</button></div></div>}
 </div></main>
}

export default function WatchTogetherPage(){return <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading…</main>}><Page/></Suspense>}
