import PageHeader from "@/components/common/PageHeader"
import NotesClientPage from "@/components/notes/NotesClientPage"

export const dynamic = "force-dynamic"

export default function MyNotesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="📒 My Notes" backHref="/notes" />
        <NotesClientPage mode="personal" title="My Notes" />
      </div>
    </main>
  )
}
