-- Chat media/style/profile/watch reply improvements
ALTER TYPE "ChatMessageKind" ADD VALUE IF NOT EXISTS 'VIDEO';

ALTER TABLE "ChatMessage"
  ADD COLUMN IF NOT EXISTS "fontSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "textColor" TEXT,
  ADD COLUMN IF NOT EXISTS "fontFamily" TEXT,
  ADD COLUMN IF NOT EXISTS "bubbleColor" TEXT;

ALTER TABLE "ChatSetting"
  ADD COLUMN IF NOT EXISTS "backgroundImage" TEXT;

CREATE TABLE IF NOT EXISTS "ChatPreference" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fontSize" INTEGER NOT NULL DEFAULT 16,
  "textColor" TEXT NOT NULL DEFAULT '#ffffff',
  "fontFamily" TEXT NOT NULL DEFAULT 'system-ui',
  "bubbleColor" TEXT NOT NULL DEFAULT '#7c3aed',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChatPreference_userId_key" ON "ChatPreference"("userId");
CREATE INDEX IF NOT EXISTS "ChatPreference_homeId_idx" ON "ChatPreference"("homeId");

ALTER TABLE "ChatPreference"
  DROP CONSTRAINT IF EXISTS "ChatPreference_homeId_fkey";
ALTER TABLE "ChatPreference"
  ADD CONSTRAINT "ChatPreference_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatPreference"
  DROP CONSTRAINT IF EXISTS "ChatPreference_userId_fkey";
ALTER TABLE "ChatPreference"
  ADD CONSTRAINT "ChatPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ALTER COLUMN "image" TYPE TEXT;

ALTER TABLE "WatchInvite"
  ADD COLUMN IF NOT EXISTS "replySeenAt" TIMESTAMP(3);
