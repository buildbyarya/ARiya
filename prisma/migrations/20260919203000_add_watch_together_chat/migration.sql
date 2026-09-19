CREATE TABLE IF NOT EXISTS "WatchChatMessage" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderNickname" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WatchChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WatchChatMessage_roomId_createdAt_idx"
ON "WatchChatMessage"("roomId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "WatchChatMessage"
  ADD CONSTRAINT "WatchChatMessage_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "WatchRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;