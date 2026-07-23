/*
  Warnings:

  - You are about to drop the column `channel` on the `LibraryVideo` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `LibraryVideo` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `LibraryVideo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[homeId,videoId,type]` on the table `LibraryVideo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LibraryVideo" DROP COLUMN "channel",
DROP COLUMN "thumbnail",
DROP COLUMN "title";

-- CreateIndex
CREATE UNIQUE INDEX "LibraryVideo_homeId_videoId_type_key" ON "LibraryVideo"("homeId", "videoId", "type");
