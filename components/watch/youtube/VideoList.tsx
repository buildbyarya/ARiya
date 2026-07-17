import VideoCard from "./VideoCard"


type Video = {
  id: string
  title: string
  thumbnail: string
  channel: string
}


type VideoListProps = {
  videos: Video[]
}


export default function VideoList({
  videos,
}: VideoListProps) {


  if (videos.length === 0) {
    return (
      <div
        className="
        mt-10
        text-center
        text-white/60
        "
      >
        No videos found.
      </div>
    )
  }


  return (
    <div
      className="
      mt-6
      grid
      gap-5
      "
    >

      {videos.map((video) => (

        <VideoCard
  key={`${video.id}-${video.title}`}
  video={video}
/>

      ))}

    </div>
  )
}