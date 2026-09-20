"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import PageHeader from "@/components/common/PageHeader"

type Msg = { id:string; senderId:string; senderName:string; content:string; kind:"TEXT"|"IMAGE"|"VOICE"; pinned:boolean; createdAt:string; replyTo:{id:string;senderName:string;content:string;kind:string}|null; media:{data:string|null;mime:string|null;remaining:number;expiresAt:string|null}|null }
type ChatSetting = { background:string;fontSize:number;textColor:string;fontFamily:string }

const backgrounds=[
  "linear-gradient(135deg,#160b2e,#050505,#2a0a22)",
  "linear-gradient(135deg,#0b1d2e,#050505,#102b1c)",
  "linear-gradient(135deg,#2e0b0b,#050505,#2e1b0b)",
  "linear-gradient(135deg,#111827,#312e81,#111827)",
]

function health(n:number){return n>=3?"❤️ Full health (3)":n===2?"❤️‍🩹 Injured (2)":n===1?"💔 Critical (1)":"🖤 Died (0)"}

export default function ChatPage(){
 const [messages,setMessages]=useState<Msg[]>([])
 const [setting,setSetting]=useState<ChatSetting|null>(null)
 const [html,setHtml]=useState("")
 const [reply,setReply]=useState<Msg|null>(null)
 const [loading,setLoading]=useState(true)
 const [formatOpen,setFormatOpen]=useState(false)
 const [settingsOpen,setSettingsOpen]=useState(false)
 const [recording,setRecording]=useState(false)
 const [mediaBusy,setMediaBusy]=useState(false)
 const editor=useRef<HTMLDivElement>(null)
 const recorder=useRef<MediaRecorder|null>(null)
 const chunks=useRef<Blob[]>([])
 const bottom=useRef<HTMLDivElement>(null)

 async function load(){
   const r=await fetch("/api/chat",{cache:"no-store"});if(!r.ok)return
   const d=await r.json();setMessages(d.messages||[]);setSetting(d.setting);setLoading(false)
 }
 useEffect(()=>{void load();const t=setInterval(()=>void load(),1800);return()=>clearInterval(t)},[])
 useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"})},[messages.length])

 function command(name:string,value?:string){editor.current?.focus();document.execCommand(name,false,value);setHtml(editor.current?.innerHTML||"")}
 function setColor(c:string){command("foreColor",c)}
 function setHighlight(c:string){command("hiliteColor",c)}

 async function sendText(){
   const content=(editor.current?.innerHTML||"").trim()
   if(!content || content==="<br>")return
   setMediaBusy(true)
   const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"send",kind:"TEXT",content,replyToId:reply?.id||null})})
   if(r.ok){if(editor.current)editor.current.innerHTML="";setHtml("");setReply(null);void load()}
   setMediaBusy(false)
 }

 function fileData(file:File){return new Promise<string>((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(String(fr.result));fr.onerror=reject;fr.readAsDataURL(file)})}
 async function sendImage(file:File){
   if(!file.type.startsWith("image/"))return
   if(file.size>4*1024*1024){alert("Keep images under 4 MB for temporary chat media.");return}
   setMediaBusy(true);const data=await fileData(file)
   const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"send",kind:"IMAGE",content:data,mime:file.type,replyToId:reply?.id||null})})
   if(r.ok){setReply(null);void load()}else alert("Could not send that image.")
   setMediaBusy(false)
 }
 async function toggleRecording(){
   if(recording){recorder.current?.stop();return}
   if(!navigator.mediaDevices?.getUserMedia){alert("Voice recording is not supported here.");return}
   const stream=await navigator.mediaDevices.getUserMedia({audio:true})
   const mr=new MediaRecorder(stream);recorder.current=mr;chunks.current=[];setRecording(true)
   mr.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)}
   mr.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());setRecording(false);const blob=new Blob(chunks.current,{type:mr.mimeType||"audio/webm"});if(blob.size>4*1024*1024){alert("Voice message is too large.");return}setMediaBusy(true);const data=await fileData(new File([blob],"voice.webm",{type:blob.type}));const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"send",kind:"VOICE",content:data,mime:blob.type,replyToId:reply?.id||null})});if(r.ok){setReply(null);void load()}setMediaBusy(false)}
   mr.start()
 }

 async function viewMedia(id:string){
   const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"view-media",messageId:id})})
   if(r.ok)void load()
 }
 async function pin(id:string){await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"pin",messageId:id})});void load()}
 async function del(id:string){if(!confirm("Delete this message?"))return;await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete",messageId:id}));void load()}

 async function saveSetting(patch:Partial<ChatSetting>){const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"settings",...patch})});if(r.ok){const d=await r.json();setSetting(d.setting)}}

 const pinned=useMemo(()=>messages.filter(m=>m.pinned),[messages])
 return <main className="min-h-screen text-white" style={{background:setting?.background||backgrounds[0],fontFamily:setting?.fontFamily||"system-ui"}}>
  <div className="mx-auto max-w-4xl p-4 sm:p-6">
   <PageHeader title="💬 Chat" backHref="/home"/>
   <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 shadow-2xl backdrop-blur-xl">
    <div className="flex items-center justify-between border-b border-white/10 p-4"><div><div className="font-bold">Our Chat</div><div className="text-xs text-white/45">Rich Notes-style messages</div></div><button onClick={()=>setSettingsOpen(v=>!v)} className="rounded-xl bg-white/10 px-3 py-2">⚙</button></div>
    {pinned.length>0&&<div className="border-b border-white/10 p-3"><div className="mb-2 text-xs font-semibold text-pink-200">📌 Pinned</div><div className="flex gap-2 overflow-x-auto">{pinned.map(m=><button key={m.id} onClick={()=>document.getElementById("msg-"+m.id)?.scrollIntoView({behavior:"smooth",block:"center"})} className="max-w-xs shrink-0 truncate rounded-xl bg-white/10 px-3 py-2 text-left text-xs">{m.content.replace(/<[^>]+>/g,"").slice(0,80)}</button>)}</div></div>}
    {settingsOpen&&setting&&<div className="border-b border-white/10 bg-black/30 p-4">
      <div className="text-sm font-semibold">Shared chat appearance</div><div className="mt-3 text-xs text-white/45">Both users see these settings.</div>
      <div className="mt-3 flex flex-wrap gap-2">{backgrounds.map((b,i)=><button key={i} onClick={()=>void saveSetting({background:b})} style={{background:b}} className="h-12 w-20 rounded-xl border border-white/20"/>)}</div>
      <div className="mt-3 flex items-center gap-2"><span className="text-sm">Font size</span>{[14,16,18,20,22].map(v=><button key={v} onClick={()=>void saveSetting({fontSize:v})} className={"rounded-lg px-3 py-2 "+(setting.fontSize===v?"bg-pink-500/30":"bg-white/10")}>{v}</button>)}</div>
      <div className="mt-3 flex items-center gap-2"><span className="text-sm">Text</span>{["#ffffff","#fde68a","#bfdbfe","#fbcfe8","#bbf7d0"].map(c=><button key={c} onClick={()=>void saveSetting({textColor:c})} style={{background:c}} className="h-8 w-8 rounded-full border border-white/30"/>)}</div>
    </div>}
    <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto p-4" style={{fontSize:setting?.fontSize||16,color:setting?.textColor||"#fff"}}>
      {loading?<div className="py-20 text-center text-white/50">Loading chat…</div>:messages.length===0?<div className="py-20 text-center text-white/45">Start your first conversation. 👋</div>:messages.map(m=><div id={"msg-"+m.id} key={m.id} className="mb-4 scroll-mt-6">
       <div className="group max-w-[90%] rounded-2xl bg-white/10 p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-white/40"><span>{m.senderName}</span><span>{new Date(m.createdAt).toLocaleString()}</span></div>
        {m.replyTo&&<button onClick={()=>document.getElementById("msg-"+m.replyTo!.id)?.scrollIntoView({behavior:"smooth",block:"center"})} className="mb-2 w-full rounded-xl border-l-2 border-pink-300 bg-white/5 p-2 text-left text-xs text-white/55">↩ {m.replyTo.senderName}: {m.replyTo.content.replace(/<[^>]+>/g,"").slice(0,140)}</button>}
        {m.kind==="TEXT"?<div className="prose prose-invert max-w-none break-words" dangerouslySetInnerHTML={{__html:m.content}}/>:m.media?.data?<div><div className="mb-2 text-xs text-white/65">{health(m.media.remaining)}</div>{m.kind==="IMAGE"?<img src={m.media.data} alt="Temporary" className="max-h-80 max-w-full rounded-xl object-contain"/>:<audio controls src={m.media.data} className="w-full"/>}<a href={m.media.data} download className="mt-2 inline-block rounded-lg bg-white/10 px-3 py-2 text-xs">Download</a><div className="mt-1 text-[11px] text-white/35">Opening this media uses one view.</div></div>:<div className="rounded-xl bg-black/20 p-4 text-sm text-white/45">🖤 {m.kind==="IMAGE"?"Image":"Voice message"} died</div>}
        <div className="mt-3 flex flex-wrap gap-2 opacity-70 group-hover:opacity-100"><button onClick={()=>setReply(m)} className="rounded-lg bg-white/5 px-2 py-1 text-xs">↩ Reply</button><button onClick={()=>void pin(m.id)} className="rounded-lg bg-white/5 px-2 py-1 text-xs">{m.pinned?"Unpin":"📌 Pin"}</button><button onClick={()=>void del(m.id)} className="rounded-lg bg-white/5 px-2 py-1 text-xs">Delete</button>{m.kind!=="TEXT"&&m.media?.data&&<button onClick={()=>void viewMedia(m.id)} className="rounded-lg bg-pink-500/20 px-2 py-1 text-xs">View / consume</button>}</div>
       </div>
      </div>)}
      <div ref={bottom}/>
    </div>
    {reply&&<div className="border-t border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between"><div className="min-w-0"><div className="text-xs text-pink-200">Replying to {reply.senderName}</div><div className="truncate text-sm text-white/55">{reply.content.replace(/<[^>]+>/g,"").slice(0,160)}</div></div><button onClick={()=>setReply(null)} className="px-3">✕</button></div></div>}
    <div className="border-t border-white/10 p-3">
      {formatOpen&&<div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-black/30 p-2"><button onClick={()=>command("bold")} className="rounded-lg bg-white/10 px-3 py-2 font-bold">B</button><button onClick={()=>command("italic")} className="rounded-lg bg-white/10 px-3 py-2 italic">I</button><button onClick={()=>command("underline")} className="rounded-lg bg-white/10 px-3 py-2 underline">U</button><button onClick={()=>command("strikeThrough")} className="rounded-lg bg-white/10 px-3 py-2">S̶</button><button onClick={()=>command("insertUnorderedList")} className="rounded-lg bg-white/10 px-3 py-2">• List</button><button onClick={()=>command("insertOrderedList")} className="rounded-lg bg-white/10 px-3 py-2">1. List</button><button onClick={()=>setColor("#fda4af")} className="rounded-lg bg-white/10 px-3 py-2">Pink</button><button onClick={()=>setColor("#fde68a")} className="rounded-lg bg-white/10 px-3 py-2">Yellow</button><button onClick={()=>setColor("#93c5fd")} className="rounded-lg bg-white/10 px-3 py-2">Blue</button><button onClick={()=>setHighlight("#fde68a")} className="rounded-lg bg-white/10 px-3 py-2">Highlight</button></div>}
      <div className="flex items-end gap-2"><button onClick={()=>setFormatOpen(v=>!v)} className="rounded-xl bg-white/10 px-3 py-3">Aa</button><label className="rounded-xl bg-white/10 px-3 py-3">🖼️<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void sendImage(f);e.currentTarget.value=""}}/></label><button onClick={()=>void toggleRecording()} className={"rounded-xl px-3 py-3 "+(recording?"bg-red-500/40":"bg-white/10")}>{recording?"⏹":"🎙️"}</button><div ref={editor} contentEditable suppressContentEditableWarning onInput={()=>setHtml(editor.current?.innerHTML||"")} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void sendText()}}} className="min-h-12 max-h-40 flex-1 overflow-y-auto rounded-xl bg-white/10 px-3 py-3 outline-none" data-placeholder="Message…"/><button disabled={mediaBusy} onClick={()=>void sendText()} className="rounded-xl bg-pink-500/30 px-4 py-3 disabled:opacity-40">Send</button></div>
      <div className="mt-2 text-[11px] text-white/30">Images and voice: 3 views/plays or 24 hours. Both users share chat appearance.</div>
    </div>
   </div>
  </div>
 </main>
}
