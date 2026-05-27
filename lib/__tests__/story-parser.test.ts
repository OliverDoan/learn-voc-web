import { describe, expect, it } from "vitest";
import {
  countWordTokens,
  extractWords,
  maskWords,
  parseStory,
  plainText,
} from "../story-parser";

describe("parseStory", () => {
  it("trả về 1 text token cho chuỗi không có markup", () => {
    expect(parseStory("Hello world")).toEqual([{ type: "text", text: "Hello world" }]);
  });

  it("parse được 1 từ chêm", () => {
    expect(parseStory("Tôi [[apple|quả táo]] ăn")).toEqual([
      { type: "text", text: "Tôi " },
      { type: "word", word: "apple", meaning: "quả táo" },
      { type: "text", text: " ăn" },
    ]);
  });

  it("parse nhiều từ chêm", () => {
    const result = parseStory("[[a|một]] [[b|hai]] end");
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ type: "word", word: "a", meaning: "một" });
    expect(result[2]).toEqual({ type: "word", word: "b", meaning: "hai" });
  });

  it("trim whitespace trong word và meaning", () => {
    expect(parseStory("[[ apple | quả táo ]]")).toEqual([
      { type: "word", word: "apple", meaning: "quả táo" },
    ]);
  });

  it("string rỗng → mảng rỗng", () => {
    expect(parseStory("")).toEqual([]);
  });
});

describe("extractWords / countWordTokens", () => {
  it("extract đúng list từ", () => {
    const words = extractWords("[[wake up|thức dậy]] và [[coffee|cà phê]]");
    expect(words).toEqual([
      { word: "wake up", meaning: "thức dậy" },
      { word: "coffee", meaning: "cà phê" },
    ]);
  });

  it("đếm đúng số từ chêm", () => {
    expect(countWordTokens("hello [[a|b]] [[c|d]] world")).toBe(2);
  });
});

describe("maskWords", () => {
  it("thay từ chêm bằng placeholder", () => {
    expect(maskWords("Tôi [[apple|quả táo]] ăn")).toBe("Tôi _____ ăn");
  });
});

describe("plainText", () => {
  it("giữ từ tiếng Anh, bỏ markup", () => {
    expect(plainText("Tôi [[wake up|thức dậy]] lúc 6h")).toBe("Tôi wake up lúc 6h");
  });
});
