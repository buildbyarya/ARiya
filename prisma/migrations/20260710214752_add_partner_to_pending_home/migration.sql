-- AlterTable
ALTER TABLE "PendingHome" ADD COLUMN     "partnerId" TEXT;

-- AddForeignKey
ALTER TABLE "PendingHome" ADD CONSTRAINT "PendingHome_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
