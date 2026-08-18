import { beforeEach, describe, expect, it } from "vitest";
import { addTestAttempt, clearAllTestHistory, hasTestHistory } from "../test-history";

const attempt = {
  at: 1,
  total: 5,
  correct: 4,
  wrong: [
    {
      cardId: "c1",
      meaning: "quả táo",
      word: "apple",
      yourAnswer: "aple",
      wordWrong: true,
      posWrong: false,
      correctPos: "noun",
      yourPos: "noun",
    },
  ],
};

describe("clearAllTestHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("xoá lịch sử kiểm tra của MỌI deck", () => {
    addTestAttempt("deck-a", attempt);
    addTestAttempt("deck-b", attempt);
    expect(hasTestHistory("deck-a")).toBe(true);
    expect(hasTestHistory("deck-b")).toBe(true);

    clearAllTestHistory();

    expect(hasTestHistory("deck-a")).toBe(false);
    expect(hasTestHistory("deck-b")).toBe(false);
  });

  it("không đụng tới các khoá localStorage khác", () => {
    addTestAttempt("deck-a", attempt);
    localStorage.setItem("voca-reminder", '{"enabled":true,"time":"20:00"}');
    localStorage.setItem("theme", "dark");

    clearAllTestHistory();

    expect(localStorage.getItem("voca-reminder")).toBe(
      '{"enabled":true,"time":"20:00"}',
    );
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("không có lịch sử nào cũng không ném lỗi", () => {
    expect(() => clearAllTestHistory()).not.toThrow();
  });
});
