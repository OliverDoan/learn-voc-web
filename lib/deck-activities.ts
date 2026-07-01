import { gapFillEligibleCards } from "@/lib/gap-fill";
import type { Card } from "@/lib/types";

/** Ngưỡng độ chính xác tối thiểu để coi một dạng bài tập (có chấm điểm) là "đã làm". */
export const EXERCISE_PASS_ACCURACY = 80;

export type DeckActivityKey =
  | "study"
  | "multiple-choice"
  | "typing"
  | "listening"
  | "gap-fill"
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
  { key: "word-formation", label: "Biến đổi từ", scored: true },
  { key: "matching", label: "Ghép cặp", scored: false },
  { key: "test", label: "Làm bài", scored: false },
  { key: "pronounce", label: "Phát âm", scored: true },
];

const ACTIVITY_BY_KEY = new Map(DECK_ACTIVITIES.map((a) => [a.key, a]));

export function getActivityDef(key: string): ActivityDef | undefined {
  return ACTIVITY_BY_KEY.get(key as DeckActivityKey);
}

export const DECK_ACTIVITY_KEYS = DECK_ACTIVITIES.map((a) => a.key);

/**
 * Xác định những dạng bài tập KHẢ DỤNG cho một deck dựa trên thẻ hiện có.
 * Chỉ những dạng khả dụng mới được tính vào "đã làm hết bài tập".
 */
export function eligibleActivities(cards: readonly Card[]): DeckActivityKey[] {
  const n = cards.length;
  const result: DeckActivityKey[] = [];

  if (n >= 1) {
    result.push("study", "flashcards", "typing", "listening", "pronounce");
  }
  if (n >= 4) result.push("multiple-choice", "test");
  if (n >= 6) result.push("matching");
  if (gapFillEligibleCards(cards).length >= 1) result.push("gap-fill");
  // "Biến đổi từ" (word-formation) KHÔNG tính vào tiến độ / điều kiện mở khóa
  // (vẫn chơi được ở trang quiz nếu thẻ có dữ liệu word forms).

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

/** Đã làm hết TẤT CẢ dạng khả dụng của deck chưa? */
export function allExercisesDone(
  cards: readonly Card[],
  records: readonly ActivityRecord[],
): boolean {
  const eligible = eligibleActivities(cards);
  return eligible.length > 0 && eligible.every((k) => isActivityDone(k, records));
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
): { exercises: ExerciseStatus[]; allDone: boolean } {
  const byKey = new Map(records.map((r) => [r.activity, r]));
  const exercises = eligibleActivities(cards).map((key) => {
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
  return { exercises, allDone: exercises.length > 0 && exercises.every((e) => e.done) };
}
