import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import path from "node:path";
import {
  stringifyWordForms,
  type WordForms,
  type WordFormPOS,
} from "../lib/word-forms";

const prisma = new PrismaClient();
const INPUT = path.resolve(process.cwd(), "vocabulary.xlsx");

// Tên sheet Excel bị thay : \ / ? * [ ] thành khoảng trắng khi export.
// Dùng cùng quy tắc để khớp ngược sheet ↔ deck.
function safeSheetName(name: string): string {
  return name
    .replace(/[:\\/?*[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 31);
}

// "progress (noun)" -> "progress" ; bỏ phần loại từ trong ngoặc để khớp card.word
function baseWord(raw: string): string {
  return raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object" && "text" in value) return String(value.text);
  return String(value).trim();
}

// Map viết tắt loại từ trong cột "Word Form" -> POS chuẩn
const POS_ABBR: Record<string, WordFormPOS> = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
};

/**
 * Parse cột "Word Form" thành {noun, verb, adjective, adverb}.
 * Vd: "progress (v), progressive (adj), progression (n)"
 * -> { verb: "progress", adjective: "progressive", noun: "progression" }
 * Một POS có nhiều từ thì giữ từ ĐẦU TIÊN (schema chỉ chứa 1 giá trị/loại).
 */
function parseWordFormColumn(raw: string): WordForms {
  const text = raw.trim();
  if (!text || text === "—" || text === "-") return {};

  const forms: WordForms = {};
  for (const part of text.split(",")) {
    const match = part.trim().match(/^(.+?)\s*\(([^)]*)\)\s*$/);
    if (!match) continue;
    const [, wordPart, posPart] = match;
    const word = wordPart.trim();
    if (!word) continue;
    // "(adj/n)" -> gán cho cả adjective lẫn noun nếu slot còn trống
    for (const abbr of posPart.split("/")) {
      const pos = POS_ABBR[abbr.trim().toLowerCase()];
      if (pos && !forms[pos]) forms[pos] = word;
    }
  }
  return forms;
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(INPUT);

  const decks = await prisma.deck.findMany();
  const deckBySheet = new Map(decks.map((d) => [safeSheetName(d.name), d]));

  let updated = 0;
  let missing = 0;

  for (const ws of wb.worksheets) {
    const deck = deckBySheet.get(safeSheetName(ws.name));
    if (!deck) {
      console.warn(`⚠️  Không tìm thấy deck cho sheet "${ws.name}"`);
      continue;
    }

    const cards = await prisma.card.findMany({ where: { deckId: deck.id } });
    const cardByWord = new Map(
      cards.map((c) => [c.word.trim().toLowerCase(), c]),
    );

    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const wordCell = cellText(row.getCell(2));
      if (!wordCell) continue;

      const key = baseWord(wordCell).toLowerCase();
      const card = cardByWord.get(key);
      if (!card) {
        console.warn(`   • Không khớp từ "${wordCell}" trong "${deck.name}"`);
        missing++;
        continue;
      }

      const rootWord = cellText(row.getCell(5)) || null;
      const wordForms = stringifyWordForms(parseWordFormColumn(cellText(row.getCell(6))));

      await prisma.card.update({
        where: { id: card.id },
        data: { rootWord, wordForms },
      });
      updated++;
    }

    console.log(`📄 ${deck.name}: cập nhật ${cards.length} thẻ`);
  }

  console.log(`\n✅ Đã cập nhật ${updated} thẻ (${missing} không khớp)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
