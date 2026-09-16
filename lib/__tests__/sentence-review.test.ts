import { describe, expect, it } from "vitest";
import { containsWord, findReviewWords, wordVariants } from "@/lib/sentence-review";

describe("wordVariants", () => {
  it("sinh dạng số nhiều / quá khứ / V-ing cơ bản", () => {
    const v = wordVariants("learn");
    expect(v).toContain("learn");
    expect(v).toContain("learns");
    expect(v).toContain("learned");
    expect(v).toContain("learning");
  });

  it("từ kết thúc bằng 'e' → bỏ e khi thêm ing", () => {
    expect(wordVariants("practice")).toContain("practicing");
    expect(wordVariants("practice")).toContain("practiced");
  });

  it("phụ âm + y → ies/ied", () => {
    const v = wordVariants("study");
    expect(v).toContain("studies");
    expect(v).toContain("studied");
  });

  it("nhân đôi phụ âm cuối", () => {
    expect(wordVariants("stop")).toContain("stopped");
    expect(wordVariants("stop")).toContain("stopping");
  });

  it("cụm từ giữ nguyên, không chia dạng", () => {
    expect(wordVariants("give up")).toEqual(["give up"]);
  });
});

describe("containsWord", () => {
  it("khớp nguyên từ, bỏ qua hoa thường", () => {
    expect(containsWord("Culture is important.", "culture")).toBe(true);
  });

  it("khớp cả dạng biến đổi", () => {
    expect(containsWord("She is studying abroad.", "study")).toBe(true);
    expect(containsWord("He stopped the car.", "stop")).toBe(true);
  });

  it("không khớp khi chỉ là một phần của từ khác", () => {
    expect(containsWord("I like art.", "cart")).toBe(false);
    expect(containsWord("This is a category.", "cat")).toBe(false);
  });

  it("khớp cụm từ có khoảng trắng linh hoạt", () => {
    expect(containsWord("Please give  up smoking.", "give up")).toBe(true);
  });
});

describe("findReviewWords", () => {
  it("trả về các từ cũ xuất hiện trong câu, không trùng lặp", () => {
    const sentence = "Learning a new language helps me understand another culture.";
    expect(findReviewWords(sentence, ["language", "culture", "abroad", "language"])).toEqual([
      "language",
      "culture",
    ]);
  });

  it("trả mảng rỗng khi không có từ nào", () => {
    expect(findReviewWords("I have a good idea.", ["culture", "abroad"])).toEqual([]);
  });
});
