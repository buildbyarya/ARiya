import "server-only"

import { LibraryVideoType } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export type LibraryVideoInput = {
  homeId: string
  videoId: string
  type: LibraryVideoType
}

/**
 * Adds a video ID to a Home's library. YouTube metadata is intentionally not
 * stored: title, channel, and thumbnail are resolved live when displayed.
 */
export async function addVideoToLibrary(video: LibraryVideoInput) {
  return prisma.libraryVideo.upsert({
    where: {
      homeId_videoId_type: {
        homeId: video.homeId,
        videoId: video.videoId,
        type: video.type,
      },
    },
    create: video,
    update: {},
  })
}

export async function getLibrary(
  homeId: string,
  type?: LibraryVideoType
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

/**
 * The Home ID is required to prevent one Home from deleting another Home's
 * saved video when given a guessed or stale record ID.
 */
export async function removeVideo(id: string, homeId: string) {
  const result = await prisma.libraryVideo.deleteMany({
    where: {
      id,
      homeId,
    },
  })

  return result.count === 1
}
