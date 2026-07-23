-- CreateEnum
CREATE TYPE "PlaylistType" AS ENUM ('SYSTEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PlaylistVisibility" AS ENUM ('PERSONAL', 'SHARED');

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlaylistType" NOT NULL,
    "visibility" "PlaylistVisibility" NOT NULL,
    "homeId" TEXT,
    "homeMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistVideo" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Playlist_homeId_idx" ON "Playlist"("homeId");

-- CreateIndex
CREATE INDEX "Playlist_homeMemberId_idx" ON "Playlist"("homeMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistVideo_playlistId_youtubeVideoId_key" ON "PlaylistVideo"("playlistId", "youtubeVideoId");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_homeMemberId_fkey" FOREIGN KEY ("homeMemberId") REFERENCES "HomeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistVideo" ADD CONSTRAINT "PlaylistVideo_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
