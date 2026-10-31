interface FavoriteFlag {
  id: string;
  favorite: boolean;
}

function isCardList(data: unknown): data is FavoriteFlag[] {
  return Array.isArray(data) && data.every((x) => x && typeof x === "object" && "id" in x && "favorite" in x);
}

/**
 * Bản cache mới với cờ yêu thích của thẻ `cardId` đã đổi — dùng cho cập nhật
 * lạc quan (ngôi sao đổi ngay, không chờ tải lại cả danh sách).
 * Dữ liệu không phải danh sách thẻ, hoặc không chứa thẻ đó, được trả nguyên tham chiếu.
 */
export function withFavorite(data: unknown, cardId: string, favorite: boolean): unknown {
  if (!isCardList(data) || !data.some((c) => c.id === cardId)) return data;
  return data.map((c) => (c.id === cardId ? { ...c, favorite } : c));
}
