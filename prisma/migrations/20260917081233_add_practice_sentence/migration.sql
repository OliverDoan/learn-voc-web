-- CreateTable
CREATE TABLE "PracticeSentence" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "vietnamese" TEXT NOT NULL,
    "reviewWords" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSentence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeSentence_cardId_idx" ON "PracticeSentence"("cardId");

-- AddForeignKey
ALTER TABLE "PracticeSentence" ADD CONSTRAINT "PracticeSentence_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
