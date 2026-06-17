-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Deck_deletedAt_idx" ON "Deck"("deletedAt");
