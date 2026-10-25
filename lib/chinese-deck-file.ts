import { z } from "zod";

/**
 * Định dạng file dữ liệu deck tiếng Trung soạn tay (`prisma/chinese-data/*.json`),
 * nạp vào DB bằng `pnpm chinese:load`. Validate trước khi ghi: file không đạt thì
 * KHÔNG ghi gì vào DB (giống pipeline truyện chêm / câu luyện viết).
 */

const chineseCardSchema = z.object({
  /** Chữ Hán (giản thể) */
  word: z.string().trim().min(1, "Thiếu chữ Hán").max(20),
  /** Pinyin có dấu thanh — bắt buộc để học phát âm */
  phonetic: z.string().trim().min(1, "Thiếu pinyin").max(80),
  /** Nghĩa tiếng Việt */
  meaning: z.string().trim().min(1, "Thiếu nghĩa tiếng Việt").max(500),
  /** Âm Hán Việt, vd 你 → "nhĩ" */
  sinoVietnamese: z.string().trim().max(60).optional().nullable(),
  /** Loại từ theo giáo trình, vd "đại từ", "tính từ", "số từ" */
  partOfSpeech: z.string().trim().max(40).optional().nullable(),
  /** Chữ số đại tả (大写), vd 一 → 壹 */
  hanziFormal: z.string().trim().max(20).optional().nullable(),
  /** Số nét viết */
  strokeCount: z.number().int().min(1).max(64).optional().nullable(),
  /** Bộ thủ */
  radical: z.string().trim().max(10).optional().nullable(),
  example: z.string().trim().max(500).optional().nullable(),
  examplePinyin: z.string().trim().max(500).optional().nullable(),
  exampleTranslation: z.string().trim().max(500).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
});

export const chineseDeckFileSchema = z.object({
  deck: z.object({
    name: z.string().trim().min(1, "Deck thiếu tên").max(80),
    description: z.string().trim().max(300).optional().nullable(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Màu phải dạng hex #RRGGBB")
      .optional(),
    icon: z.string().max(8).optional().nullable(),
  }),
  cards: z.array(chineseCardSchema).min(1, "Deck phải có ít nhất 1 thẻ"),
});

export type ChineseCardInput = z.infer<typeof chineseCardSchema>;
export type ChineseDeckFile = z.infer<typeof chineseDeckFileSchema>;

/** Parse + validate cấu trúc; sai định dạng thì ném ZodError. */
export function parseChineseDeckFile(raw: unknown): ChineseDeckFile {
  return chineseDeckFileSchema.parse(raw);
}

/** Câu ví dụ (nếu có) phải chứa chính chữ Hán của thẻ. */
export function exampleContainsWord(card: {
  word: string;
  example?: string | null;
}): boolean {
  const example = card.example?.trim();
  if (!example) return true;
  return example.includes(card.word.trim());
}

/**
 * Kiểm tra toàn bộ file và trả về danh sách lỗi (rỗng = đạt).
 * Không ném ngoại lệ để script `--check` in được mọi lỗi cùng lúc.
 */
export function validateChineseDeckFile(raw: unknown): string[] {
  const parsed = chineseDeckFileSchema.safeParse(raw);
  if (!parsed.success) {
    return parsed.error.issues.map(
      (issue) => `${issue.path.join(".") || "(gốc)"}: ${issue.message}`,
    );
  }

  const errors: string[] = [];
  const seen = new Set<string>();

  for (const card of parsed.data.cards) {
    const word = card.word.trim();
    if (seen.has(word)) {
      errors.push(`Chữ "${word}" bị trùng trong cùng deck`);
    }
    seen.add(word);

    if (!exampleContainsWord(card)) {
      errors.push(`Câu ví dụ của "${word}" không chứa chữ ${word}`);
    }
  }

  return errors;
}
