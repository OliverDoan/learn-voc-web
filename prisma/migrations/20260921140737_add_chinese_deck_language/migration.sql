-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "examplePinyin" TEXT,
ADD COLUMN     "hanziFormal" TEXT,
ADD COLUMN     "radical" TEXT,
ADD COLUMN     "strokeCount" INTEGER;

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "Deck_language_idx" ON "Deck"("language");
