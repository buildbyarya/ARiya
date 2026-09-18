"use client"

import WatchRoom from "../rooms/WatchRoom"
import MusicRoom from "../rooms/MusicRoom"
import ChatRoom from "../rooms/ChatRoom"
import NotesRoom from "../rooms/NotesRoom"

const rooms = [
  ["watch", WatchRoom],
  ["music", MusicRoom],
  ["chat", ChatRoom],
  ["notes", NotesRoom],
] as const

export default function RoomGrid() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
      {rooms.map(([key, Room]) => (
        <Room key={key} />
      ))}
    </div>
  )
}