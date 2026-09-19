import PageHeader from "@/components/common/PageHeader"
import QuickNoteComposer from "@/components/notes/QuickNoteComposer"

export const dynamic = "force-dynamic"

export default function QuickNotesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="⚡ Quick Note" backHref="/notes" />
        <QuickNoteComposer />
      </div>
    </main>
  )
}
