import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import path from "node:path";
import { parseWordForms, WORD_FORM_ORDER } from "../lib/word-forms";

// Viết tắt loại từ để dựng lại cột "Word Form": noun -> n, verb -> v, ...
const POS_SHORT: Record<(typeof WORD_FORM_ORDER)[number], string> = {
  noun: "n",
  verb: "v",
  adjective: "adj",
  adverb: "adv",
};

function formatWordForms(json: string | null): string {
  const forms = parseWordForms(json);
  const parts = WORD_FORM_ORDER.filter((pos) => forms[pos]).map(
    (pos) => `${forms[pos]} (${POS_SHORT[pos]})`,
  );
  return parts.length > 0 ? parts.join(", ") : "—";
}

const prisma = new PrismaClient();

const OUTPUT = path.resolve(process.cwd(), "vocabulary-9-units.xlsx");

// Tên sheet Excel không được chứa : \ / ? * [ ] và tối đa 31 ký tự
function safeSheetName(name: string): string {
  return name.replace(/[:\\/?*\[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 31);
}

async function main() {
  const decks = await prisma.deck.findMany({ orderBy: { createdAt: "asc" } });

  const wb = new ExcelJS.Workbook();
  wb.creator = "Vocab Learning App";

  for (const deck of decks) {
    const cards = await prisma.card.findMany({
      where: { deckId: deck.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    const ws = wb.addWorksheet(safeSheetName(deck.name));

    // Tiêu đề cột
    ws.columns = [
      { header: "STT", key: "stt", width: 6 },
      { header: "Từ vựng", key: "word", width: 30 },
      { header: "Phiên âm", key: "phonetic", width: 22 },
      { header: "Nghĩa tiếng Việt", key: "meaning", width: 40 },
      { header: "Từ gốc", key: "rootWord", width: 28 },
      { header: "Word Form", key: "wordForm", width: 50 },
    ];

    // Định dạng hàng tiêu đề
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    cards.forEach((c, idx) => {
      // Gộp loại từ vào cột Từ vựng: "capital (noun)"
      const word = c.partOfSpeech ? `${c.word} (${c.partOfSpeech})` : c.word;
      ws.addRow({
        stt: idx + 1,
        word,
        phonetic: c.phonetic ?? "",
        meaning: c.meaning,
        rootWord: c.rootWord ?? "",
        wordForm: formatWordForms(c.wordForms),
      });
    });

    // Bật bộ lọc + freeze hàng tiêu đề
    ws.autoFilter = { from: "A1", to: "F1" };
    ws.views = [{ state: "frozen", ySplit: 1 }];

    console.log(`📄 Sheet "${ws.name}": ${cards.length} từ`);
  }

  await wb.xlsx.writeFile(OUTPUT);
  console.log(`\n✅ Đã xuất ${decks.length} deck → ${OUTPUT}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
