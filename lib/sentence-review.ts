/**
 * Tiện ích dò "từ ôn tập" (từ của các Unit trước) xuất hiện trong một câu ví dụ.
 * Dùng cho script sinh lại câu ví dụ có chêm từ cũ và để kiểm tra độ phủ.
 */

/** Escape ký tự đặc biệt của regex. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * Sinh các biến thể chia dạng thường gặp của một từ để dò trong câu
 * (số nhiều, quá khứ, V-ing...). Không cần đầy đủ ngữ pháp — chỉ đủ
 * để không bỏ sót khi câu dùng từ ở dạng biến đổi.
 */
export function wordVariants(word: string): string[] {
  const base = word.trim().toLowerCase();
  if (!base) return [];
  // Cụm từ (vd "give up") — không chia dạng, chỉ khớp nguyên cụm.
  if (/\s/.test(base)) return [base];

  const out = new Set<string>([base, `${base}s`, `${base}es`, `${base}ed`, `${base}ing`]);

  const last = base[base.length - 1];
  const beforeLast = base[base.length - 2];

  if (last === "e") {
    const stem = base.slice(0, -1);
    out.add(`${stem}ing`);
    out.add(`${base}d`);
  }
  if (last === "y" && beforeLast && !VOWELS.has(beforeLast)) {
    const stem = base.slice(0, -1);
    out.add(`${stem}ies`);
    out.add(`${stem}ied`);
  }
  // Nhân đôi phụ âm cuối: stop → stopped/stopping
  if (
    base.length >= 3 &&
    !VOWELS.has(last) &&
    last !== "y" &&
    last !== "w" &&
    beforeLast &&
    VOWELS.has(beforeLast)
  ) {
    out.add(`${base}${last}ed`);
    out.add(`${base}${last}ing`);
  }

  return [...out];
}

/** Câu có chứa từ này (kể cả dạng biến đổi thường gặp) không? */
export function containsWord(sentence: string, word: string): boolean {
  const variants = wordVariants(word);
  if (variants.length === 0) return false;
  // Sắp xếp dài trước để "studies" không bị "study" chặn (không ảnh hưởng kết quả, chỉ cho rõ ý).
  const pattern = variants
    .sort((a, b) => b.length - a.length)
    .map((v) => escapeRegExp(v).replace(/\\?\s+/g, "\\s+"))
    .join("|");
  return new RegExp(`\\b(?:${pattern})\\b`, "i").test(sentence);
}

/** Các từ trong `words` có xuất hiện trong câu (không trùng lặp, giữ thứ tự đầu vào). */
export function findReviewWords(sentence: string, words: readonly string[]): string[] {
  const seen = new Set<string>();
  const found: string[] = [];
  for (const w of words) {
    const key = w.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (containsWord(sentence, w)) found.push(w);
  }
  return found;
}
