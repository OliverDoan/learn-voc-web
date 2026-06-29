/**
 * Import đầy đủ bộ từ vựng "final standardized" (15 units) vào DB.
 *
 * - Khớp deck cũ (Unit 1–9) theo số unit → CẬP NHẬT field, giữ nguyên SRS/example/note/tags.
 * - Tạo deck mới cho Unit chưa có (10–15) cùng toàn bộ thẻ.
 * - Upsert card theo (deckId + từ gốc): có rồi thì update, chưa có thì tạo mới.
 *
 * Chạy: npx tsx scripts/import-vocab-full.ts
 */
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import path from "node:path";
import {
  stringifyWordForms,
  type WordForms,
  type WordFormPOS,
} from "../lib/word-forms";

const prisma = new PrismaClient();
const INPUT = path.resolve(process.cwd(), "vocabulary_final_standardized.xlsx");

// Bảng màu gán cho deck mới theo thứ tự
const DECK_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#eab308", "#22c55e", "#a855f7",
];

const POS_FULL: Record<string, WordFormPOS> = {
  n: "noun",
  noun: "noun",
  v: "verb",
  verb: "verb",
  adj: "adjective",
  adjective: "adjective",
  adv: "adverb",
  adverb: "adverb",
};

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object" && "text" in value) return String((value as { text: unknown }).text).trim();
  return String(value).trim();
}

// "progress (noun)" -> { base: "progress", pos: "noun" }
// "secondary (adjective / noun)" -> { base: "secondary", pos: "adjective / noun" }
function parseWordCell(raw: string): { base: string; pos: string | null } {
  const match = raw.match(/^(.+?)\s*\(([^)]*)\)\s*$/);
  if (!match) return { base: raw.trim(), pos: null };
  const base = match[1].trim();
  const posTokens = match[2]
    .split(/[/,]/)
    .map((t) => POS_FULL[t.trim().toLowerCase()])
    .filter((p): p is WordFormPOS => !!p);
  const pos = posTokens.length > 0 ? Array.from(new Set(posTokens)).join(" / ") : null;
  return { base, pos };
}

/**
 * Parse cột "Word Form" -> {noun, verb, adjective, adverb}.
 * Vd: "progress (v), progressive (adj), progression (n)"
 * Một POS nhiều từ -> giữ từ đầu tiên (schema 1 giá trị/loại).
 */
function parseWordFormColumn(raw: string): WordForms {
  const text = raw.trim();
  if (!text || text === "—" || text === "-") return {};
  const forms: WordForms = {};
  for (const part of text.split(",")) {
    const match = part.trim().match(/^(.+?)\s*\(([^)]*)\)\s*$/);
    if (!match) continue;
    const word = match[1].trim();
    if (!word) continue;
    for (const abbr of match[2].split("/")) {
      const pos = POS_FULL[abbr.trim().toLowerCase()];
      if (pos && !forms[pos]) forms[pos] = word;
    }
  }
  return forms;
}

function unitNumber(name: string): number | null {
  const m = name.match(/unit\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(INPUT);

  const decks = await prisma.deck.findMany();
  const deckByUnit = new Map<number, (typeof decks)[number]>();
  for (const d of decks) {
    const n = unitNumber(d.name);
    if (n != null) deckByUnit.set(n, d);
  }

  let created = 0;
  let updated = 0;
  let decksCreated = 0;

  for (const ws of wb.worksheets) {
    const n = unitNumber(ws.name);
    if (n == null) {
      console.warn(`⚠️  Bỏ qua sheet không xác định unit: "${ws.name}"`);
      continue;
    }

    let deck = deckByUnit.get(n);
    if (!deck) {
      deck = await prisma.deck.create({
        data: {
          name: ws.name.trim(),
          description: "",
          color: DECK_COLORS[(n - 1) % DECK_COLORS.length],
        },
      });
      deckByUnit.set(n, deck);
      decksCreated++;
      console.log(`🆕 Tạo deck "${deck.name}"`);
    }

    const existing = await prisma.card.findMany({ where: { deckId: deck.id } });
    const cardByWord = new Map(existing.map((c) => [c.word.trim().toLowerCase(), c]));
    let maxOrder = existing.reduce((m, c) => Math.max(m, c.order), -1);

    let unitCreated = 0;
    let unitUpdated = 0;

    for (let i = 2; i <= ws.actualRowCount; i++) {
      const row = ws.getRow(i);
      const wordRaw = cellText(row.getCell(2));
      if (!wordRaw) continue;

      const { base, pos } = parseWordCell(wordRaw);
      const phonetic = cellText(row.getCell(3)) || null;
      const meaning = cellText(row.getCell(4)) || base;
      const rootWord = cellText(row.getCell(5)) || null;
      const wordForms = stringifyWordForms(parseWordFormColumn(cellText(row.getCell(6))));

      const key = base.toLowerCase();
      const found = cardByWord.get(key);

      if (found) {
        // Cập nhật field từ vựng, GIỮ NGUYÊN example/note/tags/SRS
        await prisma.card.update({
          where: { id: found.id },
          data: { meaning, partOfSpeech: pos, phonetic, rootWord, wordForms },
        });
        unitUpdated++;
        updated++;
      } else {
        await prisma.card.create({
          data: {
            deckId: deck.id,
            word: base,
            meaning,
            partOfSpeech: pos,
            phonetic,
            rootWord,
            wordForms,
            order: ++maxOrder,
          },
        });
        unitCreated++;
        created++;
      }
    }

    console.log(`📄 ${deck.name}: +${unitCreated} mới, ~${unitUpdated} cập nhật`);
  }

  console.log(
    `\n✅ Hoàn tất: ${decksCreated} deck mới, ${created} thẻ mới, ${updated} thẻ cập nhật.`,
  );
  console.log(`   Tổng deck hiện có: ${await prisma.deck.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
