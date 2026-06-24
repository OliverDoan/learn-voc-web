import { describe, expect, it } from "vitest";
import { buildGapFill, gapFillEligibleCards, GAP_PLACEHOLDER } from "../gap-fill";
import type { Card } from "../types";

function makeCard(overrides: Partial<Card>): Card {
  return {
    id: "c1",
    deckId: "d1",
    word: "abroad",
    meaning: "ở nước ngoài",
    partOfSpeech: "adverb",
    rootWord: null,
    rootWordMeaning: null,
    phonetic: null,
    example: "She is studying abroad in Japan.",
    exampleTranslation: "Cô ấy đang du học ở Nhật.",
    note: null,
    imageUrl: null,
    audioUrl: null,
    tags: "[]",
    wordForms: null,
    wordFormMeanings: null,
    synonyms: null,
    antonyms: null,
    favorite: false,
    deletedAt: null,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: "2026-01-01T00:00:00.000Z",
    state: "NEW",
    lapses: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildGapFill", () => {
  it("khoét từ vựng khỏi câu ví dụ", () => {
    const result = buildGapFill(makeCard({}));
    expect(result).not.toBeNull();
    expect(result?.answer).toBe("abroad");
    expect(result?.masked).toBe(`She is studying ${GAP_PLACEHOLDER} in Japan.`);
    expect(result?.translation).toBe("Cô ấy đang du học ở Nhật.");
  });

  it("so khớp không phân biệt hoa thường", () => {
    const result = buildGapFill(makeCard({ word: "Apple", example: "I ate an apple." }));
    expect(result?.masked).toBe(`I ate an ${GAP_PLACEHOLDER}.`);
  });

  it("chỉ khoét lần xuất hiện đầu tiên", () => {
    const result = buildGapFill(
      makeCard({ word: "run", example: "I run and you run too." }),
    );
    expect(result?.masked).toBe(`I ${GAP_PLACEHOLDER} and you run too.`);
  });

  it("khớp nguyên từ — không khoét trong từ khác", () => {
    const result = buildGapFill(
      makeCard({ word: "cat", example: "The category is wrong." }),
    );
    expect(result).toBeNull();
  });

  it("hỗ trợ cụm từ nhiều chữ", () => {
    const result = buildGapFill(
      makeCard({ word: "give up", example: "Never give up on your dreams." }),
    );
    expect(result?.masked).toBe(`Never ${GAP_PLACEHOLDER} on your dreams.`);
  });

  it("trả null khi không có ví dụ", () => {
    expect(buildGapFill(makeCard({ example: null }))).toBeNull();
  });

  it("trả null khi ví dụ không chứa từ", () => {
    expect(
      buildGapFill(makeCard({ word: "abroad", example: "Hello world." })),
    ).toBeNull();
  });
});

describe("gapFillEligibleCards", () => {
  it("chỉ giữ card có ví dụ chứa từ vựng", () => {
    const cards = [
      makeCard({ id: "ok", example: "She is studying abroad." }),
      makeCard({ id: "no-example", example: null }),
      makeCard({ id: "mismatch", example: "Hello world." }),
    ];
    const eligible = gapFillEligibleCards(cards);
    expect(eligible.map((c) => c.id)).toEqual(["ok"]);
  });
});
