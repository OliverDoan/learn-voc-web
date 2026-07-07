import { describe, expect, it } from "vitest";
import {
  allExercisesDone,
  buildExerciseStatus,
  eligibleActivities,
  isActivityDone,
  requiredExerciseCount,
  type ActivityRecord,
} from "../deck-activities";
import type { Card } from "../types";

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: Math.random().toString(36).slice(2),
    deckId: "d1",
    word: "happy",
    meaning: "vui",
    partOfSpeech: "adjective",
    rootWord: null,
    rootWordMeaning: null,
    phonetic: null,
    example: null,
    exampleTranslation: null,
    note: null,
    imageUrl: null,
    audioUrl: null,
    tags: "[]",
    wordForms: null,
    wordFormMeanings: null,
    synonyms: null,
    antonyms: null,
    favorite: false,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: "2026-06-29T00:00:00Z",
    state: "NEW",
    lapses: 0,
    deletedAt: null,
    createdAt: "2026-06-29T00:00:00Z",
    updatedAt: "2026-06-29T00:00:00Z",
    ...overrides,
  };
}

describe("eligibleActivities", () => {
  it("deck rỗng → không có dạng nào", () => {
    expect(eligibleActivities([])).toEqual([]);
  });

  it("1 thẻ cơ bản → có flashcards/typing/listening/pronounce (KHÔNG tính Học SRS)", () => {
    const e = eligibleActivities([makeCard()]);
    expect(e).not.toContain("study"); // Học (SRS) không tính vào tiến độ
    expect(e).toContain("flashcards");
    expect(e).toContain("typing");
    expect(e).toContain("listening");
    expect(e).toContain("pronounce");
    // chưa đủ 4 thẻ
    expect(e).not.toContain("multiple-choice");
    expect(e).not.toContain("test");
    expect(e).not.toContain("matching");
  });

  it("≥4 thẻ mở trắc nghiệm + làm bài; ≥6 thẻ mở ghép cặp", () => {
    const four = Array.from({ length: 4 }, () => makeCard());
    expect(eligibleActivities(four)).toContain("multiple-choice");
    expect(eligibleActivities(four)).toContain("test");
    expect(eligibleActivities(four)).not.toContain("matching");

    const six = Array.from({ length: 6 }, () => makeCard());
    expect(eligibleActivities(six)).toContain("matching");
  });

  it("thẻ có câu ví dụ chứa từ → mở điền từ", () => {
    const card = makeCard({ word: "happy", example: "She is very happy today." });
    expect(eligibleActivities([card])).toContain("gap-fill");
  });

  it("KHÔNG tính biến đổi từ vào tiến độ, kể cả khi thẻ có word forms", () => {
    const card = makeCard({ word: "happy", wordForms: JSON.stringify({ noun: "happiness" }) });
    expect(eligibleActivities([card])).not.toContain("word-formation");
  });

  it("deck có truyện chứa từ chêm → mở điền truyện chêm", () => {
    expect(eligibleActivities([makeCard()], { hasStoryWithWords: true })).toContain("story-fill");
    // Không cần thẻ — chỉ cần truyện có từ chêm.
    expect(eligibleActivities([], { hasStoryWithWords: true })).toContain("story-fill");
  });

  it("deck không có truyện (hoặc truyện không từ chêm) → không có điền truyện chêm", () => {
    expect(eligibleActivities([makeCard()])).not.toContain("story-fill");
    expect(eligibleActivities([makeCard()], { hasStoryWithWords: false })).not.toContain(
      "story-fill",
    );
  });
});

describe("requiredExerciseCount", () => {
  it("cho phép thiếu 1 dạng, nhưng luôn cần ít nhất 1", () => {
    expect(requiredExerciseCount(0)).toBe(0);
    expect(requiredExerciseCount(1)).toBe(1); // 1 dạng thì phải làm dạng đó
    expect(requiredExerciseCount(2)).toBe(1);
    expect(requiredExerciseCount(5)).toBe(4); // 4/5
    expect(requiredExerciseCount(10)).toBe(9); // 9/10
  });
});

describe("isActivityDone", () => {
  it("dạng chấm điểm: cần accuracy ≥ 80", () => {
    const recs: ActivityRecord[] = [{ activity: "typing", bestAccuracy: 79 }];
    expect(isActivityDone("typing", recs)).toBe(false);
    expect(isActivityDone("typing", [{ activity: "typing", bestAccuracy: 80 }])).toBe(true);
  });

  it("dạng không chấm điểm: chỉ cần có bản ghi", () => {
    expect(isActivityDone("flashcards", [{ activity: "flashcards", bestAccuracy: null }])).toBe(true);
    expect(isActivityDone("matching", [])).toBe(false);
  });
});

describe("allExercisesDone & buildExerciseStatus", () => {
  it("chưa làm gì → chưa xong", () => {
    const cards = [makeCard()];
    expect(allExercisesDone(cards, [])).toBe(false);
    const { exercises, allDone } = buildExerciseStatus(cards, []);
    expect(allDone).toBe(false);
    expect(exercises.every((e) => !e.done)).toBe(true);
  });

  it("làm hết các dạng khả dụng (đạt ngưỡng) → xong", () => {
    const cards = [makeCard()]; // flashcards, typing, listening, pronounce
    const records: ActivityRecord[] = [
      { activity: "flashcards", bestAccuracy: null },
      { activity: "typing", bestAccuracy: 85 },
      { activity: "listening", bestAccuracy: 100 },
      { activity: "pronounce", bestAccuracy: 80 },
    ];
    expect(allExercisesDone(cards, records)).toBe(true);
    expect(buildExerciseStatus(cards, records).allDone).toBe(true);
  });

  it("thiếu đúng 1 dạng (dưới ngưỡng) → vẫn đủ mở khóa", () => {
    const cards = [makeCard()]; // 4 dạng khả dụng → cần 3/4
    const records: ActivityRecord[] = [
      { activity: "flashcards", bestAccuracy: null },
      { activity: "typing", bestAccuracy: 70 }, // < 80 → coi như chưa làm
      { activity: "listening", bestAccuracy: 100 },
      { activity: "pronounce", bestAccuracy: 80 },
    ];
    expect(allExercisesDone(cards, records)).toBe(true);
    expect(buildExerciseStatus(cards, records).allDone).toBe(true);
  });

  it("thiếu 2 dạng → chưa đủ mở khóa", () => {
    const cards = [makeCard()]; // 4 dạng khả dụng → cần 3/4
    const records: ActivityRecord[] = [
      { activity: "flashcards", bestAccuracy: null },
      { activity: "typing", bestAccuracy: 70 }, // < 80
      { activity: "listening", bestAccuracy: 100 },
      { activity: "pronounce", bestAccuracy: 50 }, // < 80
    ];
    expect(allExercisesDone(cards, records)).toBe(false);
    expect(buildExerciseStatus(cards, records).allDone).toBe(false);
  });

  it("deck có truyện (5 dạng): thiếu 1 vẫn mở khóa, thiếu 2 thì không", () => {
    const cards = [makeCard()]; // + story-fill → 5 dạng, cần 4/5
    const base: ActivityRecord[] = [
      { activity: "flashcards", bestAccuracy: null },
      { activity: "typing", bestAccuracy: 85 },
      { activity: "listening", bestAccuracy: 100 },
      { activity: "pronounce", bestAccuracy: 80 },
    ];
    // Thiếu story-fill (1 dạng) → vẫn đủ mở khóa
    expect(allExercisesDone(cards, base, { hasStoryWithWords: true })).toBe(true);
    // Thiếu thêm 1 dạng nữa (pronounce dưới ngưỡng) → không đủ
    const missTwo = base.map((r) =>
      r.activity === "pronounce" ? { ...r, bestAccuracy: 50 } : r,
    );
    expect(allExercisesDone(cards, missTwo, { hasStoryWithWords: true })).toBe(false);
  });
});
