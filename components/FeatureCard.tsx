type FeatureCardProps = {
  icon: string
  title: string
  subtitle?: string
}

export default function FeatureCard({
  icon,
  title,
  subtitle,
}: FeatureCardProps) {
  return (
    <button
      className="
      bg-white/10
      backdrop-blur-lg
      rounded-2xl
      p-5
      transition
      hover:scale-105
      hover:bg-white/20
      text-left
      shadow-lg
      "
    >
      <div className="text-4xl">
        {icon}
      </div>

      <h2 className="mt-4 text-lg font-bold">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm text-white/70">
          {subtitle}
        </p>
      )}
    </button>
  )
}