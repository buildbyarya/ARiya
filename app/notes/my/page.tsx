import PageHeader from "@/components/common/PageHeader"

export default function MyNotesPage() {
  return <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6"><div className="mx-auto max-w-md"><PageHeader title="📒 My Notes" backHref="/notes" /><div className="mt-6 rounded-3xl bg-white/10 p-6"><p className="text-white/60">Your personal notes will appear here.</p></div></div></main>
