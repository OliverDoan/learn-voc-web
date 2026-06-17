import ExcelJS from "exceljs";

export interface PrintDeck {
  name: string;
  words: string[];
}

const POS_ABBR: Record<string, string> = {
  noun: "n",
  verb: "v",
  adjective: "adj",
  adverb: "adv",
  pronoun: "pron",
  preposition: "prep",
  conjunction: "conj",
  determiner: "det",
  interjection: "interj",
  phrase: "phr",
};

/**
 * Viết tắt từ loại cho file in: "adjective / noun" -> "adj/n".
 * Tách theo /, , ; rồi map từng phần; token lạ giữ nguyên (đã trim, lowercase, bỏ dấu chấm cuối).
 */
export function abbreviatePos(pos: string | null | undefined): string {
  if (!pos) return "";
  return pos
    .split(/[/,;]+/)
    .map((p) => p.trim().toLowerCase().replace(/\.$/, ""))
    .filter(Boolean)
    .map((p) => POS_ABBR[p] ?? p)
    .join("/");
}

/**
 * Dựng ma trận hàng cho sheet "In": mỗi cột là một deck, mỗi ô là một từ.
 * Các deck có số từ khác nhau → ô thiếu để rỗng (""). Hàng = số từ của deck dài nhất.
 * Tách riêng (pure) để dễ test, không phụ thuộc ExcelJS.
 */
export function buildPrintMatrix(decks: readonly PrintDeck[]): string[][] {
  const maxLen = decks.reduce((max, d) => Math.max(max, d.words.length), 0);
  const rows: string[][] = [];
  for (let r = 0; r < maxLen; r++) {
    rows.push(decks.map((d) => d.words[r] ?? ""));
  }
  return rows;
}

/**
 * Tạo file Excel 1 sheet để in: mỗi cột tương ứng một deck (header = tên deck),
 * bên dưới là danh sách từ của deck đó. Trả về Buffer để stream về client.
 */
export async function buildPrintWorkbook(decks: readonly PrintDeck[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "VocaLearn";

  const ws = wb.addWorksheet("Từ vựng");
  ws.columns = decks.map((d, i) => ({
    header: d.name,
    key: `c${i}`,
    width: 26,
  }));

  // Định dạng hàng tiêu đề
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF173DC9" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  headerRow.height = 24;

  for (const row of buildPrintMatrix(decks)) {
    ws.addRow(Object.fromEntries(row.map((value, i) => [`c${i}`, value])));
  }

  // Freeze hàng tiêu đề để khi cuộn / in vẫn thấy tên deck
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
