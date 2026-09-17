import {
  buildSentenceWriting,
  gradeSentence,
  type SentenceGrade,
} from "@/lib/sentence-writing";
import type { Card } from "@/lib/types";

/**
 * Một hàng của bài kiểm tra "viết câu": đề là câu tiếng Việt,
 * đáp án là câu tiếng Anh gốc trong câu ví dụ của thẻ.
 */
export interface SentenceTestRow {
  cardId: string;
  /** Từ vựng của thẻ — hiện kèm để người dùng biết câu xoay quanh từ nào. */
  word: string;
  /** Câu tiếng Việt làm đề bài */
  prompt: string;
  /** Câu tiếng Anh đúng */
  answer: string;
}

/** Bảng câu người dùng gõ, khoá theo cardId. */
export type SentenceTestAnswers = Record<string, string>;

/** Kết quả chấm từng hàng, khoá theo cardId. */
export type SentenceTestResult = Record<string, SentenceGrade>;

export interface SentenceTestScore {
  correct: number;
  answered: number;
  total: number;
  percent: number;
}

/**
 * Lọc & dựng các hàng làm được bài viết câu (thẻ phải có câu ví dụ
 * kèm bản dịch tiếng Việt và đủ dài). Giữ nguyên thứ tự thẻ đầu vào.
 */
export function buildSentenceTestRows(cards: readonly Card[]): SentenceTestRow[] {
  return cards.reduce<SentenceTestRow[]>((rows, card) => {
    const task = buildSentenceWriting(card);
    if (!task) return rows;
    return [
      ...rows,
      { cardId: card.id, word: task.keyword, prompt: task.prompt, answer: task.answer },
    ];
  }, []);
}

/** Chấm toàn bộ bài: mỗi hàng nhận "correct" | "close" | "wrong". */
export function gradeSentenceTest(
  rows: readonly SentenceTestRow[],
  answers: SentenceTestAnswers,
): SentenceTestResult {
  return rows.reduce<SentenceTestResult>(
    (acc, row) => ({
      ...acc,
      [row.cardId]: gradeSentence(answers[row.cardId] ?? "", row.answer),
    }),
    {},
  );
}

/** "close" (chỉ sai chính tả nhẹ) vẫn được tính là đúng. */
export function isSentenceTestPass(grade: SentenceGrade): boolean {
  return grade === "correct" || grade === "close";
}

/** Tổng kết điểm: số câu đúng / đã nhập / tổng và phần trăm (làm tròn). */
export function sentenceTestScore(
  rows: readonly SentenceTestRow[],
  answers: SentenceTestAnswers,
): SentenceTestScore {
  const result = gradeSentenceTest(rows, answers);
  const correct = rows.filter((row) => isSentenceTestPass(result[row.cardId])).length;
  const answered = rows.filter((row) => (answers[row.cardId] ?? "").trim() !== "").length;
  const total = rows.length;
  return {
    correct,
    answered,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}
