"use client"

import { useState } from "react"

import TopBar from "../TopBar"
import Drawer from "../drawer/Drawer"

export default function HomeShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <TopBar
        isOpen={drawerOpen}
        onMenuClick={() =>
          setDrawerOpen(!drawerOpen)
        }
      />

      <Drawer
        isOpen={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      />

      {children}
    </>
  )
}