import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getUserHome } from "@/lib/home"


export default async function HomePage() {


  const session =
    await getServerSession(authOptions)



  if (!session?.user?.email) {

    redirect("/login")

  }



  const user =
    await prisma.user.findUnique({

      where:{
        email: session.user.email
      }

    })



  if(!user){

    redirect("/login")

  }



  const home =
    await getUserHome(user.id)



  if(!home){

    redirect("/park")

  }



  return (

    <main
      className="
      min-h-screen
      flex
      flex-col
      items-center
      justify-center
      bg-gradient-to-br
      from-purple-950
      via-black
      to-pink-950
      px-6
      "
    >


      <div
        className="
        w-full
        max-w-md
        bg-white/10
        backdrop-blur-lg
        rounded-3xl
        p-8
        shadow-xl
        "
      >


        <h1
          className="
          text-4xl
          font-bold
          text-center
          bg-gradient-to-r
          from-pink-400
          to-purple-400
          bg-clip-text
          text-transparent
          "
        >

          🏠 {home.name}

        </h1>



        <p
          className="
          text-center
          mt-4
          text-white/80
          "
        >

          Welcome, {user.nickname ?? "User"} ✨

        </p>





        <div className="mt-8">


          <h2
            className="
            text-xl
            font-semibold
            mb-4
            "
          >

            Members

          </h2>



          <div className="flex flex-col gap-3">


            {
              home.members.map((member)=>(

                <div

                  key={member.id}

                  className="
                  bg-white/10
                  rounded-xl
                  px-5
                  py-3
                  "

                >

                  👤 {member.nickname ?? "Unknown"}

                </div>

              ))
            }


          </div>


        </div>






        <div
          className="
          mt-8
          grid
          gap-3
          "
        >


          <button
            className="
            bg-white/20
            rounded-xl
            py-3
            hover:scale-105
            transition
            "
          >
            🎬 Watch Together
          </button>



          <button
            className="
            bg-white/20
            rounded-xl
            py-3
            hover:scale-105
            transition
            "
          >
            🎵 Listen Together
          </button>



          <button
            className="
            bg-white/20
            rounded-xl
            py-3
            hover:scale-105
            transition
            "
          >
            💬 Chat
          </button>



          <button
            className="
            bg-white/20
            rounded-xl
            py-3
            hover:scale-105
            transition
            "
          >
            🔔 Activity
          </button>



        </div>



      </div>


    </main>

  )

}