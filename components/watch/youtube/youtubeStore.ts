export type Video = {
  id: string
  title: string
  thumbnail: string
  channel: string
}


let queue: Video[] = []


export function addToQueue(video: Video) {

  queue.push(video)

}


export function getQueue() {

  return queue

}


export function removeFromQueue(videoId: string) {

  queue =
    queue.filter(
      (video) => video.id !== videoId
    )

}


export function clearQueue() {

  queue = []

}