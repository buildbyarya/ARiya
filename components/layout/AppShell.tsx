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
            className="fixed bottom-28 left-3 z-[100] rounded-2xl border border-white/10 bg-black/75 px-3 py-2.5 text-xl text-white shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-4 sm:px-4 sm:py-3 sm:text-2xl"
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
          >
            {drawerOpen ? "✕" : "≡"}
          </button>
          <div className="fixed bottom-28 right-3 z-[100] rounded-2xl border border-white/10 bg-black/75 p-1.5 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:right-4 sm:p-2">
            <NotificationsBell />
          </div>
          <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
      )}
      {children}
    </>
  )
}