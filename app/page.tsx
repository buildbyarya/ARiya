import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"


export default async function EntryPage() {

  const session = await getServerSession(authOptions)


  // Not logged in
  if (!session?.user?.email) {
    redirect("/login")
  }


  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })


  if (!user) {
    redirect("/login")
  }


  const membership = await prisma.homeMember.findUnique({
    where: {
      userId: user.id,
    },
  })


  // Already belongs to a home
  if (membership) {
    redirect("/home")
  }


  // No home yet
  redirect("/park")
}