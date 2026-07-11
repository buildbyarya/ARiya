"use client"

import { useSearchParams } from "next/navigation"


export default function WaitingPage() {


  const searchParams = useSearchParams()

  const code = searchParams.get("code")



  return (

    <main
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/construction.gif')",
      }}
    >


      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>




      {/* Content */}
      <div className="relative z-10 text-white text-center">



        <h1 className="text-5xl font-bold">

          🏗️ Building Home

        </h1>




        <p className="mt-6 text-xl">

          🛠️👷 Building your ARiya home 🚜🚧

        </p>





        <div className="mt-8 p-6 bg-white/90 backdrop-blur rounded-xl shadow">


          <p className="text-gray-700">

            Share this code with your partner

          </p>



          <h2 className="text-4xl font-bold mt-3 text-black">

            {code}

          </h2>


        </div>





        <p className="mt-8 text-white text-lg">

          Waiting for your partner to join ❤️

        </p>




      </div>



    </main>

  )

}