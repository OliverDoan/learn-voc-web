/**
 * Nạp BỘ CÂU LUYỆN VIẾT từ `prisma/practice-data/unit-NN.json` vào bảng PracticeSentence.
 *
 * Mỗi câu phải thoả 2 điều kiện (script tự kiểm tra, KHÔNG ghi nếu sai):
 *   1. Chứa từ vựng của chính thẻ đó.
 *   2. Chứa ít nhất 1 từ đã học ở BẤT KỲ Unit nào trước đó (không chỉ Unit liền trước).
 *
 * Đây là đường đi không cần Claude API — dùng khi hết credit hoặc muốn tự soạn câu.
 *
 * Chạy:
 *   pnpm practice:load --check      # chỉ kiểm tra, không ghi DB
 *   pnpm practice:load              # kiểm tra rồi ghi DB (ghi đè bộ câu cũ của Unit)
 *   pnpm practice:load --unit=2     # giới hạn 1 Unit
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { containsWord, findReviewWords } from "../lib/sentence-review";
import { getDeckUnitNumber } from "../lib/deck-progress";

const prisma = new PrismaClient();

const DATA_DIR = join(process.cwd(), "prisma", "practice-data");
const CHECK_ONLY = process.argv.includes("--check");
const UNIT_FILTER = process.argv.find((a) => a.startsWith("--unit="))?.slice("--unit=".length);

/** Số từ tối thiểu của câu tiếng Anh (khớp MIN_SENTENCE_WORDS của lib). */
const MIN_WORDS = 3;

interface PracticeFile {
  unit: number;
  deck?: string;
  note?: string;
  items: { word: string; sentences: { english: string; vietnamese: string }[] }[];
}

interface Problem {
  word: string;
  reason: string;
}

interface ReadyRow {
  cardId: string;
  word: string;
  english: string;
  vietnamese: string;
  reviewWords: string[];
  order: number;
}

function readDataFiles(): PracticeFile[] {
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
      return JSON.parse(raw) as PracticeFile;
    } catch (error) {
      throw new Error(`File ${name} không phải JSON hợp lệ: ${(error as Error).message}`);
    }
  });

  return files
    .filter((f) => !UNIT_FILTER || String(f.unit) === UNIT_FILTER)
    .sort((a, b) => a.unit - b.unit);
}

function wordCount(sentence: string): number {
  return sentence.trim().split(/\s+/).filter(Boolean).length;
}

async function main() {
  const files = readDataFiles();
  if (files.length === 0) {
    console.log("Không có file nào khớp. Kiểm tra prisma/practice-data/ hoặc --unit=");
    return;
  }

  const allDecks = await prisma.deck.findMany({ where: { deletedAt: null } });
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

    // Từ của MỌI Unit trước Unit này (không chỉ Unit liền trước).
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

    const sentenceCount = file.items.reduce((n, i) => n + (i.sentences?.length ?? 0), 0);
    console.log(
      `\n📄 Unit ${file.unit} — ${target.deck.name}\n` +
        `   ${file.items.length} từ / ${sentenceCount} câu | từ cũ khả dụng: ${previousWords.length}`,
    );

    const problems: Problem[] = [];
    const ready: ReadyRow[] = [];

    for (const item of file.items) {
      const card = cardByWord.get(item.word.trim().toLowerCase());
      if (!card) {
        problems.push({ word: item.word, reason: "không có thẻ này trong deck" });
        continue;
      }
      const sentences = item.sentences ?? [];
      if (sentences.length === 0) {
        problems.push({ word: item.word, reason: "không có câu luyện nào" });
        continue;
      }

      sentences.forEach((s, i) => {
        const english = s.english?.trim() ?? "";
        const vietnamese = s.vietnamese?.trim() ?? "";
        const label = `${item.word} #${i + 1}`;
        if (!english || !vietnamese) {
          problems.push({ word: label, reason: "thiếu english hoặc vietnamese" });
          return;
        }
        if (wordCount(english) < MIN_WORDS) {
          problems.push({ word: label, reason: `câu quá ngắn (< ${MIN_WORDS} từ)` });
          return;
        }
        if (!containsWord(english, card.word)) {
          problems.push({ word: label, reason: `câu không chứa từ "${card.word}"` });
          return;
        }
        // Unit đầu tiên chưa có từ cũ → miễn điều kiện chêm từ.
        const reviewWords = findReviewWords(english, previousWords);
        if (previousWords.length > 0 && reviewWords.length === 0) {
          problems.push({ word: label, reason: "câu không chứa từ nào của Unit cũ" });
          return;
        }
        ready.push({
          cardId: card.id,
          word: card.word,
          english,
          vietnamese,
          reviewWords,
          order: i,
        });
      });
    }

    for (const p of problems) {
      console.error(`   ✗ ${p.word.padEnd(18)} ${p.reason}`);
    }

    const covered = new Set(
      ready.flatMap((r) => r.reviewWords.map((w) => w.toLowerCase())),
    );
    console.log(
      `   → ${ready.length} câu hợp lệ, chêm được ${covered.size} từ cũ khác nhau.`,
    );

    if (!CHECK_ONLY && ready.length > 0) {
      // Ghi đè bộ câu của các thẻ có trong file (không đụng thẻ khác).
      const cardIds = [...new Set(ready.map((r) => r.cardId))];
      await prisma.$transaction([
        prisma.practiceSentence.deleteMany({ where: { cardId: { in: cardIds } } }),
        prisma.practiceSentence.createMany({
          data: ready.map((r) => ({
            cardId: r.cardId,
            english: r.english,
            vietnamese: r.vietnamese,
            reviewWords: JSON.stringify(r.reviewWords),
            order: r.order,
          })),
        }),
      ]);
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
