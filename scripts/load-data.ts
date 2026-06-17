/**
 * Nạp prisma/seed-data.json vào database hiện tại (Postgres sau khi migrate).
 * Idempotent: dùng skipDuplicates, an toàn khi chạy lại.
 *
 * Yêu cầu: DATABASE_URL trỏ tới Postgres, đã chạy `prisma migrate deploy`.
 * Chạy: npx tsx --env-file=.env scripts/load-data.ts
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

interface SeedData {
  decks: unknown[];
  cards: unknown[];
  stories: unknown[];
  storyCards: unknown[];
  reviewLogs: unknown[];
  dailyStats: unknown[];
  userProgress: unknown[];
  achievements: unknown[];
}

async function main() {
  const file = path.resolve(process.cwd(), "prisma/seed-data.json");
  const data = JSON.parse(readFileSync(file, "utf-8")) as SeedData;

  // Thứ tự tôn trọng quan hệ khoá ngoại
  const r1 = await prisma.deck.createMany({ data: data.decks as never, skipDuplicates: true });
  const r2 = await prisma.card.createMany({ data: data.cards as never, skipDuplicates: true });
  const r3 = await prisma.story.createMany({ data: data.stories as never, skipDuplicates: true });
  const r4 = await prisma.storyCard.createMany({ data: data.storyCards as never, skipDuplicates: true });
  const r5 = await prisma.reviewLog.createMany({ data: data.reviewLogs as never, skipDuplicates: true });
  const r6 = await prisma.dailyStat.createMany({ data: data.dailyStats as never, skipDuplicates: true });
  const r7 = await prisma.userProgress.createMany({ data: data.userProgress as never, skipDuplicates: true });
  const r8 = await prisma.achievement.createMany({ data: data.achievements as never, skipDuplicates: true });

  console.log("✅ Đã nạp:");
  console.log(`   decks: ${r1.count}, cards: ${r2.count}, stories: ${r3.count}, storyCards: ${r4.count}`);
  console.log(`   reviewLogs: ${r5.count}, dailyStats: ${r6.count}, userProgress: ${r7.count}, achievements: ${r8.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
