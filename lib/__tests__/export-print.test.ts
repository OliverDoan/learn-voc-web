import { describe, expect, it } from "vitest";
import { abbreviatePos, buildPrintMatrix, type PrintDeck } from "../export-print";

describe("buildPrintMatrix", () => {
  it("mỗi cột là một deck, mỗi hàng là từ cùng vị trí", () => {
    const decks: PrintDeck[] = [
      { name: "Unit 1", words: ["abroad", "budget"] },
      { name: "Unit 2", words: ["apple", "banana"] },
    ];
    expect(buildPrintMatrix(decks)).toEqual([
      ["abroad", "apple"],
      ["budget", "banana"],
    ]);
  });

  it("deck ngắn hơn được đệm bằng ô rỗng đến độ dài deck dài nhất", () => {
    const decks: PrintDeck[] = [
      { name: "A", words: ["one", "two", "three"] },
      { name: "B", words: ["x"] },
    ];
    expect(buildPrintMatrix(decks)).toEqual([
      ["one", "x"],
      ["two", ""],
      ["three", ""],
    ]);
  });

  it("không có deck nào → ma trận rỗng", () => {
    expect(buildPrintMatrix([])).toEqual([]);
  });

  it("deck không có từ nào → vẫn rỗng (0 hàng)", () => {
    expect(buildPrintMatrix([{ name: "Empty", words: [] }])).toEqual([]);
  });
});

describe("abbreviatePos", () => {
  it("viết tắt các từ loại cơ bản", () => {
    expect(abbreviatePos("noun")).toBe("n");
    expect(abbreviatePos("verb")).toBe("v");
    expect(abbreviatePos("adjective")).toBe("adj");
    expect(abbreviatePos("adverb")).toBe("adv");
  });

  it("xử lý dạng ghép, nối bằng dấu /", () => {
    expect(abbreviatePos("adjective / noun")).toBe("adj/n");
    expect(abbreviatePos("noun, verb")).toBe("n/v");
  });

  it("null/rỗng → chuỗi rỗng", () => {
    expect(abbreviatePos(null)).toBe("");
    expect(abbreviatePos(undefined)).toBe("");
    expect(abbreviatePos("")).toBe("");
  });

  it("không phân biệt hoa thường và bỏ dấu chấm cuối", () => {
    expect(abbreviatePos("Noun")).toBe("n");
    expect(abbreviatePos("n.")).toBe("n");
  });

  it("token lạ giữ nguyên (đã chuẩn hoá)", () => {
    expect(abbreviatePos("slang")).toBe("slang");
    expect(abbreviatePos("noun / slang")).toBe("n/slang");
  });
});
