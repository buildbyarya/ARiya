"use client"

import {Suspense,useEffect,useRef,useState} from "react"
import {useRouter,useSearchParams} from "next/navigation"

declare global{interface Window{YT:any;onYouTubeIframeAPIReady?:()=>void}}

type ChatMessage={id:string;senderId:string;senderNickname:string;content:string;createdAt:string;reply?:{id:string;senderNickname:string;content:string}|null}
type Video={id:string;title?:string;thumbnail?:string;channel?:string}
type Playlist={id:string;name:string;visibility:"PERSONAL"|"SHARED";videos:{id:string}[]}

function Page(){
 const p=useSearchParams();const router=useRouter();const roomId=p.get("roomId")||""
 const[room,setRoom]=useState<any>();const[playerReady,setPlayerReady]=useState(false);const[playerError,setPlayerError]=useState("");const[needsStart,setNeedsStart]=useState(false)
 const[chat,setChat]=useState<ChatMessage[]>([]);const[chatText,setChatText]=useState("");const[replyTo,setReplyTo]=useState<ChatMessage|null>(null);const[chatSending,setChatSending]=useState(false)
 const[search,setSearch]=useState("");const[searchResults,setSearchResults]=useState<Video[]>([]);const[searchMessage,setSearchMessage]=useState("");const[searching,setSearching]=useState(false);const[paste,setPaste]=useState("")
 const[liked,setLiked]=useState<Video[]>([]);const[watchLater,setWatchLater]=useState<Video[]>([]);const[playlists,setPlaylists]=useState<Playlist[]>([]);const[selected,setSelected]=useState("liked");const[playlistVideos,setPlaylistVideos]=useState<Video[]>([]);const[sourcesOpen,setSourcesOpen]=useState(false)
 const[inviteMessage,setInviteMessage]=useState("");const[playerStarted,setPlayerStarted]=useState(false)
 const player=useRef<any>(null);const suppress=useRef(false);const version=useRef(-1);const initialized=useRef(false);const lastLocalAction=useRef(0);const lastRemotePosition=useRef<number|null>(null);const lastRemotePlaying=useRef<boolean|null>(null);const hadPartner=useRef(false);const [partnerLeft,setPartnerLeft]=useState(false)
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
    onError:(e:any)=>{console.error(e);setPlayerError("YouTube could not load this video.")}
   }})
  }
  if(window.YT?.Player)make();else{
   const prev=window.onYouTubeIframeAPIReady
   window.onYouTubeIframeAPIReady=()=>{prev?.();make()}
   if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.body.appendChild(s)}
  }
  return()=>{cancelled=true;player.current?.destroy?.();player.current=null;setPlayerReady(false);initialized.current=false}
 },[Boolean(room?.id)])

 function applyRemote(r:any,initial=false){
  if(!player.current)return
  version.current=Number(r.version??-1);suppress.current=true
  const expected=Number(r.position||0);const current=player.current.getVideoData?.().video_id||""
  try{
   if(current!==r.videoId){if(r.playing)player.current.loadVideoById({videoId:r.videoId,startSeconds:expected});else player.current.cueVideoById({videoId:r.videoId,startSeconds:expected})}
   else if(initial||Math.abs(Number(player.current.getCurrentTime?.()||0)-expected)>=.8)player.current.seekTo(expected,true)
   if(r.playing)player.current.playVideo();else player.current.pauseVideo()
   player.current.setVolume(r.volume);try{player.current.setPlaybackRate(r.playbackRate)}catch{}
  }catch{}
  setTimeout(()=>{suppress.current=false;const state=player.current?.getPlayerState?.();if(r.playing&&state!==1)setNeedsStart(true);else setNeedsStart(false)},700)
 }

 useEffect(()=>{
  if(!roomId)return
  let stop=false
  async function poll(){
   const r=await fetch("/api/youtube/watch-together?roomId="+encodeURIComponent(roomId),{cache:"no-store"});if(!r.ok)return
   const d=await r.json();if(stop||!d.room)return
   setRoom(d.room)
   if(hadPartner.current&& !d.room.otherPresent){setPartnerLeft(true)}
   if(d.room.otherPresent)hadPartner.current=true
   if(playerReady&&player.current&&!initialized.current){applyRemote(d.room,true);initialized.current=true;return}
   if(!playerReady||!player.current||!initialized.current||suppress.current)return
   const incoming=Number(d.room.version??-1);const local=Number(player.current.getCurrentTime?.()||0);const current=player.current.getVideoData?.().video_id||""
   const drift=Math.abs(Number(d.room.position)-local);const videoChanged=current!==d.room.videoId;const playChanged=(player.current.getPlayerState?.()===1)!==Boolean(d.room.playing);const rateChanged=Math.abs(Number(player.current.getPlaybackRate?.()||1)-Number(d.room.playbackRate||1))>.01
      if(incoming!==version.current){version.current=incoming;if(videoChanged||playChanged||rateChanged||(d.room.playing&&drift>=.8)||(!d.room.playing&&drift>=.35))applyRemote(d.room)}
   else if(d.room.playing&&drift>=1.2)applyRemote(d.room)
   lastRemotePosition.current=Number(d.room.position);lastRemotePlaying.current=Boolean(d.room.playing)
  }
  poll();const t=setInterval(poll,700);return()=>{stop=true;clearInterval(t)}
 },[roomId,playerReady])

 useEffect(()=>{
  if(!roomId||!room?.isLeader||!playerReady)return
  const t=setInterval(()=>{
   if(!player.current||suppress.current||!initialized.current)return
   const position=Number(player.current.getCurrentTime?.()||0),video=player.current.getVideoData?.().video_id||"",volume=Number(player.current.getVolume?.()??100),rate=Number(player.current.getPlaybackRate?.()||1),playing=player.current.getPlayerState?.()===1
   const jump=Math.abs(position-lastLocal.position.current)>1.25,videoChanged=video!==lastLocal.video.current,volumeChanged=Math.abs(volume-lastLocal.volume.current)>=2,rateChanged=Math.abs(rate-lastLocal.rate.current)>.01
   if(jump||videoChanged||volumeChanged||rateChanged)void sync(true);else if(playing)void sync(false)
   lastLocal.position.current=position;lastLocal.video.current=video;lastLocal.volume.current=volume;lastLocal.rate.current=rate
  },1000)
  return()=>clearInterval(t)
 },[roomId,room?.isLeader,playerReady])

 useEffect(()=>{if(!roomId)return;let stop=false;async function load(){const r=await fetch("/api/youtube/watch-together?roomId="+encodeURIComponent(roomId)+"&chat=1",{cache:"no-store"});if(r.ok){const d=await r.json();if(!stop)setChat(d.chat||[])}}load();const t=setInterval(load,1000);return()=>{stop=true;clearInterval(t)}},[roomId])

 async function loadSources(){
  const r=await fetch("/api/youtube/watch-together?roomId="+encodeURIComponent(roomId)+"&sources=1",{cache:"no-store"});if(!r.ok)return
  const d=await r.json();setLiked(d.liked||[]);setWatchLater(d.watchLater||[]);setPlaylists(d.playlists||[])
 }
 useEffect(()=>{if(roomId)void loadSources()},[roomId])

 async function sendChat(){
  const text=chatText.trim();if(!text||chatSending)return
  setChatSending(true);try{const r=await api({action:"chat-send",roomId,content:text,replyId:replyTo?.id});if(r.ok){const d=await r.json();setChat(x=>[...x,d.message]);setChatText("");setReplyTo(null)}}finally{setChatSending(false)}
 }
 async function searchVideos(){
  const q=search.trim();if(!q)return
  setSearching(true);setSearchMessage("")
  try{const r=await fetch("/api/youtube/search?q="+encodeURIComponent(q),{cache:"no-store"});const d=await r.json();if(!r.ok){setSearchResults([]);setSearchMessage(d.message||"YouTube search is unavailable.");return}setSearchResults(d||[])}catch{setSearchMessage("Search failed. Please try again.")}finally{setSearching(false)}
 }
 function extractId(value:string){try{const u=new URL(value.trim());if(u.hostname.includes("youtu.be"))return u.pathname.slice(1).split("/")[0]||null;if(u.hostname.includes("youtube.com"))return u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop()||null}catch{}return null}
 function choose(id:string){if(!player.current||!playerReady)return;setPlayerStarted(true);suppress.current=true;player.current.loadVideoById({videoId:id,startSeconds:0});setTimeout(()=>{suppress.current=false;initialized.current=true;lastLocalAction.current=Date.now();void sync(true)},700)}
 function chooseVideo(v:Video){choose(v.id)}
 function openPlaylist(pl:Playlist){setSelected(pl.id);setPlaylistVideos([]);void (async()=>{const ids=pl.videos.map(v=>v.id).join(",");if(!ids)return;try{const r=await fetch("/api/youtube/videos?ids="+encodeURIComponent(ids));if(r.ok)setPlaylistVideos(await r.json())}catch{}})()}
 async function resendInvite(){const r=await api({action:"resend-invite",roomId});if(r.ok)setInviteMessage("Invite sent again.");else setInviteMessage("Could not send the invite again.")}
 function dismissPartnerLeft(){setPartnerLeft(false)}
 async function leave(){await api({action:"leave",roomId});router.push("/watch/youtube")}
 const displayed=selected==="liked"?liked:selected==="watchLater"?watchLater:playlistVideos

 if(!room)return <main className="min-h-screen bg-black text-white flex items-center justify-center">Joining Watch Together…</main>

 return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-4 text-white"><div className="mx-auto max-w-2xl">
  <div className="flex items-center justify-between"><h1 className="text-xl font-bold">🫂 Watch Together</h1><button onClick={leave} className="rounded-xl bg-white/10 px-4 py-2">🚪 Leave</button></div>
  <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-3xl bg-black"><div id="wt-player" className="h-full w-full"/>{needsStart&&<button onClick={()=>{player.current?.playVideo?.();setNeedsStart(false);setPlayerStarted(true)}} className="absolute inset-0 flex items-center justify-center bg-black/70 text-lg font-semibold">▶ Tap to start video</button>}</div>
  {playerError&&<p className="mt-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{playerError}</p>}
  {!room.otherPresent&&room.isLeader&&<button onClick={()=>void resendInvite()} className="mt-3 w-full rounded-2xl bg-white/10 py-3">📨 Invite partner again</button>}
  {partnerLeft&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-6 text-center shadow-2xl"><div className="text-4xl">👋</div><h2 className="mt-3 text-xl font-bold">Your partner left</h2><p className="mt-2 text-sm text-white/60">The other user has left the Watch Together room.</p><button onClick={dismissPartnerLeft} className="mt-5 w-full rounded-xl bg-white/10 py-3">Okay</button></div></div>}
  {inviteMessage&&<p className="mt-2 text-center text-sm text-white/60">{inviteMessage}</p>}

  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
   <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">💬 Watch Together Chat</span><span className="text-xs text-white/40">Temporary</span></div>
   <div className="max-h-56 space-y-2 overflow-y-auto pr-1">{chat.length===0?<p className="py-3 text-center text-sm text-white/40">Say something while you watch 👋</p>:chat.map(m=><div key={m.id} className="rounded-xl bg-white/5 px-3 py-2"><div className="flex items-start justify-between gap-2"><p className="text-xs text-white/40">{m.senderNickname}</p><button onClick={()=>setReplyTo(m)} className="text-xs text-pink-200">Reply</button></div>{m.reply&&<button onClick={()=>document.getElementById("chat-"+m.reply!.id)?.scrollIntoView({behavior:"smooth",block:"center"})} className="mb-1 w-full rounded-lg border-l-2 border-pink-300/60 bg-white/5 px-2 py-1 text-left text-xs text-white/50">↩ {m.reply.senderNickname}: {m.reply.content}</button>}<p id={"chat-"+m.id} className="break-words text-sm">{m.content}</p></div>)}</div>
   {replyTo&&<div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs"><span className="truncate">Replying to {replyTo.senderNickname}: {replyTo.content}</span><button onClick={()=>setReplyTo(null)} className="ml-2">✕</button></div>}
   <div className="mt-3 flex gap-2"><input value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void sendChat()} maxLength={500} placeholder="Message… 😀" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-3 text-sm outline-none"/><button disabled={!chatText.trim()||chatSending} onClick={()=>void sendChat()} className="rounded-xl bg-white/10 px-4 disabled:opacity-40">Send</button></div>
  </div>

  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
   <div className="grid grid-cols-3 gap-2"><button onClick={()=>setSelected("liked")} className={"rounded-xl py-3 text-sm "+(selected==="liked"?"bg-pink-500/30":"bg-white/10")}>❤️ Liked</button><button onClick={()=>setSelected("watchLater")} className={"rounded-xl py-3 text-sm "+(selected==="watchLater"?"bg-pink-500/30":"bg-white/10")}>🕒 Watch Later</button><button onClick={()=>{setSourcesOpen(true);setSelected("search")}} className={"rounded-xl py-3 text-sm "+(selected==="search"?"bg-pink-500/30":"bg-white/10")}>🔎 Search</button></div>
   <div className="mt-3 flex gap-2 overflow-x-auto pb-2">{playlists.map(pl=><button key={pl.id} onClick={()=>openPlaylist(pl)} className={"shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm "+(selected===pl.id?"bg-pink-500/30":"")}>{pl.visibility==="PERSONAL"?"🔒 ":"🤝 "}{pl.name}</button>)}</div>
   {(selected==="liked"||selected==="watchLater"||selected==="search"||playlistVideos.length>0)&&<div className="mt-3 space-y-2">
    {selected==="search"&&<div className="space-y-2"><div className="flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void searchVideos()} placeholder="Search YouTube" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-3 outline-none"/><button onClick={()=>void searchVideos()} disabled={searching} className="rounded-xl bg-white/10 px-4">{searching?"…":"Search"}</button></div><div className="flex gap-2"><input value={paste} onChange={e=>setPaste(e.target.value)} placeholder="Paste YouTube link" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-3 outline-none"/><button onClick={()=>{const id=extractId(paste);if(id&&room.isLeader)choose(id)}} className="rounded-xl bg-white/10 px-4">Load</button></div>{searchMessage&&<p className="rounded-xl bg-white/5 p-3 text-sm text-white/60">{searchMessage}</p>}</div>}
    {selected!=="search"&&displayed.length===0&&<p className="py-4 text-center text-sm text-white/40">No videos here yet.</p>}
    {(selected==="search"?searchResults:displayed).map(v=><button key={v.id} disabled={!room.isLeader} onClick={()=>chooseVideo(v)} className="flex w-full gap-3 rounded-xl bg-white/5 p-2 text-left disabled:opacity-50">{v.thumbnail?<img src={v.thumbnail} alt="" className="h-16 w-28 rounded-lg object-cover"/>:<div className="h-16 w-28 rounded-lg bg-white/10"/>}<span className="min-w-0"><span className="block truncate text-sm font-medium">{v.title||v.id}</span><span className="block truncate text-xs text-white/40">{v.channel||"YouTube"}</span></span></button>)}
    {!room.isLeader&&<p className="text-xs text-white/40">Both users can control playback. The latest change is shared with both sides.</p>}
   </div>}
  </div>
 </div></main>
}

export default function WatchTogetherPage(){return <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading…</main>}><Page/></Suspense>}
