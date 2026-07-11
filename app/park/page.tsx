"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"


export default function ParkPage() {


  const router = useRouter()


  const [loading, setLoading] = useState(false)

  const [joinCode, setJoinCode] = useState("")

  const [message, setMessage] = useState("")



  async function createHome() {

    setLoading(true)


    const res = await fetch(
      "/api/home/create",
      {
        method: "POST",
      }
    )


    const data = await res.json()


    if (data.inviteCode) {

      router.push(
        `/waiting?code=${data.inviteCode}`
      )

    }
    else {

      setMessage(data.error)

    }


    setLoading(false)

  }





  async function joinHome() {


    setLoading(true)


    const res = await fetch(
      "/api/home/join",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          code: joinCode,

        }),

      }
    )



    const data = await res.json()



    if (data.success) {


      router.push("/home")


    }
    else {


      setMessage(data.error)


    }


    setLoading(false)

  }




  return (

  <main
    className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
    style={{
      backgroundImage: "url('/park.gif')",
    }}
  >


    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>



    {/* Everything goes inside this */}
    <div className="relative z-10 text-pink text-center">


      <h1
  className="
    text-5xl
    font-bold
    bg-gradient-to-r
    from-red-400
    to-purple-400
    bg-[length:200%_200%]
    bg-clip-text
    text-transparent
    animate-gradient
    drop-shadow-lg
  "
>
 ARiya Home
</h1>



      <div className="mt-6 relative w-80 h-64 flex items-center justify-center">

  <img
    src="/home.gif"
    alt="ARiya Home"
    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
  />


  {/* Text above GIF */}
 <div className="relative z-10 text-center">

 <p
  className="
    text-3xl
    font-bold
    bg-gradient-to-r
    from-pink-400
    via-green-400
    via-blue-400
    to-pink-400
    bg-[length:200%_200%]
    bg-clip-text
    text-transparent
    animate-gradient
    drop-shadow-lg
  "
>
  Get a Home,
  <br />
  Stay together ❤️
</p>

</div>


</div>
      <div className="mt-10 flex flex-col gap-6 w-80">



        <button

          onClick={createHome}

          className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:scale-105 transition"

        >

          {
            loading
            ? "Please wait..."
            : "Create Home"
          }


        </button>






        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">


          <input

            value={joinCode}

            onChange={(e)=>setJoinCode(e.target.value)}

            placeholder="Enter AR-XXXXXX"

            
  className="
    text-3xl
    font-bold
    bg-gradient-to-r
    from-pink-400
    via-green-400
    via-blue-400
    to-pink-400
    bg-[length:200%_200%]
    bg-clip-text
    text-transparent
    animate-gradient
    drop-shadow-lg

            w-full
            px-4
            py-3
            rounded-xl
            outline-none
            "
          />



          <button

            onClick={joinHome}

            className="
            mt-3
            w-full
            px-6
            py-3
            rounded-xl
            bg-white
            text-black
            font-semibold
            hover:scale-105
            transition
            "

          >

            ❤️ Join Home


          </button>



        </div>


      </div>





      {
        message &&

        <p className="mt-6 text-red-300 font-semibold">

          {message}

        </p>

      }



    </div>



  </main>

)
}