"use client"
import {useEffect,useRef,useState} from "react"
import type { PointerEvent } from "react"
import type { PointerEvent } from "react"
import PageHeader from "@/components/common/PageHeader"

type Game={status:string;startedAt:string|null;phaseEndsAt:string|null;drawingA:string|null;drawingB:string|null;round:number;durationSec:number;swapSec:number}

export default function DrawingSwapPage(){
 const [game,setGame]=useState<Game|null>(null),[side,setSide]=useState<"A"|"B">("A"),[members,setMembers]=useState(0),[remaining,setRemaining]=useState(0),[busy,setBusy]=useState(false)
 const canvas=useRef<HTMLCanvasElement>(null),loadedKey=useRef(""),drawing=useRef(false)
 const [color,setColor]=useState("#ffffff"),[size,setSize]=useState(5)
 async function load(){const r=await fetch("/api/games/drawing-swap",{cache:"no-store"});if(!r.ok)return;const d=await r.json();setGame(d.game);setSide(d.side);setMembers(d.members);if(d.game?.phaseEndsAt)setRemaining(Math.max(0,Math.ceil((new Date(d.game.phaseEndsAt).getTime()-Date.now())/1000)))} 
 useEffect(()=>{void load();const t=setInterval(()=>void load(),1500);return()=>clearInterval(t)},[])
 useEffect(()=>{const t=setInterval(()=>{if(game?.phaseEndsAt)setRemaining(Math.max(0,Math.ceil((new Date(game.phaseEndsAt).getTime()-Date.now())/1000)))},250);return()=>clearInterval(t)},[game?.phaseEndsAt])
 const target=game&&game.status==="RUNNING"?(game.round%2===0?side:(side==="A"?"B":"A")):side
 useEffect(()=>{if(!game||game.status!=="RUNNING")return;const key=game.round+"-"+target;if(loadedKey.current===key)return;loadedKey.current=key;const src=target==="A"?game.drawingA:game.drawingB;const c=canvas.current;if(!c)return;const ctx=c.getContext("2d");if(!ctx)return;ctx.fillStyle="#15131c";ctx.fillRect(0,0,c.width,c.height);if(src){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,c.width,c.height);img.src=src}},[game?.round,game?.drawingA,game?.drawingB,target,game?.status])
 function pos(e:PointerEvent<HTMLCanvasElement>){const c=canvas.current!;const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}}
 function down(e:PointerEvent<HTMLCanvasElement>){if(game?.status!=="RUNNING")return;drawing.current=true;e.currentTarget.setPointerCapture(e.pointerId);const p=pos(e);const ctx=canvas.current!.getContext("2d")!;ctx.beginPath();ctx.moveTo(p.x,p.y)}
 function move(e:PointerEvent<HTMLCanvasElement>){if(!drawing.current)return;const p=pos(e),ctx=canvas.current!.getContext("2d")!;ctx.lineWidth=size;ctx.lineCap="round";ctx.strokeStyle=color;ctx.lineTo(p.x,p.y);ctx.stroke()}
 function up(){drawing.current=false;void save()}
 async function save(){if(!canvas.current||game?.status!=="RUNNING")return;await fetch("/api/games/drawing-swap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save",side:target,data:canvas.current.toDataURL("image/png")})})}
 async function action(actionName:string){setBusy(true);await fetch("/api/games/drawing-swap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:actionName})});setBusy(false);void load()}
 return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-4 text-white"><div className="mx-auto max-w-3xl"><PageHeader title="🎨 Drawing Swap" backHref="/games"/>
 <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
  <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{game?.status==="REVEAL"?"✨ Reveal":game?.status==="RUNNING"?"Draw!":"Drawing Swap"}</h2><p className="text-sm text-white/45">{game?.status==="RUNNING"?"Your canvas swaps every 45 seconds. Finish the other person's idea.":"Two players · 3:45 total · 45s swaps"}</p></div><div className="text-right"><div className="text-2xl font-black">{game?.status==="RUNNING"?remaining+"s":game?.status==="REVEAL"?"Done":"—"}</div><div className="text-xs text-white/35">round {game?.round??0}</div></div></div>
  {members<2&&game?.status!=="REVEAL"&&<div className="mt-4 rounded-2xl bg-yellow-500/10 p-3 text-sm text-yellow-100">Waiting for both players to be in the shared home.</div>}
  {game?.status==="LOBBY"&&members>=2&&<button disabled={busy} onClick={()=>void action("start")} className="mt-4 w-full rounded-2xl bg-pink-500/25 py-3 font-semibold">Start 3:45 game</button>}
  {game?.status==="RUNNING"&&<><div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black"><canvas ref={canvas} width={900} height={600} className="block aspect-[3/2] w-full touch-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}/></div><div className="mt-3 flex items-center gap-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-10 w-12 rounded-lg bg-transparent"/><input type="range" min="1" max="30" value={size} onChange={e=>setSize(Number(e.target.value))} className="flex-1"/><button onClick={()=>{const ctx=canvas.current!.getContext("2d")!;ctx.fillStyle="#15131c";ctx.fillRect(0,0,canvas.current!.width,canvas.current!.height);void save()}} className="rounded-xl bg-white/10 px-3 py-2 text-sm">Clear</button></div><p className="mt-2 text-center text-xs text-white/40">You are editing drawing {target}. Changes sync as you draw.</p></>}
  {game?.status==="REVEAL"&&<div className="mt-4 grid gap-4 sm:grid-cols-2">{[["A",game.drawingA],["B",game.drawingB]].map(([label,src])=><div key={label} className="rounded-2xl bg-black/20 p-2"><div className="mb-2 px-2 text-sm font-semibold">Drawing {label}</div>{src?<img src={src as string} className="w-full rounded-xl" alt={"Drawing "+label}/>:<div className="aspect-[3/2] rounded-xl bg-white/5"/>}</div>)}</div>}
  {game?.status==="REVEAL"&&<button disabled={busy} onClick={()=>void action("reset")} className="mt-4 w-full rounded-2xl bg-white/10 py-3">Play again</button>}
 </div></div></main>
}