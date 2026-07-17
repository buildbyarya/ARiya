import { NextResponse } from "next/server"


export async function GET(request: Request) {


  const { searchParams } =
    new URL(request.url)


  const query =
    searchParams.get("q")



  if (!query) {

    return NextResponse.json([])

  }



  const apiKey =
    process.env.YOUTUBE_API_KEY



  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`
  )



  const data =
    await response.json()



  const videos =
    data.items?.map((item:any)=>({

      id:item.id.videoId,

      title:item.snippet.title,

      thumbnail:
        item.snippet.thumbnails.high.url,

      channel:
        item.snippet.channelTitle,

    })) ?? []



  return NextResponse.json(videos)

}