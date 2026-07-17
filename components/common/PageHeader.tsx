"use client"

import { useRouter } from "next/navigation"


type PageHeaderProps = {
  title: string
  backHref?: string
}


export default function PageHeader({
  title,
  backHref,
}: PageHeaderProps) {


  const router = useRouter()



  function goBack(){

    if(backHref){

      router.push(backHref)

    } else {

      router.back()

    }

  }



  return (

    <header
      className="
      sticky
      top-0
      z-50
      backdrop-blur-md
      bg-black/30
      border-b
      border-white/10
      "
    >

      <div
        className="
        mx-auto
        flex
        h-16
        items-center
        justify-between
        px-4
        "
      >


        <button

          onClick={goBack}

          onContextMenu={(e)=>{
            e.preventDefault()
          }}

          className="
          text-2xl
          text-white
          hover:scale-110
          active:scale-95
          "

        >

          ←

        </button>



        <h1
          className="
          text-lg
          font-bold
          "
        >

          {title}

        </h1>



        <div className="w-8"/>


      </div>


    </header>

  )

}