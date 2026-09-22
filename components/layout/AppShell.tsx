"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import TopBar from "../TopBar"
import Drawer from "../drawer/Drawer"
import NotificationsBell from "@/components/home/NotificationsBell"

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const showSiteHeader = pathname === "/home"

  return (
    <>
      {showSiteHeader && <TopBar
        isOpen={drawerOpen}
        onMenuClick={() => setDrawerOpen((open) => !open)}
      />}
      {showSiteHeader && <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />}
      {!showSiteHeader && (
        <>
          <button
            onClick={() => setDrawerOpen((open) => !open)}
            className="fixed bottom-4 left-4 z-[100] rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-2xl text-white shadow-2xl backdrop-blur-xl"
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
          >
            {drawerOpen ? "✕" : "≡"}
          </button>
          <div className="fixed bottom-4 right-4 z-[100] rounded-2xl border border-white/10 bg-black/75 p-2 shadow-2xl backdrop-blur-xl">
            <NotificationsBell />
          </div>
          <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
      )}
      {children}
    </>
  )
}