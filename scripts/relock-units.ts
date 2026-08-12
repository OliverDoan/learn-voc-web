import { PrismaClient } from "@prisma/client";
import { allExercisesDone } from "../lib/deck-activities";
import { computeDeckLockStatus, getDeckUnitNumber } from "../lib/deck-progress";
import type { Card } from "../lib/types";

const prisma = new PrismaClient();

/**
 * Khóa lại các Unit theo TIẾN ĐỘ THẬT (đảo ngược scripts/unlock-all-units.ts).
 *
 * Deck chỉ giữ `learnedAt` khi đã thực sự làm xong bài tập (theo `allExercisesDone`
 * trong lib/deck-activities.ts). Deck chưa đủ điều kiện sẽ bị xóa `learnedAt`,
 * kéo theo mọi Unit sau nó tự khóa lại (xem lib/deck-progress.ts).
 *
 * Chạy:
 *   pnpm tsx --env-file=.env scripts/relock-units.ts          # xem trước (dry-run)
 *   APPLY=1 pnpm tsx --env-file=.env scripts/relock-units.ts  # áp dụng
 *
 * Khóa sạch từ Unit 1 (bỏ qua tiến độ bài tập, xóa learnedAt của MỌI deck):
 *   ALL=1 APPLY=1 pnpm tsx --env-file=.env scripts/relock-units.ts
 */
async function main() {
  const apply = process.env.APPLY === "1";
  const all = process.env.ALL === "1";

  const decks = await prisma.deck.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      learnedAt: true,
      cards: {
        where: { deletedAt: null },
        select: { id: true, word: true, example: true, exampleTranslation: true },
      },
      stories: { select: { content: true } },
      activities: { select: { activity: true, bestAccuracy: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Deck nào ĐƯỢC GIỮ learnedAt: đã làm xong bài tập (hoặc rỗng nếu ALL=1).
  const keepIds = new Set(
    all
      ? []
      : decks
          .filter((d) => {
            const cards = d.cards as unknown as Card[];
            const hasStoryWithWords = d.stories.some((s) => s.content.includes("[["));
            return (
              d.learnedAt != null && allExercisesDone(cards, d.activities, { hasStoryWithWords })
            );
          })
          .map((d) => d.id),
  );

  const toClear = decks.filter((d) => d.learnedAt != null && !keepIds.has(d.id));

  console.log(
    `Tổng ${decks.length} deck — giữ "đã học" ${keepIds.size}, xóa learnedAt ${toClear.length}.`,
  );
  for (const d of toClear) console.log(`  - xóa learnedAt: ${d.name}`);

  // Trạng thái khóa SAU khi áp dụng (mô phỏng).
  const after = computeDeckLockStatus(
    decks.map((d) => ({
      id: d.id,
      name: d.name,
      learnedAt: keepIds.has(d.id) ? d.learnedAt : null,
    })),
  );
  const unitDecks = decks
    .map((d) => ({ deck: d, unit: getDeckUnitNumber(d.name) }))
    .filter((x): x is { deck: (typeof decks)[number]; unit: number } => x.unit !== null)
    .sort((a, b) => a.unit - b.unit);
  const openDecks = unitDecks.filter(({ deck }) => after.get(deck.id)?.locked === false);
  console.log(
    `\nSau khi áp dụng: ${openDecks.length}/${unitDecks.length} Unit mở, ${unitDecks.length - openDecks.length} Unit khóa.`,
  );
  console.log("Unit đang mở:");
  for (const { deck } of openDecks) {
    console.log(`  - ${deck.name}${after.get(deck.id)?.learned ? " (đã học xong)" : ""}`);
  }

  if (!apply) {
    console.log("\nDry-run — thêm APPLY=1 để áp dụng.");
    return;
  }

  const clearIds = toClear.map((d) => d.id);
  if (clearIds.length === 0) {
    console.log("\nKhông có deck nào cần đổi.");
    return;
  }
  await prisma.deck.updateMany({
    where: { id: { in: clearIds } },
    data: { learnedAt: null },
  });
  console.log(`\nĐã khóa lại: xóa learnedAt của ${clearIds.length} deck.`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi khóa lại Unit:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
