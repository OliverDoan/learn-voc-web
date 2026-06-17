import { describe, expect, it } from "vitest";
import { displayRootWord } from "../utils";

describe("displayRootWord", () => {
  it("ẩn khi từ gốc chính là từ đó (có chú thích loại từ)", () => {
    expect(displayRootWord("journey", "journey (n/v)")).toBeNull();
  });

  it("ẩn khi trùng khác hoa thường / khoảng trắng", () => {
    expect(displayRootWord("Journey", "journey (noun)")).toBeNull();
    expect(displayRootWord("progress", "progress (noun, verb)")).toBeNull();
  });

  it("hiển thị khi từ gốc khác từ đó", () => {
    expect(displayRootWord("secondary", "second (adj)")).toBe("second (adj)");
    expect(displayRootWord("beginning", "begin (v)")).toBe("begin (v)");
  });

  it("trả null khi không có từ gốc", () => {
    expect(displayRootWord("journey", null)).toBeNull();
    expect(displayRootWord("journey", "")).toBeNull();
  });
});
