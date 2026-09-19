export function extractVideoId(url: string) {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0]
      return id || null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const direct = parsed.searchParams.get("v")
      if (direct) return direct

      const parts = parsed.pathname.split("/").filter(Boolean)
      if (parts[0] === "shorts" || parts[0] === "embed") {
        return parts[1] || null
      }
    }

    return null
  } catch {
    return null
  }
}
