import { describe, expect, it } from "vitest";
import { CHINESE_READINGS, getChineseReading, readingItems } from "@/lib/chinese-readings";
import { isChineseSentenceCorrect } from "@/lib/chinese-answer";

describe("CHINESE_READINGS", () => {
  it("mỗi bài chỉ có một bài đọc", () => {
    const lessons = CHINESE_READINGS.map((r) => r.lesson);
    expect(new Set(lessons).size).toBe(lessons.length);
  });

  it("mọi câu đều đủ Hán tự, pinyin và nghĩa Việt", () => {
    for (const reading of CHINESE_READINGS) {
      for (const item of readingItems(reading)) {
        expect(item.hanzi.trim(), item.id).not.toBe("");
        expect(item.pinyin.trim(), item.id).not.toBe("");
        expect(item.vi.trim(), item.id).not.toBe("");
      }
    }
  });

  it("đáp án mẫu của từng câu tự chấm đúng (cả Hán tự lẫn pinyin)", () => {
    for (const reading of CHINESE_READINGS) {
      for (const item of readingItems(reading)) {
        expect(isChineseSentenceCorrect(item, item.hanzi), `${item.id} hanzi`).toBe(true);
        expect(isChineseSentenceCorrect(item, item.pinyin), `${item.id} pinyin`).toBe(true);
      }
    }
  });
});

describe("readingItems", () => {
  it("id không trùng trong một bài", () => {
    for (const reading of CHINESE_READINGS) {
      const ids = readingItems(reading).map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("getChineseReading", () => {
  it("bài có bài đọc → trả về, không có hoặc null → null", () => {
    expect(getChineseReading(1)?.lesson).toBe(1);
    expect(getChineseReading(99)).toBeNull();
    expect(getChineseReading(null)).toBeNull();
  });
});
