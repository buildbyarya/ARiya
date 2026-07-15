"use client";

type TopBarProps = {
  isOpen: boolean;
  onMenuClick: () => void;
};

export default function TopBar({
  isOpen,
  onMenuClick,
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

        <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
          ARiya
        </h1>

        <button
          className="relative text-2xl transition hover:scale-110"
          aria-label="Notifications"
        >
          🔔

          <span className="absolute -right-1 top-0 h-2.5 w-2.5 rounded-full bg-red-500"></span>

        </button>

      </div>
    </header>
  );
}