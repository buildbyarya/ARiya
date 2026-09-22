"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import TopBar from "../TopBar"
import Drawer from "../drawer/Drawer"

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
      {children}
    </>
  )
}