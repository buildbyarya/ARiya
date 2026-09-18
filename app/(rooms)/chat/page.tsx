import Link from "next/link"
import PageHeader from "@/components/common/PageHeader"

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="mx-auto max-w-md">
        <PageHeader title="💬 Chat" backHref="/home" />
        <div className="grid gap-4">
          <Link
            href="/chat/messages"
            className="rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/20 active:scale-95"
          >
            💬 Messages
          </Link>
        </div>
      </div>
    </main>
  )
}