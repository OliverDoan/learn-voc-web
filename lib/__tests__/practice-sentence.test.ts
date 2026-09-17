import { describe, expect, it } from "vitest";
import {
  buildPracticeItems,
  parsePracticeReviewWords,
  practiceEligibleCards,
  practiceItemsByCard,
  seededShuffle,
} from "@/lib/practice-sentence";
import type { CardWithPractice, PracticeSentence } from "@/lib/types";

function makeSentence(partial: Partial<PracticeSentence> = {}): PracticeSentence {
  return {
    id: "p1",
    cardId: "c1",
    english: "I have a good idea for the project.",
    vietnamese: "Tôi có một ý tưởng hay cho dự án.",
    reviewWords: '["project"]',
    order: 0,
    ...partial,
  };
}

function makeCard(partial: Partial<CardWithPractice> = {}): CardWithPractice {
  return {
    id: "c1",
    deckId: "d1",
    word: "idea",
    meaning: "ý tưởng",
    partOfSpeech: "noun",
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
    dialect: null,
    variantWord: null,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    state: "NEW",
    lapses: 0,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    practiceSentences: [makeSentence()],
    ...partial,
  } as CardWithPractice;
}

describe("parsePracticeReviewWords", () => {
  it("đọc mảng JSON hợp lệ", () => {
    expect(parsePracticeReviewWords('["culture","shy"]')).toEqual(["culture", "shy"]);
  });

  it("trả mảng rỗng khi null, JSON hỏng hoặc không phải mảng chuỗi", () => {
    expect(parsePracticeReviewWords(null)).toEqual([]);
    expect(parsePracticeReviewWords("{")).toEqual([]);
    expect(parsePracticeReviewWords('{"a":1}')).toEqual([]);
    expect(parsePracticeReviewWords("[1,2]")).toEqual([]);
  });

  it("bỏ phần tử rỗng và cắt khoảng trắng", () => {
    expect(parsePracticeReviewWords('["  culture ","", "  "]')).toEqual(["culture"]);
  });
});

describe("buildPracticeItems", () => {
  it("dựng item từ câu luyện của thẻ", () => {
    const items = buildPracticeItems([makeCard()]);
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      id: "p1",
      cardId: "c1",
      word: "idea",
      meaning: "ý tưởng",
      prompt: "Tôi có một ý tưởng hay cho dự án.",
      answer: "I have a good idea for the project.",
      reviewWords: ["project"],
    });
  });

  it("gộp câu của nhiều thẻ, giữ thứ tự thẻ rồi tới thứ tự câu", () => {
    const items = buildPracticeItems([
      makeCard({
        id: "a",
        word: "alpha",
        practiceSentences: [
          makeSentence({ id: "a2", cardId: "a", order: 1, english: "Alpha comes after the first lesson." }),
          makeSentence({ id: "a1", cardId: "a", order: 0, english: "Alpha is the first letter here." }),
        ],
      }),
      makeCard({ id: "b", word: "beta", practiceSentences: [makeSentence({ id: "b1", cardId: "b" })] }),
    ]);
    expect(items.map((i) => i.id)).toEqual(["a1", "a2", "b1"]);
  });

  it("bỏ câu thiếu đề bài, thiếu đáp án hoặc quá ngắn", () => {
    const items = buildPracticeItems([
      makeCard({
        practiceSentences: [
          makeSentence({ id: "x1", english: "   " }),
          makeSentence({ id: "x2", vietnamese: "" }),
          makeSentence({ id: "x3", english: "Good idea.", vietnamese: "Ý hay." }),
        ],
      }),
    ]);
    expect(items).toEqual([]);
  });

  it("bỏ qua thẻ không có câu luyện nào", () => {
    expect(buildPracticeItems([makeCard({ practiceSentences: [] })])).toEqual([]);
    expect(buildPracticeItems([makeCard({ practiceSentences: undefined })])).toEqual([]);
  });
});

describe("practiceEligibleCards", () => {
  it("chỉ giữ thẻ có ít nhất một câu luyện hợp lệ", () => {
    const ok = makeCard({ id: "ok" });
    const empty = makeCard({ id: "empty", practiceSentences: [] });
    const invalid = makeCard({
      id: "invalid",
      practiceSentences: [makeSentence({ english: "Hi." })],
    });
    expect(practiceEligibleCards([ok, empty, invalid]).map((c) => c.id)).toEqual(["ok"]);
  });
});

describe("practiceItemsByCard", () => {
  it("đếm số câu luyện của từng thẻ", () => {
    const map = practiceItemsByCard([
      makeCard({
        id: "a",
        practiceSentences: [
          makeSentence({ id: "a1", cardId: "a" }),
          makeSentence({ id: "a2", cardId: "a", order: 1 }),
        ],
      }),
      makeCard({ id: "b", practiceSentences: [makeSentence({ id: "b1", cardId: "b" })] }),
    ]);
    expect(map.get("a")).toBe(2);
    expect(map.get("b")).toBe(1);
    expect(map.get("zzz")).toBeUndefined();
  });
});

describe("seededShuffle", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  it("cùng seed → cùng thứ tự (ổn định khi dữ liệu được tải lại)", () => {
    expect(seededShuffle(items, 0.42)).toEqual(seededShuffle(items, 0.42));
  });

  it("khác seed → thứ tự khác", () => {
    expect(seededShuffle(items, 0.1)).not.toEqual(seededShuffle(items, 0.9));
  });

  it("giữ nguyên đủ phần tử và không đổi mảng gốc", () => {
    const original = [...items];
    const out = seededShuffle(items, 0.7);
    expect([...out].sort((a, b) => a - b)).toEqual(original);
    expect(items).toEqual(original);
  });

  it("mảng rỗng hoặc 1 phần tử vẫn chạy", () => {
    expect(seededShuffle([], 0.5)).toEqual([]);
    expect(seededShuffle([9], 0.5)).toEqual([9]);
  });
});
