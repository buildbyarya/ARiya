"use client"

type PlayerActionsProps={videoId:string}

export default function PlayerActions({videoId}:PlayerActionsProps){
 const update=async(type:"liked"|"watch_later")=>{
  try{
   const r=await fetch("/api/youtube/library",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({videoId,type})})
   const d=await r.json().catch(()=>({}))
   alert(r.ok?(type==="liked"?"❤️ Added to Liked":"⏰ Added to Watch Later"):(d?.error||"Could not update library."))
  }catch{alert("Network error. Please try again.")}
 }
 return <div className="grid grid-cols-2 gap-3 mt-6">
  <button onClick={()=>void update("liked")} className="rounded-2xl bg-white/10 p-4 hover:bg-white/20 transition">❤️ Like</button>
  <button onClick={()=>void update("watch_later")} className="rounded-2xl bg-white/10 p-4 hover:bg-white/20 transition">⏰ Watch Later</button>
  <button className="rounded-2xl bg-white/10 p-4 hover:bg-white/20 transition">➕ Playlist</button>
  <button className="rounded-2xl bg-white/10 p-4 hover:bg-white/20 transition">👥 Invite Partner</button>
 </div>
