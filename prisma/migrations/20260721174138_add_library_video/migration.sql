-- CreateTable
CREATE TABLE "LibraryVideo" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LibraryVideo_homeId_idx" ON "LibraryVideo"("homeId");

-- CreateIndex
CREATE INDEX "LibraryVideo_type_idx" ON "LibraryVideo"("type");

-- AddForeignKey
ALTER TABLE "LibraryVideo" ADD CONSTRAINT "LibraryVideo_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
