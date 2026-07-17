"use client"

import { useRouter } from "next/navigation"

import {
  addToQueue,
  Video,
} from "./youtubeStore"


type VideoCardProps = {
  video: Video
}


export default function VideoCard({
  video,
}: VideoCardProps) {


  const router = useRouter()



  function openVideo() {

    router.push(
  `/watch/youtube/player?id=${video.id}&title=${encodeURIComponent(video.title)}&channel=${encodeURIComponent(video.channel)}`
)

  }



  function addVideo() {

    addToQueue(video)

    alert("Added to Play Next ✅")

  }




  return (

    <div
      className="
      rounded-2xl
      bg-white/10
      overflow-hidden
      border
      border-white/10
      "
    >


      <button
        onClick={openVideo}
        className="w-full text-left"
      >

        <img
          src={video.thumbnail}
          alt={video.title}
          className="
          w-full
          aspect-video
          object-cover
          "
        />


        <div className="p-4">


          <h2
            className="
            font-semibold
            text-white
            "
          >
            {video.title}
          </h2>


          <p
            className="
            text-sm
            text-white/60
            mt-2
            "
          >
            {video.channel}
          </p>


        </div>


      </button>



      <button

        onClick={addVideo}

        className="
        w-full
        border-t
        border-white/10
        py-3
        text-white
        hover:bg-white/10
        "

      >

        ➕ Add to Play Next


      </button>


    </div>

  )

}