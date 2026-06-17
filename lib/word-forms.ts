import type { Card } from "@/lib/types";

// Các dạng từ loại hỗ trợ cho bài "biến đổi từ" (word formation)
export type WordFormPOS = "noun" | "verb" | "adjective" | "adverb";

export const WORD_FORM_ORDER: readonly WordFormPOS[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
];

export const WORD_FORM_LABEL: Record<WordFormPOS, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
};

export type WordForms = Partial<Record<WordFormPOS, string>>;

/** Parse JSON wordForms từ DB; bỏ qua giá trị rỗng/không phải chuỗi. */
export function parseWordForms(json: string | null | undefined): WordForms {
  if (!json) return {};
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    const result: WordForms = {};
    for (const pos of WORD_FORM_ORDER) {
      const value = raw[pos];
      if (typeof value === "string" && value.trim()) {
        result[pos] = value.trim();
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Chuẩn hoá object wordForms thành JSON string để lưu DB.
 * Trả `null` nếu không có dạng nào → lưu cột rỗng.
 */
export function stringifyWordForms(
  forms: Partial<Record<WordFormPOS, string | null | undefined>> | null | undefined,
): string | null {
  if (!forms) return null;
  const cleaned: WordForms = {};
  for (const pos of WORD_FORM_ORDER) {
    const value = forms[pos];
    if (typeof value === "string" && value.trim()) {
      cleaned[pos] = value.trim();
    }
  }
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : null;
}

export interface WordFormTarget {
  pos: WordFormPOS;
  label: string;
  answer: string;
}

/**
 * Lấy danh sách dạng từ có thể hỏi cho 1 card: các dạng tồn tại và KHÁC với từ gốc
 * (không hỏi lại chính từ người học đã thấy).
 */
export function getWordFormTargets(card: Card): WordFormTarget[] {
  const forms = parseWordForms(card.wordForms);
  const base = card.word.trim().toLowerCase();
  return WORD_FORM_ORDER.filter((pos) => {
    const value = forms[pos];
    return !!value && value.toLowerCase() !== base;
  }).map((pos) => ({
    pos,
    label: WORD_FORM_LABEL[pos],
    answer: forms[pos] as string,
  }));
}

/** Lọc card đủ điều kiện chơi word formation (có ≥1 dạng từ khác từ gốc). */
export function wordFormEligibleCards(cards: readonly Card[]): Card[] {
  return cards.filter((c) => getWordFormTargets(c).length > 0);
}
