-- CreateEnum
CREATE TYPE "SystemPlaylistType" AS ENUM ('WATCH_LATER', 'LIKED_VIDEOS');

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "systemType" "SystemPlaylistType";

-- CreateIndex
CREATE INDEX "Playlist_systemType_idx" ON "Playlist"("systemType");
