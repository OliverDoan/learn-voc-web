import type { Card } from "@/lib/types";

// Chỗ trống hiển thị trong câu gap-fill
export const GAP_PLACEHOLDER = "____";

export interface GapFill {
  /** Từ cần điền (đáp án đúng) */
  answer: string;
  /** Câu ví dụ đã khoét chỗ trống tại vị trí từ vựng */
  masked: string;
  /** Bản dịch câu ví dụ (nếu có) — dùng làm gợi ý ngữ cảnh */
  translation: string | null;
}

// Escape các ký tự đặc biệt của regex trong từ vựng (vd: "give up", "co-operate")
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Tạo bài điền-từ-vào-chỗ-trống từ câu ví dụ của card.
 * Khoét bỏ lần xuất hiện đầu tiên của từ vựng (so khớp nguyên từ, không phân biệt hoa thường).
 * Trả về `null` nếu card không có ví dụ hoặc ví dụ không chứa đúng từ.
 */
export function buildGapFill(card: Card): GapFill | null {
  const example = card.example?.trim();
  const word = card.word.trim();
  if (!example || !word) return null;

  const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  if (!re.test(example)) return null;

  return {
    answer: word,
    masked: example.replace(re, GAP_PLACEHOLDER),
    translation: card.exampleTranslation?.trim() || null,
  };
}

/** Lọc các card đủ điều kiện chơi gap-fill (có ví dụ chứa từ vựng). */
export function gapFillEligibleCards(cards: readonly Card[]): Card[] {
  return cards.filter((c) => buildGapFill(c) !== null);
}
