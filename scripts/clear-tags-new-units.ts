/**
 * Bỏ (xoá) tags cho toàn bộ thẻ thuộc các Unit mới thêm: Unit 21–30.
 * Đặt tags = "[]" (mảng rỗng dạng JSON string) — không đụng field khác.
 *
 * Mặc định DRY-RUN (chỉ in, không ghi). Ghi thật: APPLY=1.
 * Chạy: tsx --env-file=.env scripts/clear-tags-new-units.ts           (xem trước)
 *       APPLY=1 tsx --env-file=.env scripts/clear-tags-new-units.ts   (ghi thật)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY = process.env.APPLY !== "1";

// Unit 21–30 (bỏ qua Unit 20 và các số khác).
const UNIT_RE = /^Unit (2[1-9]|30):/;

async function main() {
  const decks = await prisma.deck.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });
  const targetDecks = decks.filter((d) => UNIT_RE.test(d.name));

  if (targetDecks.length === 0) {
    console.log("Không tìm thấy deck nào khớp Unit 21–30.");
    return;
  }

  console.log(`Tìm thấy ${targetDecks.length} deck:`);
  for (const d of targetDecks) console.log(`  • ${d.name}`);

  const deckIds = targetDecks.map((d) => d.id);
  // Chỉ đếm/ghi những thẻ đang có tags khác rỗng.
  const affected = await prisma.card.count({
    where: { deckId: { in: deckIds }, tags: { notIn: ["", "[]"] } },
  });

  console.log(`\nThẻ có tags sẽ bị xoá: ${affected}`);

  if (DRY) {
    console.log("\n[DRY-RUN] Chưa ghi. Chạy lại với APPLY=1 để xoá thật.");
    return;
  }

  const result = await prisma.card.updateMany({
    where: { deckId: { in: deckIds } },
    data: { tags: "[]" },
  });
  console.log(`\n✅ Đã cập nhật ${result.count} thẻ → tags = "[]".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
