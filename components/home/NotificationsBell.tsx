"use client"
import {useEffect,useRef,useState} from "react"
import {useRouter} from "next/navigation"

export default function NotificationsBell(){
 const[a,setA]=useState<any[]>([]);const[events,setEvents]=useState<any[]>([]);const[open,setOpen]=useState(false);const[reply,setReply]=useState<{id:string;text:string}|null>(null);const[toast,setToast]=useState<any>(null);const seen=useRef(new Set<string>());const router=useRouter()
 async function load(){
  const r=await fetch("/api/notifications",{cache:"no-store"});if(!r.ok)return
  const d=await r.json();setA(d.notifications||[]);setEvents(d.events||[])
  const fresh=[...(d.notifications||[]).map((x:any)=>({...x,type:"invite"})),...(d.events||[]).map((x:any)=>({...x,type:"event"}))].filter((x:any)=>!seen.current.has(x.id))
  if(fresh.length){fresh.forEach((x:any)=>seen.current.add(x.id));setToast(fresh[0]);setTimeout(()=>setToast(null),6000)}
 }
 useEffect(()=>{void load();const t=setInterval(load,2000);return()=>clearInterval(t)},[])
 async function respond(id:string,x:string,msg?:string){
  const r=await fetch("/api/youtube/watch-together",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"respond",inviteId:id,response:x,message:msg})});const d=await r.json()
  if(x==="accept"&&d.roomId)router.push("/watch/youtube/watch-together?roomId="+d.roomId)
  setReply(null);await load()
 }
 return <div className="relative">
  <button onClick={()=>setOpen(v=>!v)} className="rounded-xl px-2 py-1 text-xl transition hover:bg-white/10" aria-label="Notifications">🔔{(a.length+events.length)>0&&<span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500"/>}</button>
  {toast&&<div className="fixed right-4 top-20 z-[100] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl"><p className="text-sm font-medium">{toast.text}</p>{toast.customMessage&&<p className="mt-1 text-xs text-white/50">💬 {toast.customMessage}</p>}{toast.type==="invite"&&<div className="mt-3 flex gap-2"><button onClick={()=>void respond(toast.id,"accept")} className="flex-1 rounded-lg bg-white/10 px-2 py-2 text-sm">Accept</button><button onClick={()=>void respond(toast.id,"decline")} className="flex-1 rounded-lg bg-white/10 px-2 py-2 text-sm">Decline</button><button onClick={()=>setReply({id:toast.id,text:""})} className="flex-1 rounded-lg bg-white/10 px-2 py-2 text-sm">💬 Reply</button></div>}</div>}
  {open&&<div className="absolute right-0 top-12 z-[70] w-80 rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-2xl">
   {a.length===0&&events.length===0?<p className="p-3 text-sm text-white/50">No new notifications.</p>:<>{a.map(i=><div key={i.id} className="mb-2 rounded-xl bg-white/5 p-3"><p className="text-sm">{i.text}</p>{i.customMessage&&<p className="mt-1 text-xs text-white/50">💬 {i.customMessage}</p>}<div className="mt-2 flex gap-2"><button onClick={()=>void respond(i.id,"accept")} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-sm">Accept</button><button onClick={()=>void respond(i.id,"decline")} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-sm">Decline</button><button onClick={()=>setReply({id:i.id,text:""})} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-sm">💬 Reply</button></div></div>)}{events.map(i=><div key={i.id} className="mb-2 rounded-xl bg-white/5 p-3 text-sm">{i.text}</div>)}</>}
   {reply&&<div className="mt-2 rounded-xl bg-white/5 p-2"><input autoFocus value={reply.text} onChange={e=>setReply({...reply,text:e.target.value})} placeholder="Write a reply…" className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm outline-none"/><button disabled={!reply.text.trim()} onClick={()=>void respond(reply.id,"reply",reply.text.trim())} className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2 text-sm disabled:opacity-40">Send</button></div>}
  </div>}
 </div>
}