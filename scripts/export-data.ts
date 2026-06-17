/**
 * Xuất toàn bộ dữ liệu hiện tại (SQLite) ra prisma/seed-data.json để nạp lại
 * vào Postgres sau khi chuyển provider. Chạy TRƯỚC khi đổi schema sang postgres.
 *
 * Chạy: npx tsx scripts/export-data.ts
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const data = {
    decks: await prisma.deck.findMany(),
    cards: await prisma.card.findMany(),
    stories: await prisma.story.findMany(),
    storyCards: await prisma.storyCard.findMany(),
    reviewLogs: await prisma.reviewLog.findMany(),
    dailyStats: await prisma.dailyStat.findMany(),
    userProgress: await prisma.userProgress.findMany(),
    achievements: await prisma.achievement.findMany(),
  };

  const out = path.resolve(process.cwd(), "prisma/seed-data.json");
  writeFileSync(out, JSON.stringify(data, null, 2));

  console.log("✅ Đã xuất:", out);
  for (const [k, v] of Object.entries(data)) {
    console.log(`   ${k}: ${(v as unknown[]).length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
