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

export interface GapFillHintState {
  /** Đã dùng gợi ý nào chưa (để gắn nhãn "có gợi ý" khi trả lời đúng). */
  used: boolean;
  /** Có hiện bản dịch tiếng Việt của câu không (bậc gợi ý đầu tiên). */
  showTranslation: boolean;
  /** Đáp án lộ dần ký tự đầu (vd "beg_____"); `null` khi chưa tới bậc lộ chữ. */
  maskedAnswer: string | null;
  /** Tổng số bậc gợi ý có thể dùng. */
  maxHints: number;
  /** Đã dùng hết gợi ý chưa. */
  exhausted: boolean;
  /** Mô tả bậc gợi ý kế tiếp (dùng cho tooltip nút bóng đèn). */
  nextHintLabel: string;
}

/**
 * Tính trạng thái gợi ý theo từng bậc cho bài điền từ.
 *
 * Bậc gợi ý tăng dần từ rẻ đến đắt:
 *   1. Bản dịch tiếng Việt của câu (chỉ khi card có `exampleTranslation`).
 *   2+. Lộ dần từng ký tự đầu của đáp án, tối đa `answer.length - 1` ký tự
 *       (luôn chừa lại ít nhất 1 ký tự để không lộ trọn đáp án).
 */
export function buildHintState(
  answer: string,
  hintLevel: number,
  hasTranslation: boolean,
): GapFillHintState {
  const letterHints = Math.max(1, answer.length - 1);
  const translationHints = hasTranslation ? 1 : 0;
  const maxHints = letterHints + translationHints;
  const level = Math.min(Math.max(hintLevel, 0), maxHints);

  const revealed = Math.max(0, level - translationHints);
  const maskedAnswer =
    revealed > 0
      ? answer
          .split("")
          .map((ch, i) => (i < revealed || ch === " " ? ch : "_"))
          .join("")
      : null;

  const exhausted = level >= maxHints;
  const nextHintLabel = exhausted
    ? "Đã dùng hết gợi ý"
    : level === 0 && hasTranslation
      ? "Hiện nghĩa tiếng Việt của câu"
      : `Hiện ${revealed + 1} ký tự đầu`;

  return {
    used: level > 0,
    showTranslation: hasTranslation && level > 0,
    maskedAnswer,
    maxHints,
    exhausted,
    nextHintLabel,
  };
}
