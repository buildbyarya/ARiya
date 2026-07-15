"use client"

import WatchRoom from "../rooms/WatchRoom"
import MusicRoom from "../rooms/MusicRoom"
import ChatRoom from "../rooms/ChatRoom"
import NotesRoom from "../rooms/NotesRoom"

export default function RoomGrid() {
  return (
    <div
      className="
      mt-8
      grid
      grid-cols-2
      gap-4
      "
    >
      <WatchRoom />

      <MusicRoom />

      <ChatRoom />

      <NotesRoom />
    </div>
  )
}