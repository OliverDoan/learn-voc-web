// Lịch sử làm bài "Kiểm tra" trong từng deck — CHỈ lưu các từ SAI,
// giữ tối đa 3 lần gần nhất. Lưu ở localStorage (client-only), tách theo deckId.

export const MAX_ATTEMPTS = 3;
const keyOf = (deckId: string): string => `voc-test-history-${deckId}`;

/** Bắn ra khi lịch sử kiểm tra của một deck thay đổi (thêm/xoá) — để UI cùng tab
 *  tự cập nhật (vd ẩn/hiện nút "Lịch sử sai"). */
export const TEST_HISTORY_EVENT = "voc-test-history-changed";

function emitHistoryChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TEST_HISTORY_EVENT));
  }
}

/** Có ít nhất một lần kiểm tra đã lưu cho deck này chưa (đọc thuần, không ghi). */
export function hasTestHistory(deckId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(keyOf(deckId));
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/** Một từ trả lời sai trong một lần kiểm tra. */
export interface TestWrongItem {
  cardId: string;
  meaning: string;
  word: string; // đáp án đúng
  yourAnswer: string; // người dùng đã gõ ("" nếu bỏ trống)
  wordWrong: boolean; // gõ sai/thiếu từ
  posWrong: boolean; // chọn sai từ loại
  correctPos: string; // từ loại đúng (vd "noun / verb")
  yourPos: string; // từ loại người dùng chọn ("" nếu chưa chọn)
}

/** Một lần bấm "Chấm điểm" có ít nhất một từ sai. */
export interface TestAttempt {
  at: number; // Date.now()
  total: number;
  correct: number;
  wrong: TestWrongItem[];
}

export function loadTestHistory(deckId: string): TestAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyOf(deckId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const all = parsed as TestAttempt[];
    const trimmed = all.slice(0, MAX_ATTEMPTS);
    // Nếu dữ liệu cũ nhiều hơn 3 → ghi đè lại để tự xoá phần thừa khỏi localStorage.
    if (trimmed.length < all.length) {
      try {
        window.localStorage.setItem(keyOf(deckId), JSON.stringify(trimmed));
      } catch {
        // Bỏ qua khi không ghi được.
      }
    }
    return trimmed;
  } catch {
    // JSON hỏng hoặc localStorage không dùng được → coi như chưa có lịch sử.
    return [];
  }
}

/** Thêm một lần kiểm tra mới lên đầu, cắt còn 10 lần gần nhất, trả về mảng mới. */
export function addTestAttempt(deckId: string, attempt: TestAttempt): TestAttempt[] {
  const next = [attempt, ...loadTestHistory(deckId)].slice(0, MAX_ATTEMPTS);
  try {
    window.localStorage.setItem(keyOf(deckId), JSON.stringify(next));
  } catch {
    // Bỏ qua khi không ghi được (vd chế độ riêng tư đầy quota).
  }
  emitHistoryChange();
  return next;
}

export function clearTestHistory(deckId: string): void {
  try {
    window.localStorage.removeItem(keyOf(deckId));
  } catch {
    // Bỏ qua.
  }
  emitHistoryChange();
}
