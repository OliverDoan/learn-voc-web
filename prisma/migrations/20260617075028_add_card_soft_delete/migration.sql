-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Card_deletedAt_idx" ON "Card"("deletedAt");
