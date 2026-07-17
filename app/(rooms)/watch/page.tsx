import Link from "next/link"
import PageHeader from "@/components/common/PageHeader"

export default function WatchPage() {
  return (
    <main
      className="
      min-h-screen
      bg-gradient-to-br
      from-purple-950
      via-black
      to-pink-950
      p-6
      "
    >
      <div className="mx-auto max-w-md">

        <PageHeader
  title="🎬 Watch Together"
  backHref="/home"
/>

        <div className="grid gap-4">

          <Link
  href="/watch/youtube"
  className="
  block
  rounded-2xl
  bg-white/10
  p-5
  transition
  hover:bg-white/20
  active:scale-95
  "
>
  ▶ YouTube
</Link>

        </div>

      </div>
    </main>
  )
}