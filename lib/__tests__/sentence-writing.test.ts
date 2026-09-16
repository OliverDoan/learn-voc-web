import { describe, expect, it } from "vitest";
import {
  buildSentenceWriting,
  diffSentence,
  gradeSentence,
  normalizeSentence,
  sentenceHint,
  sentenceWritingEligibleCards,
  tokenizeSentence,
} from "@/lib/sentence-writing";
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

describe("normalizeSentence", () => {
  it("bỏ dấu câu, hạ chữ thường và gộp khoảng trắng", () => {
    expect(normalizeSentence("  I  have a good idea, for the project!  ")).toBe(
      "i have a good idea for the project",
    );
  });

  it("chuẩn hoá nháy đơn cong về nháy thẳng", () => {
    expect(normalizeSentence("It’s fine.")).toBe("it's fine");
  });

  it("trả về chuỗi rỗng với đầu vào rỗng", () => {
    expect(normalizeSentence("   ")).toBe("");
  });
});

describe("tokenizeSentence", () => {
  it("tách câu thành mảng từ đã chuẩn hoá", () => {
    expect(tokenizeSentence("I have a good idea.")).toEqual(["i", "have", "a", "good", "idea"]);
  });
});

describe("buildSentenceWriting", () => {
  it("dựng đề bài từ câu ví dụ + bản dịch của thẻ", () => {
    const sw = buildSentenceWriting(makeCard({}));
    expect(sw).toEqual({
      prompt: "Tôi có một ý tưởng hay cho dự án.",
      answer: "I have a good idea for the project.",
      keyword: "idea",
      meaning: "ý tưởng",
    });
  });

  it("trả null khi thiếu bản dịch tiếng Việt", () => {
    expect(buildSentenceWriting(makeCard({ exampleTranslation: null }))).toBeNull();
    expect(buildSentenceWriting(makeCard({ exampleTranslation: "   " }))).toBeNull();
  });

  it("trả null khi thiếu câu ví dụ tiếng Anh", () => {
    expect(buildSentenceWriting(makeCard({ example: null }))).toBeNull();
  });

  it("trả null khi câu ví dụ quá ngắn (dưới 3 từ)", () => {
    expect(buildSentenceWriting(makeCard({ example: "Good idea." }))).toBeNull();
  });
});

describe("sentenceWritingEligibleCards", () => {
  it("chỉ giữ thẻ có đủ câu ví dụ và bản dịch", () => {
    const ok = makeCard({ id: "ok" });
    const noTrans = makeCard({ id: "no-trans", exampleTranslation: null });
    const short = makeCard({ id: "short", example: "Nice idea." });
    expect(sentenceWritingEligibleCards([ok, noTrans, short]).map((c) => c.id)).toEqual(["ok"]);
  });
});

describe("gradeSentence", () => {
  const answer = "I have a good idea for the project.";

  it("đúng tuyệt đối khi gõ chính xác", () => {
    expect(gradeSentence(answer, answer)).toBe("correct");
  });

  it("bỏ qua khác biệt hoa thường, dấu câu và khoảng trắng thừa", () => {
    expect(gradeSentence("i have a good idea for the project", answer)).toBe("correct");
    expect(gradeSentence("  I have  a good idea for the project!!  ", answer)).toBe("correct");
  });

  it("chấp nhận sai chính tả nhỏ là gần đúng", () => {
    expect(gradeSentence("I have a good ideea for the project.", answer)).toBe("close");
  });

  it("sai khi thiếu hoặc lẫn từ", () => {
    expect(gradeSentence("I have a idea for the project.", answer)).toBe("wrong");
    expect(gradeSentence("I like cats.", answer)).toBe("wrong");
  });

  it("câu trả lời rỗng luôn sai", () => {
    expect(gradeSentence("   ", answer)).toBe("wrong");
  });
});

describe("diffSentence", () => {
  it("đánh dấu từ thiếu so với đáp án", () => {
    const parts = diffSentence("I have a idea for the project.", "I have a good idea for the project.");
    expect(parts.filter((p) => p.type === "missing").map((p) => p.text)).toEqual(["good"]);
    expect(parts.filter((p) => p.type === "extra")).toHaveLength(0);
  });

  it("đánh dấu từ thừa người dùng gõ thêm", () => {
    const parts = diffSentence("I really have a good idea for the project.", "I have a good idea for the project.");
    expect(parts.filter((p) => p.type === "extra").map((p) => p.text)).toEqual(["really"]);
  });

  it("toàn bộ là 'same' khi câu khớp nhau", () => {
    const parts = diffSentence("i have a good idea for the project", "I have a good idea for the project.");
    expect(parts.every((p) => p.type === "same")).toBe(true);
    expect(parts).toHaveLength(8);
  });
});

describe("sentenceHint", () => {
  const answer = "I have a good idea.";

  it("cấp 1 hiện số từ và chữ cái đầu mỗi từ", () => {
    expect(sentenceHint(answer, 1)).toBe("I h___ a g___ i___");
  });

  it("cấp 0 không hiện gì", () => {
    expect(sentenceHint(answer, 0)).toBe("");
  });
});
