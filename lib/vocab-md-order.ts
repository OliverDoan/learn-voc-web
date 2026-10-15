const normalize = (word: string) => word.trim().toLowerCase();

/**
 * Đọc thứ tự từ trong file `vocab-unit-*.md` (`## Unit N: ...` + dòng `i. word (loại): nghĩa`).
 * Trả về Map: số Unit → danh sách từ (đã chuẩn hoá) theo đúng thứ tự trong file.
 */
export function parseVocabMdOrder(markdown: string): Map<number, string[]> {
  const units = new Map<number, string[]>();
  let current: string[] | null = null;

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^## Unit (\d+):/);
    if (heading) {
      current = [];
      units.set(Number(heading[1]), current);
      continue;
    }
    const item = line.match(/^\d+\.\s+([^(:]+)/);
    if (item && current) current.push(normalize(item[1]));
  }

  return units;
}

export interface OrderPlan {
  /** id thẻ theo thứ tự mới — thẻ có trong file xếp trước, thẻ thiếu trong file giữ thứ tự cũ ở cuối. */
  orderedIds: string[];
  /** Từ có trong file nhưng không có thẻ tương ứng trong deck. */
  missingCards: string[];
  /** Thẻ trong deck nhưng không có trong file. */
  missingInFile: string[];
}

/** Sắp thẻ của một deck theo thứ tự từ trong file. `cards` truyền vào theo thứ tự hiện tại. */
export function planCardOrder(
  cards: { id: string; word: string }[],
  fileOrder: string[],
): OrderPlan {
  const idByWord = new Map(cards.map((c) => [normalize(c.word), c.id]));
  const used = new Set<string>();
  const orderedIds: string[] = [];
  const missingCards: string[] = [];

  for (const word of fileOrder) {
    const id = idByWord.get(word);
    if (!id) {
      missingCards.push(word);
    } else if (!used.has(id)) {
      used.add(id);
      orderedIds.push(id);
    }
  }

  const rest = cards.filter((c) => !used.has(c.id));
  return {
    orderedIds: [...orderedIds, ...rest.map((c) => c.id)],
    missingCards,
    missingInFile: rest.map((c) => c.word),
  };
}
