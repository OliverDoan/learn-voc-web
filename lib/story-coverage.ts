import { extractWords } from "./story-parser";

export interface StoryCoverage {
  /** Đủ toàn bộ từ và không chêm từ lạ. */
  ok: boolean;
  /** Từ trong danh sách nhưng chưa được chêm vào truyện (giữ nguyên dạng gốc). */
  missing: string[];
  /** Từ có trong markup nhưng không thuộc danh sách (dạng như trong truyện). */
  unmatched: string[];
  /** Từ được chêm nhiều hơn 1 lần (dạng gốc trong danh sách). */
  duplicated: string[];
}

const normalize = (w: string) => w.trim().toLowerCase();

/**
 * So khớp các từ chêm `[[word|nghĩa]]` trong truyện với danh sách từ của deck.
 * So khớp không phân biệt hoa/thường và bỏ khoảng trắng dư ở hai đầu.
 */
export function checkStoryCoverage(content: string, words: readonly string[]): StoryCoverage {
  const wanted = new Map(words.map((w) => [normalize(w), w]));
  const tokens = extractWords(content).map((t) => t.word);

  const counts = tokens.reduce<Map<string, number>>((acc, w) => {
    const key = normalize(w);
    return new Map(acc).set(key, (acc.get(key) ?? 0) + 1);
  }, new Map());

  const missing = words.filter((w) => !counts.has(normalize(w)));
  const unmatched = tokens
    .filter((w) => !wanted.has(normalize(w)))
    .filter((w, idx, arr) => arr.findIndex((x) => normalize(x) === normalize(w)) === idx);
  const duplicated = words.filter((w) => (counts.get(normalize(w)) ?? 0) > 1);

  // `duplicated` KHÔNG làm fail: từ chêm 2 lần vẫn dùng được cho bài điền từ (2 ô cùng đáp án).
  return { ok: missing.length === 0 && unmatched.length === 0, missing, unmatched, duplicated };
}
