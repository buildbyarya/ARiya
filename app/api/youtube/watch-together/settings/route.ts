import {getServerSession} from "next-auth"
import {NextResponse} from "next/server"
import {authOptions} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
async function user(){const s=await getServerSession(authOptions);if(!s?.user?.email)return null;return prisma.user.findUnique({where:{email:s.user.email}})}
export async function GET(){const u=await user();if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});const x=await prisma.watchSetting.upsert({where:{userId:u.id},create:{userId:u.id},update:{}});return NextResponse.json({expiryMinutes:x.expiryMinutes})}
export async function POST(req:Request){const u=await user();if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});const v=Number((await req.json())?.expiryMinutes);if(![2,5,10,15].includes(v))return NextResponse.json({error:"Invalid value"},{status:400});const x=await prisma.watchSetting.upsert({where:{userId:u.id},create:{userId:u.id,expiryMinutes:v},update:{expiryMinutes:v}});return NextResponse.json({expiryMinutes:x.expiryMinutes})}