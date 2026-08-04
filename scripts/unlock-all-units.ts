import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Tạm mở khóa TẤT CẢ Unit.
 *
 * Khóa được suy diễn từ `learnedAt` (xem lib/deck-progress.ts): một Unit chỉ mở
 * khi mọi Unit trước đã có `learnedAt`. Vì vậy để mở hết, ta set `learnedAt` cho
 * mọi deck chưa có.
 *
 * Chạy:
 *   pnpm tsx --env-file=.env scripts/unlock-all-units.ts          # xem trước (dry-run)
 *   APPLY=1 pnpm tsx --env-file=.env scripts/unlock-all-units.ts  # áp dụng
 *
 * Đảo ngược (khóa lại theo tiến độ thật): xem cờ RESET bên dưới.
 *   RESET=1 APPLY=1 pnpm tsx --env-file=.env scripts/unlock-all-units.ts
 */
async function main() {
  const apply = process.env.APPLY === "1";
  const reset = process.env.RESET === "1";

  const decks = await prisma.deck.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, learnedAt: true },
    orderBy: { createdAt: "asc" },
  });

  if (reset) {
    const toReset = decks.filter((d) => d.learnedAt != null);
    console.log(`RESET: sẽ xóa learnedAt của ${toReset.length}/${decks.length} deck (khóa lại từ đầu).`);
    if (apply) {
      await prisma.deck.updateMany({
        where: { deletedAt: null },
        data: { learnedAt: null },
      });
      console.log("Đã reset. Mọi Unit khóa lại theo tiến độ thật.");
    } else {
      console.log("Dry-run — thêm APPLY=1 để áp dụng.");
    }
    return;
  }

  const toUnlock = decks.filter((d) => d.learnedAt == null);
  console.log(`Tổng ${decks.length} deck, ${toUnlock.length} deck chưa học xong sẽ được set learnedAt để mở khóa:`);
  for (const d of toUnlock) console.log(`  - ${d.name}`);

  if (!apply) {
    console.log("\nDry-run — thêm APPLY=1 để áp dụng:");
    console.log("  APPLY=1 pnpm tsx --env-file=.env scripts/unlock-all-units.ts");
    return;
  }

  const now = new Date();
  await prisma.deck.updateMany({
    where: { deletedAt: null, learnedAt: null },
    data: { learnedAt: now },
  });
  console.log(`\nĐã mở khóa tất cả ${decks.length} Unit (set learnedAt = ${now.toISOString()}).`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi mở khóa:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
