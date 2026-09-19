import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim()

  if (!query) return NextResponse.json([])

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "unavailable", message: "YouTube search is not configured." },
      { status: 503 }
    )
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`,
    { cache: "no-store" }
  )

  const data = await response.json()

  if (!response.ok) {
    const reason = data?.error?.errors?.[0]?.reason
    if (
      reason === "quotaExceeded" ||
      reason === "dailyLimitExceeded" ||
      reason === "rateLimitExceeded"
    ) {
      return NextResponse.json({ error: "quota" }, { status: 429 })
    }

    return NextResponse.json(
      { error: "unavailable", message: "YouTube search is temporarily unavailable." },
      { status: 502 }
    )
  }

  const videos =
    data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.default?.url,
      channel: item.snippet.channelTitle,
    })) ?? []

  return NextResponse.json(videos)
}
