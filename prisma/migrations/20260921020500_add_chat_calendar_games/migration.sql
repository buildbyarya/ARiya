-- Create temporary chat, shared calendar and drawing-swap tables.
CREATE TYPE "ChatMessageKind" AS ENUM ('TEXT', 'IMAGE', 'VOICE');

CREATE TABLE "ChatSetting" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "background" TEXT NOT NULL DEFAULT 'linear-gradient(135deg,#160b2e,#050505,#2a0a22)',
  "fontSize" INTEGER NOT NULL DEFAULT 16,
  "textColor" TEXT NOT NULL DEFAULT '#ffffff',
  "fontFamily" TEXT NOT NULL DEFAULT 'system-ui',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChatSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ChatSetting_homeId_key" ON "ChatSetting"("homeId");

CREATE TABLE "CalendarEvent" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "color" TEXT NOT NULL DEFAULT '#f9a8d4',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CalendarEvent_homeId_startAt_idx" ON "CalendarEvent"("homeId","startAt");

CREATE TABLE "DrawingSwapGame" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'LOBBY',
  "startedAt" TIMESTAMP(3),
  "phaseEndsAt" TIMESTAMP(3),
  "drawingA" TEXT,
  "drawingB" TEXT,
  "round" INTEGER NOT NULL DEFAULT 0,
  "durationSec" INTEGER NOT NULL DEFAULT 225,
  "swapSec" INTEGER NOT NULL DEFAULT 45,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DrawingSwapGame_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DrawingSwapGame_homeId_key" ON "DrawingSwapGame"("homeId");

CREATE TABLE "ChatMessage" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "kind" "ChatMessageKind" NOT NULL DEFAULT 'TEXT',
  "replyToId" TEXT,
  "pinned" BOOLEAN NOT NULL DEFAULT false,
  "mediaMime" TEXT,
  "mediaData" TEXT,
  "mediaExpiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatMessage_homeId_createdAt_idx" ON "ChatMessage"("homeId","createdAt");
CREATE INDEX "ChatMessage_replyToId_idx" ON "ChatMessage"("replyToId");

CREATE TABLE "ChatMediaView" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChatMediaView_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ChatMediaView_messageId_userId_key" ON "ChatMediaView"("messageId","userId");

ALTER TABLE "ChatSetting" ADD CONSTRAINT "ChatSetting_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DrawingSwapGame" ADD CONSTRAINT "DrawingSwapGame_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMediaView" ADD CONSTRAINT "ChatMediaView_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMediaView" ADD CONSTRAINT "ChatMediaView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
