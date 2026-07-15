"use client"

import DrawerProfile from "./Profile/DrawerProfile"
import DrawerMenu from "./Menu/DrawerMenu"


type DrawerProps = {
  isOpen: boolean
  onClose: () => void
}


export default function Drawer({
  isOpen,
  onClose,
}: DrawerProps) {

  return (
    <>
      {/* Blur background */}
      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-40
          transition-opacity
          duration-500
          ${
            isOpen
              ? "bg-black/40 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0 pointer-events-none"
          }
        `}
      />


      {/* Drawer */}
      <div
        className={`
          fixed
          top-0
          left-0
          h-screen
          w-[75%]
          max-w-sm
          bg-zinc-900
          shadow-2xl
          p-6
          z-50
          transform
          transition-transform
          duration-500
          ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        <DrawerProfile />


        <DrawerMenu />


      </div>
    </>
  )
}