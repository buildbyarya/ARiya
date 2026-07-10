import Sidebar from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">

      <Sidebar />

      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  )
}