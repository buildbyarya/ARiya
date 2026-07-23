import { NextRequest, NextResponse } from "next/server"

const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

export async function GET(request: NextRequest) {
  const requestedIds = request.nextUrl.searchParams.get("ids")
  const ids = Array.from(
    new Set(
      (requestedIds ?? "")
        .split(",")
        .filter((id) => YOUTUBE_VIDEO_ID.test(id))
    )
  ).slice(0, 50)

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "At least one valid YouTube video ID is required" },
      { status: 400 }
    )
  }

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube is not configured" },
      { status: 500 }
    )
  }

  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/videos?part=snippet" +
      `&id=${ids.join(",")}&key=${apiKey}`,
    { cache: "no-store" }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to load YouTube video details" },
      { status: 502 }
    )
  }

  const data = await response.json()
  const videos = (data.items ?? []).map((item: {
    id: string
    snippet: {
      title: string
      channelTitle: string
      thumbnails: {
        high?: { url: string }
        medium?: { url: string }
        default?: { url: string }
      }
    }
  }) => ({
    id: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
  }))

  return NextResponse.json(videos)
}
