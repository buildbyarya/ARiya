"use client"
import PageHeader from "@/components/common/PageHeader"
import {useEffect,useState} from "react"

export default function AccountSettingsPage(){
 const [image,setImage]=useState(""),[name,setName]=useState(""),[email,setEmail]=useState(""),[saving,setSaving]=useState(false),[message,setMessage]=useState("")
 useEffect(()=>{fetch("/api/account/profile",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d.user){setImage(d.user.image||"");setName(d.user.nickname||d.user.name||"");setEmail(d.user.email||"")}})},[])
 async function upload(file:File){
  if(file.size>3_300_000){setMessage("Please choose an image under 3.3 MB.");return}
  const reader=new FileReader();reader.onload=async()=>{setSaving(true);setMessage("");const r=await fetch("/api/account/profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:String(reader.result)})});const d=await r.json();setMessage(r.ok?"Profile picture updated.":d.error||"Could not update picture.");setSaving(false)};reader.readAsDataURL(file)
 }
 return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6 text-white"><div className="mx-auto max-w-md"><PageHeader title="⚙ Account Settings" backHref="/home"/>
  <div className="mt-6 rounded-3xl bg-white/10 p-6">
   <div className="flex flex-col items-center"><div className="h-28 w-28 overflow-hidden rounded-full border border-white/15 bg-white/10">{image?<img src={image} alt="Profile" className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center text-4xl">👤</div>}</div>
    <label className="mt-4 cursor-pointer rounded-xl bg-pink-500/25 px-4 py-2 font-semibold">{saving?"Saving…":"📷 Choose profile picture"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.currentTarget.value=""}}/></label>
   </div>
   <div className="mt-6 space-y-2 text-sm"><div className="rounded-xl bg-black/20 p-3"><span className="text-white/40">Name</span><div>{name||"Not set"}</div></div><div className="rounded-xl bg-black/20 p-3"><span className="text-white/40">Email</span><div>{email}</div></div></div>
   {message&&<p className="mt-4 text-center text-sm text-white/60">{message}</p>}
  </div>
 </div></main>
}
