-- CreateIndex
CREATE INDEX "PendingHome_inviteCode_idx" ON "PendingHome"("inviteCode");

-- AddForeignKey
ALTER TABLE "PendingHome" ADD CONSTRAINT "PendingHome_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
