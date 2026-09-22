import {NextResponse} from "next/server"
import {getServerSession} from "next-auth"
import {authOptions} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
import {getUserHome} from "@/lib/home"

type VideoMeta={title:string;thumbnail:string;channel:string}

async function getContext(){
 const session=await getServerSession(authOptions);const email=session?.user?.email;if(!email)return null
 const user=await prisma.user.findUnique({where:{email}});if(!user)return null
 const home=await getUserHome(user.id);return home?{user,home}:null
}
function normalizeType(value:unknown){if(value==="liked"||value==="LIKED")return "LIKED" as const;if(value==="watch_later"||value==="WATCH_LATER")return "WATCH_LATER" as const;return null}

async function fetchVideoMeta(ids:string[]):Promise<Record<string,VideoMeta>>{
 const unique=[...new Set(ids.filter(Boolean))].slice(0,50),result:Record<string,VideoMeta>={}
 if(!unique.length)return result
 const key=process.env.YOUTUBE_API_KEY||process.env.GOOGLE_API_KEY
 if(key)try{
  const r=await fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+encodeURIComponent(unique.join(","))+"&key="+encodeURIComponent(key),{cache:"no-store"})
  if(r.ok){const d=await r.json();for(const item of d.items||[]){const s=item.snippet||{};result[item.id]={title:String(s.title||"YouTube video"),thumbnail:String(s.thumbnails?.high?.url||s.thumbnails?.medium?.url||s.thumbnails?.default?.url||""),channel:String(s.channelTitle||"")}}}
 }catch{}
 await Promise.all(unique.filter(id=>!result[id]).map(async id=>{
  try{const r=await fetch("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v="+encodeURIComponent(id)+"&format=json",{cache:"no-store"});if(r.ok){const d=await r.json();result[id]={title:String(d?.title||"YouTube video"),thumbnail:String(d?.thumbnail_url||"https://i.ytimg.com/vi/"+id+"/hqdefault.jpg"),channel:String(d?.author_name||"")};return}}catch{}
  result[id]={title:"YouTube video",thumbnail:"https://i.ytimg.com/vi/"+id+"/hqdefault.jpg",channel:""}
 }))
 return result
}

export async function GET(){
 const context=await getContext();if(!context)return NextResponse.json({error:"Unauthorized"},{status:401})
 const videos=await prisma.libraryVideo.findMany({where:{homeId:context.home.id,type:{in:["LIKED","WATCH_LATER"]}},orderBy:{createdAt:"desc"}})
 const meta=await fetchVideoMeta(videos.filter(v=>!v.title||!v.thumbnail||!v.channel).map(v=>v.videoId))
 for(const v of videos){const m=meta[v.videoId];if(m&&(!v.title||!v.thumbnail||!v.channel))await prisma.libraryVideo.update({where:{id:v.id},data:{title:v.title||m.title,thumbnail:v.thumbnail||m.thumbnail,channel:v.channel||m.channel}})}
 return NextResponse.json(videos.map(v=>{const m=meta[v.videoId];return {...v,title:v.title||m?.title||"YouTube video",thumbnail:v.thumbnail||m?.thumbnail||"https://i.ytimg.com/vi/"+v.videoId+"/hqdefault.jpg",channel:v.channel||m?.channel||""}}))
}

export async function POST(request:Request){
 const context=await getContext();if(!context)return NextResponse.json({error:"Unauthorized"},{status:401})
 const body=await request.json(),videoId=String(body?.videoId||"").trim(),type=normalizeType(body?.type)
 if(!videoId||!type)return NextResponse.json({error:"Invalid library item"},{status:400})
 const existing=await prisma.libraryVideo.findFirst({where:{homeId:context.home.id,videoId,type}})
 const m=(await fetchVideoMeta([videoId]))[videoId]
 if(existing){
  if(!existing.title||!existing.thumbnail||!existing.channel)return NextResponse.json(await prisma.libraryVideo.update({where:{id:existing.id},data:{title:existing.title||m?.title||"YouTube video",thumbnail:existing.thumbnail||m?.thumbnail||"https://i.ytimg.com/vi/"+videoId+"/hqdefault.jpg",channel:existing.channel||m?.channel||""}}))
  return NextResponse.json(existing)
 }
 const created=await prisma.libraryVideo.create({data:{homeId:context.home.id,videoId,type,title:m?.title||"YouTube video",thumbnail:m?.thumbnail||"https://i.ytimg.com/vi/"+videoId+"/hqdefault.jpg",channel:m?.channel||""}})
 return NextResponse.json(created,{status:201})
}

export async function DELETE(request:Request){
 const context=await getContext();if(!context)return NextResponse.json({error:"Unauthorized"},{status:401})
 const body=await request.json(),videoId=String(body?.videoId||"").trim(),type=normalizeType(body?.type)
 if(!videoId||!type)return NextResponse.json({error:"Invalid library item"},{status:400})
 await prisma.libraryVideo.deleteMany({where:{homeId:context.home.id,videoId,type}})
 return NextResponse.json({ok:true})
}
