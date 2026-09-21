import { levenshtein } from "@/lib/utils";

/**
 * Logic cho bài "Điền từ chêm" (`/stories/[storyId]/fill`): chấm một ô và cho
 * biết ô đang ở trạng thái nào để tô nền — người làm nhìn ra ngay ô nào còn bỏ trống.
 */

/** Số lỗi gõ được bỏ qua khi chấm một ô. */
const TYPO_TOLERANCE = 1;

/** Trạng thái hiển thị của một ô trống. */
export type FillSlotState = "empty" | "filled" | "correct" | "wrong";

/** Câu trả lời có khớp từ cần điền không (bỏ qua hoa thường + 1 lỗi gõ)? */
export function isFillAnswerCorrect(value: string, word: string): boolean {
  const answer = value.trim().toLowerCase();
  if (!answer) return false;
  return levenshtein(answer, word.trim().toLowerCase()) <= TYPO_TOLERANCE;
}

interface FillSlotInput {
  value: string;
  word: string;
  submitted: boolean;
}

/**
 * Trạng thái của một ô. Trước khi nộp chỉ phân biệt đã điền / chưa điền —
 * KHÔNG tiết lộ đúng sai, tránh biến bài tập thành dò đáp án.
 */
export function fillSlotState({ value, word, submitted }: FillSlotInput): FillSlotState {
  if (!submitted) return value.trim() ? "filled" : "empty";
  return isFillAnswerCorrect(value, word) ? "correct" : "wrong";
}

/** Số ô đã điền trong danh sách câu trả lời. */
export function countFilled(values: readonly string[]): number {
  return values.filter((v) => v.trim().length > 0).length;
}
