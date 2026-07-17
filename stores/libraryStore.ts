export type Video = {
  id: string
  title: string
  thumbnail: string
  channel: string
}

type Library = {
  liked: Video[]
  watchLater: Video[]
  playlists: Record<string, Video[]>
  subscriptions: string[]
}

const library: Library = {
  liked: [],
  watchLater: [],
  playlists: {},
  subscriptions: [],
}

// ---------- Likes ----------

export function addLiked(video: Video) {
  if (
    !library.liked.some(
      (v) => v.id === video.id
    )
  ) {
    library.liked.push(video)
  }
}

export function getLiked() {
  return library.liked
}

// ---------- Watch Later ----------

export function addWatchLater(video: Video) {
  if (
    !library.watchLater.some(
      (v) => v.id === video.id
    )
  ) {
    library.watchLater.push(video)
  }
}

export function getWatchLater() {
  return library.watchLater
}

// ---------- Playlists ----------

export function createPlaylist(name: string) {
  if (!library.playlists[name]) {
    library.playlists[name] = []
  }
}

export function addToPlaylist(
  name: string,
  video: Video
) {
  createPlaylist(name)

  if (
    !library.playlists[name].some(
      (v) => v.id === video.id
    )
  ) {
    library.playlists[name].push(video)
  }
}

export function getPlaylist(name: string) {
  return library.playlists[name] || []
}

// ---------- Subscriptions ----------

export function subscribe(channel: string) {
  if (
    !library.subscriptions.includes(channel)
  ) {
    library.subscriptions.push(channel)
  }
}

export function getSubscriptions() {
  return library.subscriptions
}