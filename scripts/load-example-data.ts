/**
 * Nạp câu ví dụ viết tay từ `prisma/example-data/unit-NN.json` vào DB.
 *
 * Mỗi câu phải thoả 2 điều kiện (script tự kiểm tra, KHÔNG ghi nếu sai):
 *   1. Chứa từ vựng của chính thẻ đó.
 *   2. Chứa ít nhất 1 từ đã học ở các Unit TRƯỚC (ôn lại từ cũ).
 *
 * Đây là đường đi không cần Claude API — dùng khi hết credit hoặc muốn tự soạn câu.
 *
 * Chạy:
 *   pnpm examples:load --check      # chỉ kiểm tra, không ghi DB
 *   pnpm examples:load              # kiểm tra rồi ghi DB
 *   pnpm examples:load --unit=2     # giới hạn 1 Unit
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { containsWord, findReviewWords } from "../lib/sentence-review";
import { getDeckUnitNumber } from "../lib/deck-progress";

const prisma = new PrismaClient();

const DATA_DIR = join(process.cwd(), "prisma", "example-data");
const CHECK_ONLY = process.argv.includes("--check");
const UNIT_FILTER = process.argv.find((a) => a.startsWith("--unit="))?.slice("--unit=".length);

interface ExampleFile {
  unit: number;
  deck?: string;
  note?: string;
  items: { word: string; example: string; exampleTranslation: string }[];
}

interface Problem {
  word: string;
  reason: string;
}

function readDataFiles(): ExampleFile[] {
  let names: string[];
  try {
    names = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    console.error(`❌ Không tìm thấy thư mục ${DATA_DIR}`);
    process.exit(1);
  }

  const files = names.map((name) => {
    const raw = readFileSync(join(DATA_DIR, name), "utf8");
    try {
      return JSON.parse(raw) as ExampleFile;
    } catch (error) {
      throw new Error(`File ${name} không phải JSON hợp lệ: ${(error as Error).message}`);
    }
  });

  return files
    .filter((f) => !UNIT_FILTER || String(f.unit) === UNIT_FILTER)
    .sort((a, b) => a.unit - b.unit);
}

async function main() {
  const files = readDataFiles();
  if (files.length === 0) {
    console.log("Không có file nào khớp. Kiểm tra prisma/example-data/ hoặc --unit=");
    return;
  }

  const allDecks = await prisma.deck.findMany({ where: { deletedAt: null } });
  // Thứ tự Unit lấy từ TÊN deck, giống lib/deck-progress.ts.
  const unitDecks = allDecks
    .map((d) => ({ deck: d, unit: getDeckUnitNumber(d.name) }))
    .filter((x): x is { deck: (typeof allDecks)[number]; unit: number } => x.unit !== null)
    .sort((a, b) => a.unit - b.unit);

  let totalOk = 0;
  let totalBad = 0;

  for (const file of files) {
    const target = unitDecks.find((x) => x.unit === file.unit);
    if (!target) {
      console.error(`❌ Unit ${file.unit}: không tìm thấy deck tương ứng trong DB.`);
      totalBad += file.items.length;
      continue;
    }

    // Từ của MỌI Unit trước Unit này.
    const previousDeckIds = unitDecks.filter((x) => x.unit < file.unit).map((x) => x.deck.id);
    const previousCards = await prisma.card.findMany({
      where: { deckId: { in: previousDeckIds }, deletedAt: null },
      select: { word: true },
    });
    const previousWords = previousCards.map((c) => c.word);

    const cards = await prisma.card.findMany({
      where: { deckId: target.deck.id, deletedAt: null },
      orderBy: { order: "asc" },
    });
    const cardByWord = new Map(cards.map((c) => [c.word.trim().toLowerCase(), c]));

    console.log(
      `\n📄 Unit ${file.unit} — ${target.deck.name}\n` +
        `   ${file.items.length} câu | từ cũ khả dụng: ${previousWords.length}`,
    );

    const problems: Problem[] = [];
    const ready: { id: string; word: string; example: string; translation: string; old: string[] }[] = [];

    for (const item of file.items) {
      const card = cardByWord.get(item.word.trim().toLowerCase());
      if (!card) {
        problems.push({ word: item.word, reason: "không có thẻ này trong deck" });
        continue;
      }
      const example = item.example?.trim();
      const translation = item.exampleTranslation?.trim();
      if (!example || !translation) {
        problems.push({ word: item.word, reason: "thiếu example hoặc exampleTranslation" });
        continue;
      }
      if (!containsWord(example, card.word)) {
        problems.push({ word: item.word, reason: `câu không chứa từ "${card.word}"` });
        continue;
      }
      const old = findReviewWords(example, previousWords);
      if (old.length === 0) {
        problems.push({ word: item.word, reason: "câu không chứa từ nào của Unit trước" });
        continue;
      }
      ready.push({ id: card.id, word: card.word, example, translation, old });
    }

    for (const r of ready) {
      console.log(`   ✓ ${r.word.padEnd(14)} [ôn: ${r.old.join(", ")}]`);
      console.log(`     ${r.example}`);
    }
    for (const p of problems) {
      console.error(`   ✗ ${p.word.padEnd(14)} ${p.reason}`);
    }

    // Độ phủ từ Unit cũ trong cả bộ câu (chỉ để tham khảo).
    const covered = new Set(ready.flatMap((r) => r.old.map((w) => w.toLowerCase())));
    console.log(`   → ${ready.length} câu hợp lệ, chêm được ${covered.size} từ cũ khác nhau.`);

    if (!CHECK_ONLY) {
      for (const r of ready) {
        await prisma.card.update({
          where: { id: r.id },
          data: { example: r.example, exampleTranslation: r.translation },
        });
      }
    }

    totalOk += ready.length;
    totalBad += problems.length;
  }

  console.log(
    `\n${CHECK_ONLY ? "🔍 (--check) " : "✅ "}` +
      `${totalOk} câu hợp lệ${CHECK_ONLY ? "" : " đã ghi vào DB"}` +
      (totalBad ? `, ${totalBad} câu KHÔNG đạt (chưa ghi).` : "."),
  );
  if (totalBad > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
