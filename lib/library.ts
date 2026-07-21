import { prisma } from "@/lib/prisma"



export async function addVideoToLibrary({

  homeId,

  videoId,

  title,

  thumbnail,

  channel,

  type,

}: {

  homeId: string

  videoId: string

  title: string

  thumbnail: string

  channel: string

  type: string

}) {

  return prisma.libraryVideo.create({

    data: {

      homeId,

      videoId,

      title,

      thumbnail,

      channel,

      type,

    },

  })

}



export async function getLibrary(

  homeId: string,

  type?: string

) {

  return prisma.libraryVideo.findMany({

    where: {

      homeId,

      ...(type ? { type } : {}),

    },

    orderBy: {

      createdAt: "desc",

    },

  })

}



export async function removeVideo(

  id: string

) {

  return prisma.libraryVideo.delete({

    where: {

      id,

    },

  })

}