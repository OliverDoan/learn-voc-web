import { describe, expect, it } from "vitest";
import { countFilled, fillSlotState, isFillAnswerCorrect } from "../story-fill";

describe("isFillAnswerCorrect", () => {
  it("chấp nhận đúng từ, bỏ qua hoa thường và khoảng trắng", () => {
    expect(isFillAnswerCorrect("  Vocabulary ", "vocabulary")).toBe(true);
  });

  it("bỏ qua 1 lỗi gõ", () => {
    expect(isFillAnswerCorrect("vocabulry", "vocabulary")).toBe(true);
  });

  it("từ chối từ khác", () => {
    expect(isFillAnswerCorrect("grammar", "vocabulary")).toBe(false);
    expect(isFillAnswerCorrect("", "vocabulary")).toBe(false);
  });
});

describe("fillSlotState", () => {
  it("khi chưa nộp: phân biệt ô trống và ô đã điền", () => {
    expect(fillSlotState({ value: "", word: "shy", submitted: false })).toBe("empty");
    expect(fillSlotState({ value: "   ", word: "shy", submitted: false })).toBe("empty");
    expect(fillSlotState({ value: "sh", word: "shy", submitted: false })).toBe("filled");
  });

  it("chưa nộp thì không tiết lộ đúng/sai", () => {
    expect(fillSlotState({ value: "shy", word: "shy", submitted: false })).toBe("filled");
  });

  it("sau khi nộp: chấm đúng/sai", () => {
    expect(fillSlotState({ value: "shy", word: "shy", submitted: true })).toBe("correct");
    expect(fillSlotState({ value: "sad", word: "shy", submitted: true })).toBe("wrong");
    expect(fillSlotState({ value: "", word: "shy", submitted: true })).toBe("wrong");
  });
});

describe("countFilled", () => {
  it("đếm số ô đã điền (bỏ qua khoảng trắng)", () => {
    expect(countFilled(["shy", "", "  ", "topic"])).toBe(2);
    expect(countFilled([])).toBe(0);
  });
});
