import PageHeader from "@/components/common/PageHeader"

export default function GamesPage() {
  return (
    <main
      className="
      min-h-screen
      bg-gradient-to-br
      from-purple-950
      via-black
      to-pink-950
      p-6
      "
    >
      <div className="mx-auto max-w-md">

        <PageHeader
          title="🎮 Games"
          backHref="/home"
        />

        <div className="grid gap-4">

          <button
            className="
            rounded-2xl
            bg-white/10
            p-5
            text-left
            "
          >
            🎲 Mini Games
          </button>

        </div>

      </div>
    </main>
  )
}