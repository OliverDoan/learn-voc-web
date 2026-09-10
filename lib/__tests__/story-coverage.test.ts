import { describe, expect, it } from "vitest";
import { checkStoryCoverage } from "../story-coverage";

const WORDS = ["apple", "drop out", "Bank Teller"];

describe("checkStoryCoverage", () => {
  it("đủ từ, không thừa → ok", () => {
    const content =
      "Tôi ăn [[apple|quả táo]], không [[drop out|bỏ học]] và gặp [[bank teller|giao dịch viên]].";
    const result = checkStoryCoverage(content, WORDS);
    expect(result).toEqual({ ok: true, missing: [], unmatched: [], duplicated: [] });
  });

  it("báo từ còn thiếu (so khớp không phân biệt hoa thường, bỏ khoảng trắng dư)", () => {
    const content = "Tôi ăn [[ Apple |quả táo]].";
    const result = checkStoryCoverage(content, WORDS);
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(["drop out", "Bank Teller"]);
    expect(result.unmatched).toEqual([]);
  });

  it("báo từ chêm không thuộc danh sách", () => {
    const content =
      "[[apple|táo]] [[drop out|bỏ học]] [[bank teller|GDV]] và [[banana|chuối]].";
    const result = checkStoryCoverage(content, WORDS);
    expect(result.ok).toBe(false);
    expect(result.unmatched).toEqual(["banana"]);
    expect(result.missing).toEqual([]);
  });

  it("liệt kê từ bị chêm lặp lại (không làm fail)", () => {
    const content =
      "[[apple|táo]] [[apple|táo]] [[drop out|bỏ học]] [[bank teller|GDV]].";
    const result = checkStoryCoverage(content, WORDS);
    expect(result.ok).toBe(true);
    expect(result.duplicated).toEqual(["apple"]);
  });

  it("nội dung không có markup → thiếu toàn bộ", () => {
    const result = checkStoryCoverage("Không có từ chêm nào.", WORDS);
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(WORDS);
  });
});
