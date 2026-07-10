import { prisma } from "@/lib/prisma"


export async function getUserHome(userId: string) {
  const membership = await prisma.homeMember.findUnique({
    where: {
      userId,
    },
    include: {
      home: {
        include: {
          members: true,
        },
      },
    },
  })

  return membership?.home ?? null
}