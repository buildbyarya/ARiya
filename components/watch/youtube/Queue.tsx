"use client"

import { useEffect, useState } from "react"

import {
  getQueue,
  removeFromQueue,
  Video,
} from "./youtubeStore"



export default function Queue() {


  const [videos, setVideos] =
    useState<Video[]>([])



  function refreshQueue() {

    setVideos(
      getQueue()
    )

  }



  function remove(videoId:string) {

    removeFromQueue(videoId)

    refreshQueue()

  }



  useEffect(()=>{

    refreshQueue()

  },[])



  if(videos.length === 0){

    return null

  }



  return (

    <div
      className="
      mt-6
      rounded-2xl
      bg-white/10
      border
      border-white/10
      p-4
      "
    >


      <h2
        className="
        text-white
        font-bold
        mb-4
        "
      >
        ▶ Play Next
      </h2>



      <div
        className="
        space-y-3
        "
      >


        {
          videos.map((video)=>(

            <div
              key={video.id}
              className="
              flex
              gap-3
              items-center
              "
            >


              <img

                src={video.thumbnail}

                className="
                w-20
                rounded-lg
                "

              />



              <div
                className="
                flex-1
                "
              >

                <p
                  className="
                  text-white
                  text-sm
                  "
                >
                  {video.title}
                </p>


              </div>



              <button

                onClick={()=>
                  remove(video.id)
                }

                className="
                text-red-400
                "

              >

                ✕


              </button>


            </div>

          ))
        }


      </div>


    </div>

  )

}