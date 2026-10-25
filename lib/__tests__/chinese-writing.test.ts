import { describe, expect, it } from "vitest";
import { writableChars, writingScore } from "@/lib/chinese-writing";

describe("writableChars", () => {
  it("tách từng chữ Hán của từ", () => {
    expect(writableChars("你好")).toEqual(["你", "好"]);
  });

  it("bỏ ngoặc, dấu … và ký tự không phải chữ Hán; phần trong ngoặc vẫn phải viết", () => {
    expect(writableChars("没(有)")).toEqual(["没", "有"]);
    expect(writableChars("太…了")).toEqual(["太", "了"]);
    expect(writableChars("…文")).toEqual(["文"]);
  });

  it("từ không có chữ Hán → rỗng", () => {
    expect(writableChars("abc 123")).toEqual([]);
  });
});

describe("writingScore", () => {
  it("không sai nét nào → điểm tối đa", () => {
    const perfect = writingScore([{ strokes: 7, mistakes: 0 }]);
    expect(perfect).toBe(100);
  });

  it("càng sai nhiều nét điểm càng thấp, không âm", () => {
    const few = writingScore([{ strokes: 7, mistakes: 1 }]);
    const many = writingScore([{ strokes: 7, mistakes: 6 }]);
    expect(few).toBeLessThan(100);
    expect(many).toBeLessThan(few);
    expect(writingScore([{ strokes: 2, mistakes: 50 }])).toBeGreaterThanOrEqual(0);
  });

  it("gộp nhiều chữ theo tổng số nét: sai ở chữ nhiều nét bị trừ ít hơn chữ ít nét", () => {
    const wrongOnBig = writingScore([
      { strokes: 12, mistakes: 1 },
      { strokes: 2, mistakes: 0 },
    ]);
    const wrongOnSmall = writingScore([
      { strokes: 12, mistakes: 0 },
      { strokes: 2, mistakes: 1 },
    ]);
    expect(wrongOnBig).toBe(wrongOnSmall);
    expect(writingScore([{ strokes: 12, mistakes: 1 }])).toBeGreaterThan(
      writingScore([{ strokes: 2, mistakes: 1 }]),
    );
  });

  it("chưa viết chữ nào → 0", () => {
    expect(writingScore([])).toBe(0);
  });
});
