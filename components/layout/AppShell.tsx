"use client"

import { useState } from "react"

import TopBar from "../TopBar"
import Drawer from "../drawer/Drawer"

type AppShellProps = {
  children: React.ReactNode

  title?: string

  showBack?: boolean
  backHref?: string
}

export default function AppShell({
  children,

  title = "ARiya",

  showBack = false,
  backHref = "/home",
}: AppShellProps) {

  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <TopBar
        isOpen={drawerOpen}
        onMenuClick={() =>
          setDrawerOpen(!drawerOpen)
        }

        title={title}

        showBack={showBack}
        backHref={backHref}
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