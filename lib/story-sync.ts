const normalizeTitle = (title: string) => title.trim().toLowerCase();

export interface ExclusiveSyncPlan {
  /** Tiêu đề (đã chuẩn hoá) → id truyện đã có trong DB, sẽ được ghi đè nội dung. */
  updateIdByTitle: Map<string, string>;
  /** Truyện của deck không có trong file — xoá vì file là nguồn duy nhất. */
  deleteIds: string[];
}

/**
 * File truyện đánh dấu `exclusive` là toàn bộ truyện của deck: truyện trùng tiêu đề thì
 * cập nhật nội dung, truyện còn lại trong DB thì xoá.
 */
export function planExclusiveSync(
  existing: readonly { id: string; title: string }[],
  fileTitles: readonly string[],
): ExclusiveSyncPlan {
  const wanted = new Set(fileTitles.map(normalizeTitle));
  const kept = existing.filter((s) => wanted.has(normalizeTitle(s.title)));
  return {
    updateIdByTitle: new Map(kept.map((s) => [normalizeTitle(s.title), s.id])),
    deleteIds: existing.filter((s) => !wanted.has(normalizeTitle(s.title))).map((s) => s.id),
  };
}
