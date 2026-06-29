-- CreateTable
CREATE TABLE "DeckActivity" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "bestAccuracy" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeckActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeckActivity_deckId_idx" ON "DeckActivity"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "DeckActivity_deckId_activity_key" ON "DeckActivity"("deckId", "activity");

-- AddForeignKey
ALTER TABLE "DeckActivity" ADD CONSTRAINT "DeckActivity_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
