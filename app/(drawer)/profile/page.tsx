export default function ProfilePage() {
  return (
    <main
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-purple-950
      via-black
      to-pink-950
      px-6
      "
    >

      <div
        className="
        w-full
        max-w-md
        bg-white/10
        backdrop-blur-lg
        rounded-3xl
        p-8
        text-center
        shadow-xl
        "
      >

        <div className="text-6xl">
          👤
        </div>


        <h1
          className="
          mt-4
          text-3xl
          font-bold
          "
        >
          Boxer
        </h1>


        <p
          className="
          mt-2
          text-white/70
          "
        >
          Your profile
        </p>


        <div
          className="
          mt-8
          flex
          flex-col
          gap-3
          "
        >

          <button
            className="
            rounded-xl
            bg-white/10
            py-3
            "
          >
            Change Profile Picture
          </button>


          <button
            className="
            rounded-xl
            bg-white/10
            py-3
            "
          >
            Change Nickname
          </button>


          <button
            className="
            rounded-xl
            bg-white/10
            py-3
            "
          >
            Account Settings
          </button>

        </div>

      </div>

    </main>
  )
}