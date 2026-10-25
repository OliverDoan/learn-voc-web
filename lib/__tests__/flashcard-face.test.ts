import { describe, expect, it } from "vitest";
import { isEnglishFaceShown } from "../flashcard-face";

describe("isEnglishFaceShown", () => {
  it("Anh→Việt: mặt trước (chưa lật) là từ tiếng Anh", () => {
    expect(isEnglishFaceShown({ reverse: false, flipped: false })).toBe(true);
    expect(isEnglishFaceShown({ reverse: false, flipped: true })).toBe(false);
  });

  it("Việt→Anh: từ tiếng Anh chỉ hiện sau khi lật", () => {
    expect(isEnglishFaceShown({ reverse: true, flipped: false })).toBe(false);
    expect(isEnglishFaceShown({ reverse: true, flipped: true })).toBe(true);
  });
});
