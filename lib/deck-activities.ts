import { gapFillEligibleCards } from "@/lib/gap-fill";
import type { Card } from "@/lib/types";

/** Ngưỡng độ chính xác tối thiểu để coi một dạng bài tập (có chấm điểm) là "đã làm". */
export const EXERCISE_PASS_ACCURACY = 80;

/**
 * Số dạng được phép BỎ QUA mà vẫn mở khóa được deck.
 * Nới điều kiện: chỉ cần làm 9/10 dạng (thiếu tối đa 1) là mở khóa được.
 */
export const EXERCISE_UNLOCK_ALLOWANCE = 1;

/**
 * Số dạng tối thiểu phải hoàn thành để mở khóa deck, dựa trên tổng số dạng khả dụng.
 * Cho phép thiếu {@link EXERCISE_UNLOCK_ALLOWANCE} dạng, nhưng luôn cần ít nhất 1 dạng.
 */
export function requiredExerciseCount(total: number): number {
  if (total <= 0) return 0;
  return Math.max(1, total - EXERCISE_UNLOCK_ALLOWANCE);
}

export type DeckActivityKey =
  | "study"
  | "multiple-choice"
  | "typing"
  | "listening"
  | "gap-fill"
  | "story-fill"
  | "word-formation"
  | "matching"
  | "test"
  | "flashcards"
  | "pronounce";

export interface ActivityDef {
  key: DeckActivityKey;
  label: string;
  /** true = cần đạt accuracy ≥ ngưỡng; false = chỉ cần hoàn thành 1 lần. */
  scored: boolean;
}

/** Danh sách tất cả dạng hoạt động của một deck (thứ tự hiển thị). */
export const DECK_ACTIVITIES: readonly ActivityDef[] = [
  { key: "study", label: "Học (SRS)", scored: true },
  { key: "flashcards", label: "Lật thẻ", scored: false },
  { key: "multiple-choice", label: "Trắc nghiệm", scored: true },
  { key: "typing", label: "Gõ từ", scored: true },
  { key: "listening", label: "Nghe", scored: true },
  { key: "gap-fill", label: "Điền từ vào câu", scored: true },
  { key: "story-fill", label: "Điền truyện chêm", scored: true },
  { key: "word-formation", label: "Biến đổi từ", scored: true },
  { key: "matching", label: "Ghép cặp", scored: false },
  { key: "test", label: "Làm bài", scored: false },
  { key: "pronounce", label: "Phát âm", scored: true },
];

const ACTIVITY_BY_KEY = new Map(DECK_ACTIVITIES.map((a) => [a.key, a]));

/** URL để làm ngay một dạng bài tập của deck (dùng cho deep-link từ thanh tiến độ). */
export function activityHref(key: DeckActivityKey | string, deckId: string): string {
  switch (key) {
    case "study":
      return `/study/${deckId}`;
    case "flashcards":
      return `/flashcards/${deckId}`;
    case "pronounce":
      return `/pronounce/${deckId}`;
    case "story-fill":
      // Trang trung gian: 1 truyện → vào thẳng, nhiều truyện → chọn truyện.
      return `/story-fill/${deckId}`;
    default:
      // Các dạng quiz: trang quiz đọc ?mode= để vào thẳng dạng bài.
      return `/quiz/${deckId}?mode=${key}`;
  }
}

export function getActivityDef(key: string): ActivityDef | undefined {
  return ACTIVITY_BY_KEY.get(key as DeckActivityKey);
}

export const DECK_ACTIVITY_KEYS = DECK_ACTIVITIES.map((a) => a.key);

/** Dữ kiện thêm (ngoài thẻ) để xác định dạng bài khả dụng. */
export interface ActivityContext {
  /** Deck có ít nhất 1 truyện chêm chứa từ chêm → mở "Điền truyện chêm". */
  hasStoryWithWords?: boolean;
}

/**
 * Xác định những dạng bài tập KHẢ DỤNG cho một deck dựa trên thẻ hiện có.
 * Chỉ những dạng khả dụng mới được tính vào "đã làm hết bài tập".
 */
export function eligibleActivities(
  cards: readonly Card[],
  ctx: ActivityContext = {},
): DeckActivityKey[] {
  const n = cards.length;
  const result: DeckActivityKey[] = [];

  if (n >= 1) {
    result.push("flashcards", "typing", "listening", "pronounce");
  }
  if (n >= 4) result.push("multiple-choice", "test");
  if (n >= 6) result.push("matching");
  if (gapFillEligibleCards(cards).length >= 1) result.push("gap-fill");
  // Điền truyện chêm: cần truyện có từ chêm, không phụ thuộc số thẻ.
  if (ctx.hasStoryWithWords) result.push("story-fill");
  // "Học (SRS)" (study) và "Biến đổi từ" (word-formation) KHÔNG tính vào tiến độ /
  // điều kiện mở khóa (vẫn học/chơi được bình thường ở trang tương ứng).

  // Giữ theo thứ tự trong DECK_ACTIVITIES cho ổn định khi hiển thị.
  return DECK_ACTIVITY_KEYS.filter((k) => result.includes(k));
}

/** Bản ghi hoàn thành một dạng (từ DB). */
export interface ActivityRecord {
  activity: string;
  bestAccuracy: number | null;
  // JSON array ID thẻ sai lần gần nhất (tuỳ chọn — cũ có thể chưa có cột này)
  wrongCardIds?: string | null;
}

/** Parse an toàn cột wrongCardIds (JSON string) thành mảng ID. */
export function parseWrongCardIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Một dạng được coi là "đã làm xong" chưa?
 * - scored: cần có bản ghi và bestAccuracy ≥ ngưỡng.
 * - không scored: chỉ cần có bản ghi (đã hoàn thành ít nhất 1 lần).
 */
export function isActivityDone(
  key: DeckActivityKey,
  records: readonly ActivityRecord[],
): boolean {
  const rec = records.find((r) => r.activity === key);
  if (!rec) return false;
  const def = ACTIVITY_BY_KEY.get(key);
  if (def?.scored) return (rec.bestAccuracy ?? 0) >= EXERCISE_PASS_ACCURACY;
  return true;
}

/**
 * Đã đủ điều kiện mở khóa deck chưa?
 * Nới điều kiện: chỉ cần làm được ≥ {@link requiredExerciseCount} dạng khả dụng
 * (thiếu tối đa {@link EXERCISE_UNLOCK_ALLOWANCE} dạng, tức 9/10) là đủ.
 */
export function allExercisesDone(
  cards: readonly Card[],
  records: readonly ActivityRecord[],
  ctx: ActivityContext = {},
): boolean {
  const eligible = eligibleActivities(cards, ctx);
  if (eligible.length === 0) return false;
  const doneCount = eligible.filter((k) => isActivityDone(k, records)).length;
  return doneCount >= requiredExerciseCount(eligible.length);
}

/** Trạng thái 1 dạng bài tập khả dụng (để hiển thị thanh progress). */
export interface ExerciseStatus {
  key: DeckActivityKey;
  label: string;
  scored: boolean;
  done: boolean;
  bestAccuracy: number | null;
  // ID các thẻ làm sai ở lần gần nhất (để đánh dấu khi làm lại)
  wrongCardIds: string[];
}

/** Dựng danh sách trạng thái các dạng khả dụng + cờ đã hoàn thành hết. */
export function buildExerciseStatus(
  cards: readonly Card[],
  records: readonly ActivityRecord[],
  ctx: ActivityContext = {},
): { exercises: ExerciseStatus[]; allDone: boolean } {
  const byKey = new Map(records.map((r) => [r.activity, r]));
  const exercises = eligibleActivities(cards, ctx).map((key) => {
    const def = ACTIVITY_BY_KEY.get(key)!;
    return {
      key,
      label: def.label,
      scored: def.scored,
      done: isActivityDone(key, records),
      bestAccuracy: byKey.get(key)?.bestAccuracy ?? null,
      wrongCardIds: parseWrongCardIds(byKey.get(key)?.wrongCardIds),
    };
  });
  const doneCount = exercises.filter((e) => e.done).length;
  return {
    exercises,
    allDone: exercises.length > 0 && doneCount >= requiredExerciseCount(exercises.length),
  };
}
