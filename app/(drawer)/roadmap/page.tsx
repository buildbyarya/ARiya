export default function RoadmapPage() {
  const ideas = [
    { emoji: "🐾", title: "Shared Pets", description: "Raise and care for a little companion together." },
    { emoji: "🎨", title: "Dual Drawing", description: "Draw together on the same canvas in real time." },
    { emoji: "📅", title: "Shared Calendar", description: "Plan dates, birthdays, anniversaries, and reminders together." },
    { emoji: "🎮", title: "Games", description: "More small games for two, from chess to quick party games." },
    { emoji: "🖼️", title: "Home Customization", description: "Themes, wallpapers, decorations, and more ways to make your Home yours." },
    { emoji: "✨", title: "And More", description: "New shared experiences will be added as Satella grows." },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-fuchsia-950/40 to-violet-950/50 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="text-5xl">🗺️</div>
          <h1 className="mt-4 text-4xl font-black">Satella Roadmap</h1>
          <p className="mt-3 text-white/60">
            See what Satella is building next.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ideas.map((idea) => (
            <section
              key={idea.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl"
            >
              <div className="text-3xl">{idea.emoji}</div>
              <h2 className="mt-3 text-xl font-bold">{idea.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{idea.description}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
