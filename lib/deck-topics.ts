import { getDeckUnitNumber } from "@/lib/deck-progress";
import type { DeckWithCounts } from "@/lib/types";

/** Số deck mỗi topic. */
export const DECKS_PER_TOPIC = 5;

/** Tên topic theo từng nhóm 5 unit (index 0 = Unit 1–5, ...). */
const TOPIC_NAMES: Record<number, string> = {
  0: "Học tập & Sự nghiệp",
  1: "Chi tiêu, Thủ đô & Nơi ở",
  2: "Du lịch, Văn hoá & Thời tiết",
  3: "Ẩm thực & Ăn uống lành mạnh",
  4: "Sức khỏe",
  5: "Thể thao & Giao thông",
};

export interface DeckTopicGroup {
  /** Khoá ổn định để render danh sách. */
  key: string;
  /** Index topic (0-based). null cho nhóm "Khác". */
  index: number | null;
  /** Tiêu đề topic, vd "Topic 1 · Unit 1–5: Học tập & Sự nghiệp". */
  title: string;
  decks: DeckWithCounts[];
}

/** Lấy số thứ tự Unit từ tên deck ("Unit 10: ..." → 10); không có → null. */
const unitNumber = getDeckUnitNumber;

/** Khoảng Unit của một topic (0-based index). Topic 0 → Unit 1–5. */
export function topicUnitRange(topicIndex: number): { from: number; to: number } {
  const from = topicIndex * DECKS_PER_TOPIC + 1;
  return { from, to: from + DECKS_PER_TOPIC - 1 };
}

/** Tiêu đề topic, vd "Topic 1 · Unit 1–5: Học tập & Sự nghiệp". */
export function topicTitle(topicIndex: number): string {
  const { from, to } = topicUnitRange(topicIndex);
  const name = TOPIC_NAMES[topicIndex];
  const label = name ? `: ${name}` : "";
  return `Topic ${topicIndex + 1} · Unit ${from}–${to}${label}`;
}

/** Tên chủ đề (không kèm số Unit) — dùng làm phụ đề, vd "Học tập & Sự nghiệp". */
export function topicName(topicIndex: number): string | null {
  return TOPIC_NAMES[topicIndex] ?? null;
}

/** deckId ảo của một topic để dùng cho route Học/Lật thẻ, vd `topic-0`. */
export function topicDeckId(topicIndex: number): string {
  return `topic-${topicIndex}`;
}

/** Parse deckId ảo `topic-N` → index topic (0-based); không hợp lệ → null. */
export function parseTopicDeckId(deckId: string): number | null {
  const match = /^topic-(\d+)$/.exec(deckId);
  return match ? Number(match[1]) : null;
}

/**
 * Gom các deck thành topic, mỗi topic gồm tối đa 5 unit liên tiếp
 * (Unit 1–5, 6–10, ...). Deck không có số Unit gom vào nhóm "Khác" đặt cuối.
 * Trong mỗi topic, deck sắp theo số Unit tăng dần.
 */
export function groupDecksByTopic(decks: DeckWithCounts[]): DeckTopicGroup[] {
  const byGroup = new Map<number, DeckWithCounts[]>();
  const others: DeckWithCounts[] = [];

  for (const deck of decks) {
    const unit = unitNumber(deck.name);
    if (unit === null) {
      others.push(deck);
      continue;
    }
    const groupIndex = Math.floor((unit - 1) / DECKS_PER_TOPIC);
    const list = byGroup.get(groupIndex) ?? [];
    list.push(deck);
    byGroup.set(groupIndex, list);
  }

  const groups: DeckTopicGroup[] = [...byGroup.keys()]
    .sort((a, b) => a - b)
    .map((groupIndex) => {
      const sorted = [...(byGroup.get(groupIndex) ?? [])].sort(
        (a, b) => (unitNumber(a.name) ?? 0) - (unitNumber(b.name) ?? 0),
      );
      return {
        key: `topic-${groupIndex}`,
        index: groupIndex,
        title: topicTitle(groupIndex),
        decks: sorted,
      };
    });

  if (others.length > 0) {
    groups.push({ key: "topic-other", index: null, title: "Khác", decks: others });
  }

  return groups;
}
