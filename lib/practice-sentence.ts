import { MIN_SENTENCE_WORDS, tokenizeSentence } from "@/lib/sentence-writing";
import type { CardWithPractice, PracticeSentence } from "@/lib/types";

/** Một câu trong bài luyện viết: đề tiếng Việt → đáp án tiếng Anh. */
export interface PracticeItem {
  /** ID của PracticeSentence — khoá duy nhất của câu (không phải cardId). */
  id: string;
  cardId: string;
  /** Từ vựng của thẻ — dùng làm gợi ý cấp 1. */
  word: string;
  /** Nghĩa tiếng Việt của từ vựng. */
  meaning: string;
  /** Câu tiếng Việt làm đề bài. */
  prompt: string;
  /** Câu tiếng Anh đúng. */
  answer: string;
  /** Các từ đã học ở Unit cũ được chêm trong câu. */
  reviewWords: string[];
}

/** Đọc JSON array từ ôn tập; dữ liệu hỏng/không phải mảng chuỗi → mảng rỗng. */
export function parsePracticeReviewWords(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((w): w is string => typeof w === "string")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
  } catch {
    // JSON hỏng → coi như không có từ ôn tập.
    return [];
  }
}

/** Câu đủ điều kiện làm bài: có cả đề lẫn đáp án, và câu tiếng Anh đủ dài. */
function isUsable(sentence: PracticeSentence): boolean {
  const answer = sentence.english?.trim() ?? "";
  const prompt = sentence.vietnamese?.trim() ?? "";
  if (!answer || !prompt) return false;
  return tokenizeSentence(answer).length >= MIN_SENTENCE_WORDS;
}

/** Các câu luyện hợp lệ của một thẻ, đã sắp theo `order`. */
function usableSentences(card: CardWithPractice): PracticeSentence[] {
  return [...(card.practiceSentences ?? [])]
    .filter(isUsable)
    .sort((a, b) => a.order - b.order);
}

/**
 * Gộp toàn bộ câu luyện của danh sách thẻ thành một mảng item phẳng.
 * Giữ thứ tự thẻ đầu vào, trong mỗi thẻ sắp theo `order` của câu.
 */
export function buildPracticeItems(cards: readonly CardWithPractice[]): PracticeItem[] {
  return cards.reduce<PracticeItem[]>((items, card) => {
    const next = usableSentences(card).map((s) => ({
      id: s.id,
      cardId: card.id,
      word: card.word.trim(),
      meaning: card.meaning.trim(),
      prompt: s.vietnamese.trim(),
      answer: s.english.trim(),
      reviewWords: parsePracticeReviewWords(s.reviewWords),
    }));
    return next.length === 0 ? items : [...items, ...next];
  }, []);
}

/** Thẻ có ít nhất một câu luyện dùng được. */
export function practiceEligibleCards(
  cards: readonly CardWithPractice[],
): CardWithPractice[] {
  return cards.filter((c) => usableSentences(c).length > 0);
}

/** Số câu luyện hợp lệ của từng thẻ, khoá theo cardId (thẻ không có câu thì không có khoá). */
export function practiceItemsByCard(
  cards: readonly CardWithPractice[],
): Map<string, number> {
  return cards.reduce((map, card) => {
    const count = usableSentences(card).length;
    if (count > 0) map.set(card.id, count);
    return map;
  }, new Map<string, number>());
}

/**
 * Xáo trộn có seed (Fisher–Yates + PRNG mulberry32).
 * Cùng seed luôn cho cùng thứ tự, nên danh sách câu KHÔNG bị xáo lại khi
 * query được refetch giữa phiên làm bài. Không đổi mảng gốc.
 */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  // mulberry32: PRNG 32-bit nhỏ gọn, đủ ngẫu nhiên cho việc xáo bài.
  let state = Math.floor(seed * 2 ** 32) >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
