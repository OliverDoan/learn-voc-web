/**
 * Kiểm tra liên Unit (/exam): chọn nhiều Unit + số từ, random từ rồi làm
 * bảng kiểm tra (nghĩa Việt → từ Anh + từ loại).
 */

import { getDeckUnitNumber } from "@/lib/deck-progress";

/** Khoá lịch sử từ sai của trang kiểm tra (lib/test-history.ts, theo "deck" ảo). */
export const EXAM_HISTORY_KEY = "exam";

/** Trần số từ một bài kiểm tra. */
export const EXAM_MAX_COUNT = 500;

/** Mức số từ chọn nhanh trên trang kiểm tra. */
export const EXAM_COUNT_PRESETS: readonly number[] = [10, 20, 30, 50, 100];

interface DeckScopedCard {
  id: string;
  deckId: string;
}

/**
 * Lọc thẻ theo Unit đã chọn, xáo Fisher–Yates rồi cắt `count` thẻ đầu
 * (null = lấy tất cả). Không đổi mảng gốc.
 */
export function sampleExamCards<T extends DeckScopedCard>(
  cards: readonly T[],
  deckIds: readonly string[],
  count: number | null,
  random: () => number = Math.random,
): T[] {
  const selected = new Set(deckIds);
  const pool = cards.filter((c) => selected.has(c.deckId));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return count === null ? pool : pool.slice(0, count);
}

/** Xếp deck tăng dần theo số Unit (Unit 1 → 50); deck không có số Unit xuống cuối. */
export function sortDecksByUnit<T extends { name: string }>(decks: readonly T[]): T[] {
  const unitOf = (d: T) => getDeckUnitNumber(d.name) ?? Number.POSITIVE_INFINITY;
  return [...decks].sort((a, b) => unitOf(a) - unitOf(b) || a.name.localeCompare(b.name));
}
