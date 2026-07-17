import PageHeader from "@/components/common/PageHeader"

export default function NotesPage() {
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
  title="📝 Notes Room"
  backHref="/home"
/>

        <div className="grid gap-4">

          <button className="rounded-2xl bg-white/10 p-5 text-left">
            📒 My Notes
          </button>

          <button className="rounded-2xl bg-white/10 p-5 text-left">
            📒 Riya's Notes
          </button>

          <button className="rounded-2xl bg-white/10 p-5 text-left">
            🤝 Shared Notes
          </button>

          <button className="rounded-2xl bg-white/10 p-5 text-left">
            ⚡ Quick Note
          </button>

        </div>

      </div>
    </main>
  )
}