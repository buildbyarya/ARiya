export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">
          ARiya 💙
        </h1>

        <p className="text-gray-400 text-lg">
          Arya + Riya Space
        </p>

        <div className="grid gap-4 w-72 mx-auto">

          <button className="bg-white text-black rounded-xl py-3 font-semibold">
            🎬 Watch Together
          </button>

          <button className="bg-white text-black rounded-xl py-3 font-semibold">
            🎵 Listen Together
          </button>

          <button className="bg-white text-black rounded-xl py-3 font-semibold">
            💬 Chat
          </button>

          <button className="bg-white text-black rounded-xl py-3 font-semibold">
            🔔 Actions
          </button>

        </div>

      </div>
    </main>
  );
}