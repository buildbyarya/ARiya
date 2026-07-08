import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">
        Welcome to ARiya 🚀
      </h1>

      <p className="mt-4">
        Logged in as {session.user?.email}
      </p>
    </main>
  )
}