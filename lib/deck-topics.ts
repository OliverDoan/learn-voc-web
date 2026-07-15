import { getDeckUnitNumber } from "@/lib/deck-progress";
import type { DeckWithCounts } from "@/lib/types";

/** Số deck mỗi topic. */
const DECKS_PER_TOPIC = 5;

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
  /** Tiêu đề topic, vd "Topic 1 · Unit 1–5: Học tập & Sự nghiệp". */
  title: string;
  decks: DeckWithCounts[];
}

/** Lấy số thứ tự Unit từ tên deck ("Unit 10: ..." → 10); không có → null. */
const unitNumber = getDeckUnitNumber;

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
      const from = groupIndex * DECKS_PER_TOPIC + 1;
      const to = from + DECKS_PER_TOPIC - 1;
      const name = TOPIC_NAMES[groupIndex];
      const label = name ? `: ${name}` : "";
      const sorted = [...(byGroup.get(groupIndex) ?? [])].sort(
        (a, b) => (unitNumber(a.name) ?? 0) - (unitNumber(b.name) ?? 0),
      );
      return {
        key: `topic-${groupIndex}`,
        title: `Topic ${groupIndex + 1} · Unit ${from}–${to}${label}`,
        decks: sorted,
      };
    });

  if (others.length > 0) {
    groups.push({ key: "topic-other", title: "Khác", decks: others });
  }

  return groups;
}
