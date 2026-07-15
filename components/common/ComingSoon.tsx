type ComingSoonProps = {
  emoji: string
  title: string
  description: string
}

export default function ComingSoon({
  emoji,
  title,
  description,
}: ComingSoonProps) {
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
      <div className="text-center">

        <div className="text-6xl mb-6">
          {emoji}
        </div>

        <h1 className="text-4xl font-bold">
          {title}
        </h1>

        <p className="mt-4 text-white/70">
          {description}
        </p>

      </div>
    </main>
  )
}