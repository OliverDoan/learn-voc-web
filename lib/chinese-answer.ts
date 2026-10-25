/**
 * Chấm đáp án chế độ "Kiểm tra" của Deck China: hiện nghĩa tiếng Việt, người dùng
 * gõ Hán tự HOẶC pinyin. Pinyin không cần dấu thanh, khoảng trắng hay dấu nháy.
 */

/** Dấu lược trong mẫu câu, vd 太…了 / tài…le. */
const ELLIPSIS_RE = /…|\.{3}/g;

/**
 * Các cách viết chấp nhận được của một trường giáo trình:
 * - "/" ngăn các cách đọc khác nhau: "shéi/shuí" → shéi, shuí
 * - phần trong ngoặc là tuỳ chọn: "méi(yǒu)" → méiyǒu, méi
 */
function variants(text: string): string[] {
  return text.split("/").flatMap((alt) => [
    alt.replace(/[()]/g, ""),
    alt.replace(/\([^)]*\)/g, ""),
  ]);
}

/** Hán tự so sánh không tính khoảng trắng và dấu lược. */
function normalizeHanzi(s: string): string {
  return s.replace(ELLIPSIS_RE, "").replace(/\s+/g, "");
}

/** Pinyin chỉ giữ chữ cái a-z: bỏ dấu thanh, số thanh, khoảng trắng, dấu nháy; ü/v → u. */
function normalizePinyin(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/v/g, "u")
    .replace(/[^a-z]/g, "");
}

export function isChineseAnswerCorrect(
  card: { word: string; phonetic: string | null },
  input: string,
): boolean {
  const answer = input.trim();
  if (!answer) return false;

  const hanzi = normalizeHanzi(answer);
  if (variants(card.word).some((w) => normalizeHanzi(w) === hanzi)) return true;

  if (!card.phonetic) return false;
  const pinyin = normalizePinyin(answer);
  if (!pinyin) return false;
  return variants(card.phonetic).some((p) => normalizePinyin(p) === pinyin);
}
