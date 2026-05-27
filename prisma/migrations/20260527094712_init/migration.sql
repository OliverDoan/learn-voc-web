-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Card" (
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

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeTakenMs" INTEGER NOT NULL DEFAULT 0,
    "previousInterval" INTEGER NOT NULL DEFAULT 0,
    "newInterval" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ReviewLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "cardsReviewed" INTEGER NOT NULL DEFAULT 0,
    "cardsLearned" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "dailyGoal" INTEGER NOT NULL DEFAULT 20,
    "freezeTokens" INTEGER NOT NULL DEFAULT 2
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "StoryCard_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoryCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Card_deckId_idx" ON "Card"("deckId");

-- CreateIndex
CREATE INDEX "Card_nextReviewDate_idx" ON "Card"("nextReviewDate");

-- CreateIndex
CREATE INDEX "Card_state_idx" ON "Card"("state");

-- CreateIndex
CREATE INDEX "ReviewLog_cardId_idx" ON "ReviewLog"("cardId");

-- CreateIndex
CREATE INDEX "ReviewLog_reviewedAt_idx" ON "ReviewLog"("reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStat_date_key" ON "DailyStat"("date");

-- CreateIndex
CREATE INDEX "Story_deckId_idx" ON "Story"("deckId");

-- CreateIndex
CREATE INDEX "StoryCard_storyId_idx" ON "StoryCard"("storyId");

-- CreateIndex
CREATE INDEX "StoryCard_cardId_idx" ON "StoryCard"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryCard_storyId_cardId_key" ON "StoryCard"("storyId", "cardId");
