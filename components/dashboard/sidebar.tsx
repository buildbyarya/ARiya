import Link from "next/link"

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r p-6">

      <h1 className="text-2xl font-bold mb-8">
        🚀 ARiya
      </h1>

      <nav className="space-y-4">

        <Link
          href="/dashboard"
          className="block hover:text-blue-600"
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/dashboard/projects"
          className="block hover:text-blue-600"
        >
          📁 Projects
        </Link>

        <Link
          href="/dashboard/billing"
          className="block hover:text-blue-600"
        >
          💳 Billing
        </Link>

        <Link
          href="/settings"
          className="block hover:text-blue-600"
        >
          ⚙ Settings
        </Link>

      </nav>

    </aside>
  )
}