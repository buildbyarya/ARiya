export function extractVideoId(value: string) {
  const input = value.trim()
  if (!input) return null

  // Also accept a bare 11-character YouTube video ID.
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input

  try {
    const parsed = new URL(input.includes("://") ? input : `https://${input}`)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const direct = parsed.searchParams.get("v")
      if (direct && /^[A-Za-z0-9_-]{11}$/.test(direct)) return direct

      const parts = parsed.pathname.split("/").filter(Boolean)
      if (["shorts", "embed", "live"].includes(parts[0] ?? "")) {
        const id = parts[1]
        return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }

    return null
  } catch {
    return null
  }
}
