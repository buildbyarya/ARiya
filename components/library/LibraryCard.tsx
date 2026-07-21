"use client"

import Link from "next/link"

type LibraryCardProps = {
  href: string
  emoji: string
  title: string
  subtitle: string
  thumbnails?: string[]
}

export default function LibraryCard({
  href,
  emoji,
  title,
  subtitle,
  thumbnails = [],
}: LibraryCardProps) {
  return (
    <Link
      href={href}
      className="
      block
      rounded-3xl
      border
      border-white/10
      bg-white/5
      p-4
      hover:bg-white/10
      transition
      "
    >
      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold text-white">
            {emoji} {title}
          </h2>

          <p className="text-sm text-white/60 mt-1">
            {subtitle}
          </p>

        </div>

        <span className="text-white/40 text-xl">
          →
        </span>

      </div>

      {thumbnails.length > 0 && (

        <div className="flex gap-2 mt-4">

          {thumbnails.slice(0, 3).map((thumbnail, index) => (

            <img
              key={index}
              src={thumbnail}
              alt=""
              className="
              w-20
              aspect-video
              rounded-xl
              object-cover
              "
            />

          ))}

        </div>

      )}

    </Link>
  )
}