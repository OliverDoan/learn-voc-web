import { extractWords } from "@/lib/story-parser";
import { highlightEnglish } from "@/lib/story-english";
import { resolveStoryViewMode, type StoryViewMode } from "@/lib/story-view";

const normalize = (word: string) => word.trim().toLowerCase();

/** Bỏ trùng, giữ lần xuất hiện đầu tiên (so khớp không phân biệt hoa thường). */
function uniqueInOrder(words: string[]): string[] {
  const seen = new Set<string>();
  return words.filter((w) => {
    const key = normalize(w);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Thứ tự từ vựng (dạng gốc của thẻ) theo đúng bản truyện đang hiển thị.
 * English: theo bản tiếng Anh, từ không bắt được (dạng bất quy tắc) nối theo thứ tự bản chêm.
 * Chêm / Tiếng Việt: theo markup `[[word|nghĩa]]` của bản chêm.
 */
export function storyWordOrder(
  content: string,
  contentEn: string | null | undefined,
  mode: StoryViewMode,
): string[] {
  const chamOrder = extractWords(content).map((w) => w.word);
  if (resolveStoryViewMode(mode, contentEn) !== "en" || !contentEn) {
    return uniqueInOrder(chamOrder);
  }
  const enOrder = highlightEnglish(contentEn, content).flatMap((t) =>
    t.type === "word" ? [t.lemma ?? t.word] : [],
  );
  return uniqueInOrder([...enOrder, ...chamOrder]);
}

/**
 * Xếp thẻ theo thứ tự từ trong truyện; thẻ không có trong truyện giữ thứ tự gốc ở cuối.
 * Không đổi mảng đầu vào.
 */
export function sortCardsByStoryOrder<T extends { word: string }>(cards: T[], order: string[]): T[] {
  if (order.length === 0) return cards;
  const rank = new Map(order.map((w, i) => [normalize(w), i]));
  const rankOf = (card: T) => rank.get(normalize(card.word)) ?? Number.POSITIVE_INFINITY;
  // Array.prototype.sort ổn định nên thẻ cùng hạng (ngoài truyện) giữ thứ tự gốc.
  return [...cards].sort((a, b) => {
    const diff = rankOf(a) - rankOf(b);
    return Number.isNaN(diff) ? 0 : diff;
  });
}
