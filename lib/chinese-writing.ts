/**
 * Logic thuần cho "Luyện viết" chữ Hán (viết từng nét, chấm bằng hanzi-writer).
 */

/** Kết quả viết một chữ: số nét của chữ và số lần vẽ sai nét. */
export interface CharWritingResult {
  strokes: number;
  mistakes: number;
}

const HAN_RE = /\p{Script=Han}/u;

/**
 * Các chữ Hán phải viết của một từ, theo thứ tự. Bỏ ngoặc, dấu … và ký tự khác;
 * phần tuỳ chọn trong ngoặc vẫn viết, vd 没(有) → 没, 有.
 */
export function writableChars(word: string): string[] {
  return [...word].filter((ch) => HAN_RE.test(ch));
}

/**
 * Điểm (0–100) = tổng nét / (tổng nét + tổng lần sai). Tính gộp theo nét nên một lần
 * sai ở chữ nhiều nét bị trừ ít hơn ở chữ ít nét. Chưa viết chữ nào → 0.
 */
export function writingScore(results: readonly CharWritingResult[]): number {
  const strokes = results.reduce((sum, r) => sum + r.strokes, 0);
  const mistakes = results.reduce((sum, r) => sum + r.mistakes, 0);
  if (strokes === 0) return 0;
  return Math.round((strokes / (strokes + mistakes)) * 100);
}
