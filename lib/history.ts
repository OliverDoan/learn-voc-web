// Tổng hợp "câu sai cần ôn" từ nhật ký các lượt làm bài (ExerciseAttempt).
// Cộng dồn số lần sai của mỗi thẻ qua tất cả các lượt (không ghi đè).

export interface AttemptWrongInfo {
  /** ID các thẻ làm sai trong lượt này */
  wrongCardIds: readonly string[];
  /** Thời điểm làm (ISO string) để lấy "lần sai gần nhất" */
  createdAt: string;
}

export interface WrongCardAgg {
  cardId: string;
  /** Tổng số lần thẻ này bị làm sai */
  wrongCount: number;
  /** Thời điểm sai gần nhất (ISO string) */
  lastWrongAt: string;
}

/**
 * Gom các lượt làm bài thành danh sách thẻ sai kèm số lần sai + lần sai gần nhất.
 * Sắp xếp theo số lần sai giảm dần, rồi theo lần sai gần nhất.
 */
export function aggregateWrongCards(
  attempts: readonly AttemptWrongInfo[],
): WrongCardAgg[] {
  const map = new Map<string, { wrongCount: number; lastWrongAt: string }>();

  for (const attempt of attempts) {
    for (const cardId of attempt.wrongCardIds) {
      const cur = map.get(cardId);
      if (cur) {
        cur.wrongCount += 1;
        if (attempt.createdAt > cur.lastWrongAt) cur.lastWrongAt = attempt.createdAt;
      } else {
        map.set(cardId, { wrongCount: 1, lastWrongAt: attempt.createdAt });
      }
    }
  }

  return Array.from(map.entries())
    .map(([cardId, v]) => ({ cardId, wrongCount: v.wrongCount, lastWrongAt: v.lastWrongAt }))
    .sort(
      (a, b) =>
        b.wrongCount - a.wrongCount ||
        (a.lastWrongAt < b.lastWrongAt ? 1 : a.lastWrongAt > b.lastWrongAt ? -1 : 0),
    );
}
