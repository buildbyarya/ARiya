"use client"
import {useEffect,useRef,useState} from "react"
import {useRouter} from "next/navigation"

export default function NotificationsBell(){
 const[a,setA]=useState<any[]>([]);const[events,setEvents]=useState<any[]>([]);const[open,setOpen]=useState(false)
 const[reply,setReply]=useState<{id:string;text:string}|null>(null);const[toast,setToast]=useState<any>(null)
 const[seen]=useState(()=>new Set<string>());const router=useRouter()
 async function load(){
  const r=await fetch("/api/notifications",{cache:"no-store"});if(!r.ok)return
  const d=await r.json();setA(d.notifications||[]);setEvents(d.events||[])
  const fresh=[...(d.notifications||[]).map((x:any)=>({...x,type:"invite"})),...(d.events||[]).map((x:any)=>({...x,type:"event"}))].filter((x:any)=>!seen.has(x.id))
  fresh.forEach((x:any)=>seen.add(x.id))
  if(fresh.length)setToast(fresh[0])
 }
 useEffect(()=>{void load();const t=setInterval(load,2000);return()=>clearInterval(t)},[])
 async function respond(id:string,x:string,msg?:string){
  const r=await fetch("/api/youtube/watch-together",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"respond",inviteId:id,response:x,message:msg})})
  const d=await r.json()
  if(!r.ok){setToast({id:"error-"+Date.now(),type:"event",text:d?.error||"Could not respond to the invitation.",kind:"error"});setReply(null);return}
  if(x==="accept"&&d.roomId)router.push("/watch/youtube/watch-together?roomId="+encodeURIComponent(d.roomId))
  setReply(null);await load()
 }
 function startReply(id:string){setToast(null);setOpen(false);setReply({id,text:""})}
 return <div className="relative">
  <button onClick={()=>setOpen(v=>!v)} className="rounded-xl px-2 py-1 text-xl transition hover:bg-white/10" aria-label="Notifications">🔔{(a.length+events.length)>0&&<span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500"/>}</button>
  {toast&&<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"><p className="text-center text-base font-medium">{toast.text}</p>{toast.customMessage&&<p className="mt-2 text-center text-sm text-white/60">💬 {toast.customMessage}</p>}{toast.type==="invite"?<div className="mt-5 grid grid-cols-3 gap-2"><button onClick={()=>void respond(toast.id,"accept")} className="rounded-xl bg-white/10 px-2 py-3 text-sm">Accept</button><button onClick={()=>void respond(toast.id,"decline")} className="rounded-xl bg-white/10 px-2 py-3 text-sm">Decline</button><button onClick={()=>startReply(toast.id)} className="rounded-xl bg-white/10 px-2 py-3 text-sm">💬 Reply</button></div>:<button onClick={()=>setToast(null)} className="mt-5 w-full rounded-xl bg-white/10 py-3">OK</button>}</div></div>}
  {reply&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"><p className="font-medium">Reply to Watch Together invitation</p><input autoFocus value={reply.text} onChange={e=>setReply({...reply,text:e.target.value})} onKeyDown={e=>e.key==="Enter"&&reply.text.trim()&&void respond(reply.id,"reply",reply.text.trim())} placeholder="Write a message…" className="mt-4 w-full rounded-xl bg-black/40 px-3 py-3 text-sm outline-none"/><div className="mt-3 flex gap-2"><button onClick={()=>setReply(null)} className="flex-1 rounded-xl bg-white/10 py-3">Cancel</button><button disabled={!reply.text.trim()} onClick={()=>void respond(reply.id,"reply",reply.text.trim())} className="flex-1 rounded-xl bg-white/10 py-3 disabled:opacity-40">Send</button></div></div></div>}
  {open&&<div className="absolute right-0 top-12 z-[70] w-80 rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-2xl">{a.length===0&&events.length===0?<p className="p-3 text-sm text-white/50">No new notifications.</p>:<>{a.map(i=><div key={i.id} className="mb-2 rounded-xl bg-white/5 p-3"><p className="text-sm">{i.text}</p>{i.customMessage&&<p className="mt-1 text-xs text-white/50">💬 {i.customMessage}</p>}<div className="mt-2 flex gap-2"><button onClick={()=>void respond(i.id,"accept")} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-sm">Accept</button><button onClick={()=>void respond(i.id,"decline")} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-sm">Decline</button><button onClick={()=>startReply(i.id)} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-sm">💬 Reply</button></div></div>)}{events.map(i=><div key={i.id} className="mb-2 rounded-xl bg-white/5 p-3 text-sm">{i.text}</div>)}</>}</div>}
 </div>
}
