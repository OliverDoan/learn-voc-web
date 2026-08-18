/**
 * "Học nhanh" — phiên ngắn có điểm dừng rõ ràng (mặc định 5 từ) cho những ngày
 * bận. Giới hạn truyền qua query `?quick=N` trên trang/API học.
 */

/** Số từ của nút "Học nhanh" mặc định. */
export const QUICK_PRESET = 5;

/** Trần an toàn để query string không kéo về cả deck. */
export const MAX_QUICK_LIMIT = 50;

/** Đọc `?quick=N` → số từ tối đa cho phiên, undefined nếu không dùng chế độ này. */
export function parseQuickLimit(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  if (!/^\d+(\.\d+)?$/.test(raw.trim())) return undefined;
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.min(value, MAX_QUICK_LIMIT);
}
