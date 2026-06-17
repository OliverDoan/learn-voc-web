-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "partOfSpeech" TEXT,
    "phonetic" TEXT,
    "example" TEXT,
    "exampleTranslation" TEXT,
    "note" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" TEXT NOT NULL DEFAULT 'NEW',
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("audioUrl", "createdAt", "deckId", "easeFactor", "example", "exampleTranslation", "id", "imageUrl", "interval", "lapses", "meaning", "nextReviewDate", "note", "partOfSpeech", "phonetic", "repetitions", "state", "tags", "updatedAt", "word") SELECT "audioUrl", "createdAt", "deckId", "easeFactor", "example", "exampleTranslation", "id", "imageUrl", "interval", "lapses", "meaning", "nextReviewDate", "note", "partOfSpeech", "phonetic", "repetitions", "state", "tags", "updatedAt", "word" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE INDEX "Card_deckId_idx" ON "Card"("deckId");
CREATE INDEX "Card_nextReviewDate_idx" ON "Card"("nextReviewDate");
CREATE INDEX "Card_state_idx" ON "Card"("state");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
