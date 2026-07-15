"use client"

import Link from "next/link"


export default function DrawerProfile() {

  return (
    <Link
      href="/profile"
      className="
      block
      mb-8
      rounded-2xl
      p-3
      transition
      active:scale-95
      hover:bg-white/10
      "
    >

      <div className="text-2xl">
        👤
      </div>


      <h2 className="mt-2 text-xl font-bold">
        Boxer
      </h2>


      <p className="text-sm text-white/60">
        Tap to view profile
      </p>


    </Link>
  )
}