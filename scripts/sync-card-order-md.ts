/**
 * Sắp thứ tự thẻ trong mỗi deck tiếng Anh theo thứ tự từ trong `vocab-unit-*.md`
 * (thứ tự đã nhóm các từ liên quan, đồng bộ với site docusaurus).
 *
 * Khác `sync:card-order` (sắp theo truyện chêm): chạy lại script kia sẽ ghi đè thứ tự này.
 *
 * Chạy:
 *   pnpm card-order:md --check     # chỉ in kế hoạch, không ghi DB
 *   pnpm card-order:md             # ghi DB (in bản sao lưu thứ tự cũ ra file trước)
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { getDeckUnitNumber } from "../lib/deck-progress";
import { parseVocabMdOrder, planCardOrder } from "../lib/vocab-md-order";

const prisma = new PrismaClient();
const CHECK_ONLY = process.argv.includes("--check");

function readFileOrder(): Map<number, string[]> {
  const files = readdirSync(process.cwd()).filter((f) => /^vocab-unit-.*\.md$/.test(f));
  if (files.length === 0) throw new Error("Không tìm thấy file vocab-unit-*.md ở thư mục gốc");
  const merged = new Map<number, string[]>();
  for (const f of files) {
    for (const [unit, words] of parseVocabMdOrder(readFileSync(join(process.cwd(), f), "utf8"))) {
      merged.set(unit, words);
    }
  }
  return merged;
}

async function main() {
  const fileOrder = readFileOrder();
  const decks = await prisma.deck.findMany({
    // Chỉ deck có "Unit N" trong tên và có trong file md mới được sắp (deck tiếng Trung đặt tên "Bài N").
    where: { deletedAt: null },
    include: {
      cards: {
        where: { deletedAt: null },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, word: true, order: true },
      },
    },
  });

  const backup = decks.map((d) => ({ deck: d.name, cards: d.cards.map((c) => ({ id: c.id, order: c.order })) }));
  const updates: { id: string; order: number }[] = [];

  for (const deck of decks) {
    const unit = getDeckUnitNumber(deck.name);
    const words = unit === null ? undefined : fileOrder.get(unit);
    if (!words) {
      console.log(`⏭️  "${deck.name}": không có trong file md, bỏ qua`);
      continue;
    }
    const plan = planCardOrder(deck.cards, words);
    const warn = [
      plan.missingCards.length ? `từ không có thẻ: ${plan.missingCards.join(", ")}` : "",
      plan.missingInFile.length ? `thẻ không có trong file: ${plan.missingInFile.join(", ")}` : "",
    ].filter(Boolean);
    console.log(`${warn.length ? "⚠️ " : "✅"} "${deck.name}": ${plan.orderedIds.length} thẻ${warn.length ? ` — ${warn.join("; ")}` : ""}`);
    plan.orderedIds.forEach((id, order) => updates.push({ id, order }));
  }

  if (CHECK_ONLY) {
    console.log(`\n--check: sẽ cập nhật ${updates.length} thẻ, chưa ghi DB.`);
    return;
  }

  const backupPath = join(process.cwd(), `card-order-backup-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`💾 Đã sao lưu thứ tự cũ: ${backupPath}`);

  await prisma.$transaction(updates.map(({ id, order }) => prisma.card.update({ where: { id }, data: { order } })));
  console.log(`✅ Đã cập nhật thứ tự ${updates.length} thẻ.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
