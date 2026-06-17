-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Card_favorite_idx" ON "Card"("favorite");
