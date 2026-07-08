/**
 * Rà toàn bộ thẻ trong DB, gán biến thể Anh–Anh / Anh–Mỹ (dialect + variantWord)
 * theo bảng tra lib/dialect-data.ts. Đồng bộ luôn vào prisma/seed-data.json.
 *
 * Chạy: npx tsx scripts/apply-dialect.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { DIALECT_MAP } from "../lib/dialect-data";

const prisma = new PrismaClient();
const SEED_PATH = join(process.cwd(), "prisma", "seed-data.json");

async function main() {
  const cards = await prisma.card.findMany({
    select: { id: true, word: true, dialect: true, variantWord: true },
  });

  let set = 0;
  let cleared = 0;
  const applied: Record<string, { dialect: string | null; variantWord: string | null }> = {};

  for (const c of cards) {
    const info = DIALECT_MAP[c.word.trim().toLowerCase()] ?? null;
    const dialect = info?.dialect ?? null;
    const variantWord = info?.variant ?? null;

    // Chỉ update khi có thay đổi để tránh ghi thừa
    if (c.dialect !== dialect || c.variantWord !== variantWord) {
      await prisma.card.update({ where: { id: c.id }, data: { dialect, variantWord } });
    }
    applied[c.id] = { dialect, variantWord };
    if (dialect) set++;
    else if (c.dialect) cleared++;
  }

  // Đồng bộ vào seed-data.json (nếu có)
  try {
    const seed = JSON.parse(readFileSync(SEED_PATH, "utf8"));
    if (Array.isArray(seed.cards)) {
      for (const sc of seed.cards) {
        const a = applied[sc.id];
        if (a) {
          sc.dialect = a.dialect;
          sc.variantWord = a.variantWord;
        }
      }
      writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + "\n", "utf8");
      console.log("✅ Đã đồng bộ seed-data.json");
    }
  } catch (err) {
    console.warn("⚠️  Không cập nhật được seed-data.json:", err);
  }

  const flagged = cards
    .filter((c) => DIALECT_MAP[c.word.trim().toLowerCase()])
    .map((c) => {
      const i = DIALECT_MAP[c.word.trim().toLowerCase()]!;
      return `${c.word} → ${i.dialect === "british" ? "US" : "UK"}:${i.variant}`;
    });

  console.log(`\n✅ Gắn biến thể cho ${set} thẻ, gỡ ${cleared} thẻ. Tổng ${cards.length} thẻ đã rà.`);
  console.log("Danh sách đánh dấu:\n - " + flagged.join("\n - "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
