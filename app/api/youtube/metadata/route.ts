import { NextResponse } from "next/server"

type VideoMeta = {
  title: string
  thumbnail: string
  channel: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const ids = Array.isArray(body?.videoIds)
      ? body.videoIds.map((id: unknown) => String(id || "").trim()).filter(Boolean)
      : []

    const uniqueIds = [...new Set(ids)].slice(0, 100)

    const entries = await Promise.all(
      uniqueIds.map(async videoId => {
        try {
          const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`,
            { cache: "no-store" }
          )

          if (!response.ok) return null

          const data = await response.json()
          return [
            videoId,
            {
              title: String(data?.title || ""),
              thumbnail: String(data?.thumbnail_url || ""),
              channel: String(data?.author_name || ""),
            } satisfies VideoMeta,
          ] as const
        } catch {
          return null
        }
      })
    )

    const videos: Record<string, VideoMeta> = {}
    for (const entry of entries) {
      if (entry) videos[entry[0]] = entry[1]
    }

    return NextResponse.json({ videos })
  } catch {
    return NextResponse.json({ videos: {} }, { status: 400 })
  }
}
