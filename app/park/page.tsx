export default function ParkPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">

      <h1 className="text-4xl font-bold">
        Welcome to ARiya Park 🌳
      </h1>

      <p className="mt-4">
        Create your home or join your partner's home.
      </p>

      <div className="mt-8 flex gap-4">

        <button className="px-6 py-3 rounded bg-black text-white">
          Create Home
        </button>

        <button className="px-6 py-3 rounded border">
          Join Home
        </button>

      </div>

    </main>
  )
}