import { describe, expect, it } from "vitest";
import {
  buildSentenceTestRows,
  gradeSentenceTest,
  sentenceTestScore,
} from "@/lib/sentence-test";
import type { Card } from "@/lib/types";

function makeCard(partial: Partial<Card>): Card {
  return {
    id: "c1",
    deckId: "d1",
    word: "idea",
    meaning: "ý tưởng",
    partOfSpeech: "noun",
    rootWord: null,
    rootWordMeaning: null,
    phonetic: null,
    example: "I have a good idea for the project.",
    exampleTranslation: "Tôi có một ý tưởng hay cho dự án.",
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
    ...partial,
  } as Card;
}

describe("buildSentenceTestRows", () => {
  it("dựng hàng từ thẻ có câu ví dụ kèm bản dịch", () => {
    const rows = buildSentenceTestRows([makeCard({})]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      cardId: "c1",
      word: "idea",
      prompt: "Tôi có một ý tưởng hay cho dự án.",
      answer: "I have a good idea for the project.",
    });
  });

  it("bỏ thẻ thiếu câu ví dụ hoặc thiếu bản dịch", () => {
    const rows = buildSentenceTestRows([
      makeCard({ id: "a", example: null }),
      makeCard({ id: "b", exampleTranslation: null }),
      makeCard({ id: "c", example: "   ", exampleTranslation: "  " }),
    ]);
    expect(rows).toEqual([]);
  });

  it("bỏ thẻ có câu ví dụ quá ngắn", () => {
    const rows = buildSentenceTestRows([
      makeCard({ id: "a", example: "Good idea.", exampleTranslation: "Ý hay." }),
    ]);
    expect(rows).toEqual([]);
  });

  it("giữ nguyên thứ tự thẻ đầu vào", () => {
    const rows = buildSentenceTestRows([
      makeCard({ id: "a", word: "abroad" }),
      makeCard({ id: "b", word: "culture" }),
    ]);
    expect(rows.map((r) => r.cardId)).toEqual(["a", "b"]);
  });
});

describe("gradeSentenceTest", () => {
  const rows = buildSentenceTestRows([
    makeCard({ id: "a" }),
    makeCard({
      id: "b",
      example: "She wants to study abroad next year.",
      exampleTranslation: "Cô ấy muốn đi du học vào năm tới.",
    }),
  ]);

  it("chấm đúng khi gõ khớp hoàn toàn (bỏ qua dấu câu, hoa thường)", () => {
    const result = gradeSentenceTest(rows, {
      a: "i have a good idea for the project",
      b: "She wants to study abroad next year.",
    });
    expect(result.a).toBe("correct");
    expect(result.b).toBe("correct");
  });

  it("chấm gần đúng khi chỉ sai chính tả nhẹ", () => {
    const result = gradeSentenceTest(rows, {
      a: "I have a good idae for the project.",
    });
    expect(result.a).toBe("close");
  });

  it("chấm sai khi thiếu/thừa từ", () => {
    const result = gradeSentenceTest(rows, { a: "I have a idea for the project." });
    expect(result.a).toBe("wrong");
  });

  it("ô bỏ trống tính là sai", () => {
    const result = gradeSentenceTest(rows, { a: "   " });
    expect(result.a).toBe("wrong");
    expect(result.b).toBe("wrong");
  });
});

describe("sentenceTestScore", () => {
  const rows = buildSentenceTestRows([
    makeCard({ id: "a" }),
    makeCard({
      id: "b",
      example: "She wants to study abroad next year.",
      exampleTranslation: "Cô ấy muốn đi du học vào năm tới.",
    }),
  ]);

  it("đếm số câu đúng, số câu đã nhập và tổng số câu", () => {
    const score = sentenceTestScore(rows, {
      a: "I have a good idea for the project.",
      b: "She wants study abroad next year.",
    });
    expect(score).toEqual({ correct: 1, answered: 2, total: 2, percent: 50 });
  });

  it("tính câu gần đúng là đúng", () => {
    const score = sentenceTestScore(rows, { a: "I have a good idae for the project." });
    expect(score.correct).toBe(1);
    expect(score.answered).toBe(1);
  });

  it("không chia cho 0 khi chưa có câu nào", () => {
    expect(sentenceTestScore([], {})).toEqual({
      correct: 0,
      answered: 0,
      total: 0,
      percent: 0,
    });
  });
});
