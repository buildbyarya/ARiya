-- Repair migration for production databases where the Watch Together migration
-- was recorded but one or more Watch Together tables were not created.
ALTER TABLE "NoteBook" ADD COLUMN IF NOT EXISTS "backgroundImage" TEXT;

CREATE TABLE IF NOT EXISTS "WatchRoom" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "playing" BOOLEAN NOT NULL DEFAULT false,
  "volume" INTEGER NOT NULL DEFAULT 100,
  "playbackRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "version" INTEGER NOT NULL DEFAULT 0,
  "lastActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WatchRoom_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WatchRoom_homeId_idx" ON "WatchRoom"("homeId");
DO $$ BEGIN
  ALTER TABLE "WatchRoom" ADD CONSTRAINT "WatchRoom_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "WatchRoomMember" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  CONSTRAINT "WatchRoomMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WatchRoomMember_roomId_userId_key" ON "WatchRoomMember"("roomId","userId");
CREATE INDEX IF NOT EXISTS "WatchRoomMember_userId_idx" ON "WatchRoomMember"("userId");
DO $$ BEGIN
  ALTER TABLE "WatchRoomMember" ADD CONSTRAINT "WatchRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "WatchRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WatchRoomMember" ADD CONSTRAINT "WatchRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "WatchInvite" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "customMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP(3),
  CONSTRAINT "WatchInvite_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WatchInvite_recipientId_status_idx" ON "WatchInvite"("recipientId","status");
CREATE INDEX IF NOT EXISTS "WatchInvite_expiresAt_idx" ON "WatchInvite"("expiresAt");
DO $$ BEGIN
  ALTER TABLE "WatchInvite" ADD CONSTRAINT "WatchInvite_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WatchInvite" ADD CONSTRAINT "WatchInvite_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "WatchRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WatchInvite" ADD CONSTRAINT "WatchInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WatchInvite" ADD CONSTRAINT "WatchInvite_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "WatchSetting" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiryMinutes" INTEGER NOT NULL DEFAULT 10,
  CONSTRAINT "WatchSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WatchSetting_userId_key" ON "WatchSetting"("userId");
DO $$ BEGIN
  ALTER TABLE "WatchSetting" ADD CONSTRAINT "WatchSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
