import { describe, expect, it } from "vitest";
import {
  exampleContainsWord,
  parseChineseDeckFile,
  validateChineseDeckFile,
} from "@/lib/chinese-deck-file";

const VALID = {
  deck: {
    name: "Bài 1: Số đếm 1–10",
    description: "Số đếm cơ bản",
    icon: "🔢",
  },
  cards: [
    {
      word: "一",
      phonetic: "yī",
      meaning: "một",
      hanziFormal: "壹",
      strokeCount: 1,
      radical: "一",
      example: "我有一本书。",
      examplePinyin: "Wǒ yǒu yì běn shū.",
      exampleTranslation: "Tôi có một quyển sách.",
    },
  ],
};

describe("parseChineseDeckFile", () => {
  it("nhận file hợp lệ và giữ nguyên dữ liệu", () => {
    const parsed = parseChineseDeckFile(VALID);
    expect(parsed.deck.name).toBe("Bài 1: Số đếm 1–10");
    expect(parsed.cards).toHaveLength(1);
    expect(parsed.cards[0].hanziFormal).toBe("壹");
    expect(parsed.cards[0].strokeCount).toBe(1);
  });

  it("thiếu pinyin → báo lỗi (thẻ tiếng Trung bắt buộc có pinyin)", () => {
    const broken = { ...VALID, cards: [{ word: "一", meaning: "một" }] };
    expect(() => parseChineseDeckFile(broken)).toThrow();
  });

  it("deck không có thẻ nào → báo lỗi", () => {
    expect(() => parseChineseDeckFile({ ...VALID, cards: [] })).toThrow();
  });
});

describe("exampleContainsWord", () => {
  it("đúng khi câu ví dụ chứa chữ của thẻ", () => {
    expect(exampleContainsWord({ word: "三", example: "我有三个朋友。" })).toBe(
      true,
    );
  });

  it("sai khi câu ví dụ không chứa chữ của thẻ", () => {
    expect(exampleContainsWord({ word: "三", example: "我有两个朋友。" })).toBe(
      false,
    );
  });

  it("không có ví dụ → coi như đạt (ví dụ là tuỳ chọn)", () => {
    expect(exampleContainsWord({ word: "三", example: null })).toBe(true);
  });
});

describe("validateChineseDeckFile", () => {
  it("file hợp lệ → không có lỗi nào", () => {
    expect(validateChineseDeckFile(VALID)).toEqual([]);
  });

  it("báo lỗi khi câu ví dụ không chứa chữ Hán của thẻ", () => {
    const bad = {
      ...VALID,
      cards: [{ ...VALID.cards[0], example: "我有两本书。" }],
    };
    const errors = validateChineseDeckFile(bad);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("一");
  });

  it("báo lỗi khi có chữ Hán trùng nhau trong cùng deck", () => {
    const bad = { ...VALID, cards: [VALID.cards[0], { ...VALID.cards[0] }] };
    const errors = validateChineseDeckFile(bad);
    expect(errors.some((e) => e.includes("trùng"))).toBe(true);
  });

  it("file sai cấu trúc → trả lỗi thay vì ném ngoại lệ", () => {
    const errors = validateChineseDeckFile({ deck: { name: "" }, cards: [] });
    expect(errors.length).toBeGreaterThan(0);
  });
});
