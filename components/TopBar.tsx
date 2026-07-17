"use client";

import Link from "next/link";

type TopBarProps = {
  isOpen?: boolean;
  onMenuClick?: () => void;

  title?: string;

  showBack?: boolean;
  backHref?: string;
};

export default function TopBar({
  isOpen = false,
  onMenuClick,
  title = "ARiya",
  showBack = false,
  backHref = "/home",
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="mx-auto flex h-16 items-center justify-between px-4">

        <button
          onClick={onMenuClick}
          className="text-3xl text-white transition hover:scale-110"
          aria-label="Open menu"
        >
          {isOpen ? "✕" : "≡"}
        </button>

        <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </h1>

        <div className="flex items-center gap-4">

          {showBack && (
            <Link
              href={backHref}
              className="text-2xl transition hover:scale-110 active:scale-95"
              aria-label="Back"
            >
              ←
            </Link>
          )}

          <button
            className="relative text-2xl transition hover:scale-110"
            aria-label="Notifications"
          >
            🔔

            <span className="absolute -right-1 top-0 h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </button>

        </div>

      </div>
    </header>
  );
}