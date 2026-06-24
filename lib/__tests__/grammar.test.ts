import { describe, expect, it } from "vitest";
import {
  GRAMMAR_TOPICS,
  getGrammarTopic,
  isFillCorrect,
  type GrammarFillExercise,
} from "../grammar";

describe("isFillCorrect", () => {
  const ex: GrammarFillExercise = {
    id: "x",
    type: "fill",
    prompt: "...",
    answer: "went",
    accept: ["did go"],
    explanation: "",
  };

  it("đúng khi khớp answer, không phân biệt hoa thường & khoảng trắng", () => {
    expect(isFillCorrect(ex, "went")).toBe(true);
    expect(isFillCorrect(ex, "  WENT ")).toBe(true);
  });

  it("chấp nhận các biến thể trong accept", () => {
    expect(isFillCorrect(ex, "did go")).toBe(true);
    expect(isFillCorrect(ex, "Did  Go")).toBe(true);
  });

  it("sai khi không khớp hoặc rỗng", () => {
    expect(isFillCorrect(ex, "goed")).toBe(false);
    expect(isFillCorrect(ex, "")).toBe(false);
  });
});

describe("nội dung ngữ pháp toàn vẹn", () => {
  it("có ít nhất 1 chủ đề và đủ 3 cấp độ", () => {
    expect(GRAMMAR_TOPICS.length).toBeGreaterThan(0);
    for (const level of ["A", "B", "C"] as const) {
      expect(GRAMMAR_TOPICS.some((t) => t.level === level)).toBe(true);
    }
  });

  it("id chủ đề không trùng lặp", () => {
    const ids = GRAMMAR_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getGrammarTopic trả về đúng chủ đề", () => {
    const first = GRAMMAR_TOPICS[0];
    expect(getGrammarTopic(first.id)?.id).toBe(first.id);
    expect(getGrammarTopic("không-tồn-tại")).toBeUndefined();
  });

  it("mỗi chủ đề có lý thuyết; nếu có bài tập thì id duy nhất & đáp án trắc nghiệm nằm trong options", () => {
    for (const topic of GRAMMAR_TOPICS) {
      expect(topic.rules.length).toBeGreaterThan(0);
      const exercises = topic.exercises ?? [];
      const exIds = exercises.map((e) => e.id);
      expect(new Set(exIds).size).toBe(exIds.length); // id bài tập trong chủ đề là duy nhất
      for (const ex of exercises) {
        if (ex.type === "mc") {
          expect(ex.options).toContain(ex.answer);
        }
      }
    }
  });

  it("bảng tổng hợp (nếu có) có số cột khớp giữa header và mọi hàng", () => {
    for (const topic of GRAMMAR_TOPICS) {
      for (const table of topic.tables ?? []) {
        expect(table.headers.length).toBeGreaterThan(0);
        for (const row of table.rows) {
          expect(row.length).toBe(table.headers.length);
        }
      }
    }
  });
});
