// Cột tùy chỉnh dạng bảng (Excel-like) lưu ở Deck.customColumns dưới dạng JSON string.
// Mỗi cột: id + tên + map giá trị theo cardId.

export interface CustomColumn {
  id: string;
  name: string;
  values: Record<string, string>;
}

/** Parse Deck.customColumns (JSON string) → mảng cột. Trả [] nếu lỗi/rỗng. */
export function parseCustomColumns(json: string | null | undefined): CustomColumn[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data
      .filter((c): c is CustomColumn => !!c && typeof c.id === "string" && typeof c.name === "string")
      .map((c) => ({
        id: c.id,
        name: c.name,
        values:
          c.values && typeof c.values === "object" ? (c.values as Record<string, string>) : {},
      }));
  } catch {
    return [];
  }
}

export function stringifyCustomColumns(columns: CustomColumn[]): string {
  return JSON.stringify(columns);
}

/** Tạo id cột mới (ưu tiên crypto.randomUUID, fallback theo thời điểm). */
export function newColumnId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `col_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `col_${Math.floor(performance.now())}_${Math.floor(performance.now() % 1000)}`;
}
