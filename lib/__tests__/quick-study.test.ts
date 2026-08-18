import { describe, expect, it } from "vitest";
import { MAX_QUICK_LIMIT, QUICK_PRESET, parseQuickLimit } from "../quick-study";

describe("parseQuickLimit", () => {
  it("không có tham số → undefined (học bình thường)", () => {
    expect(parseQuickLimit(null)).toBeUndefined();
    expect(parseQuickLimit("")).toBeUndefined();
  });

  it("số hợp lệ giữ nguyên", () => {
    expect(parseQuickLimit("5")).toBe(5);
    expect(parseQuickLimit("12")).toBe(12);
  });

  it("giá trị không phải số → undefined", () => {
    expect(parseQuickLimit("abc")).toBeUndefined();
    expect(parseQuickLimit("5 từ")).toBeUndefined();
  });

  it("số <= 0 → undefined", () => {
    expect(parseQuickLimit("0")).toBeUndefined();
    expect(parseQuickLimit("-3")).toBeUndefined();
  });

  it("số quá lớn bị chặn ở mức tối đa", () => {
    expect(parseQuickLimit("9999")).toBe(MAX_QUICK_LIMIT);
  });

  it("số thập phân làm tròn xuống", () => {
    expect(parseQuickLimit("7.9")).toBe(7);
  });

  it("preset mặc định nằm trong khoảng cho phép", () => {
    expect(QUICK_PRESET).toBeGreaterThan(0);
    expect(QUICK_PRESET).toBeLessThanOrEqual(MAX_QUICK_LIMIT);
  });
});
