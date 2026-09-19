CREATE TABLE "NoteBook" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "checkboxMode" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteBook_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuickNote" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NoteBook_homeId_ownerId_type_key" ON "NoteBook"("homeId", "ownerId", "type");
CREATE INDEX "NoteBook_homeId_type_idx" ON "NoteBook"("homeId", "type");
CREATE UNIQUE INDEX "QuickNote_homeId_senderId_key" ON "QuickNote"("homeId", "senderId");
CREATE INDEX "QuickNote_recipientId_idx" ON "QuickNote"("recipientId");

ALTER TABLE "NoteBook" ADD CONSTRAINT "NoteBook_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteBook" ADD CONSTRAINT "NoteBook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuickNote" ADD CONSTRAINT "QuickNote_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuickNote" ADD CONSTRAINT "QuickNote_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuickNote" ADD CONSTRAINT "QuickNote_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
