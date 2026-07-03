import { describe, expect, it } from "vitest";
import { aggregateWrongCards } from "@/lib/history";

describe("aggregateWrongCards", () => {
  it("trả về rỗng khi không có lượt nào", () => {
    expect(aggregateWrongCards([])).toEqual([]);
  });

  it("cộng dồn số lần sai của mỗi thẻ qua nhiều lượt", () => {
    const result = aggregateWrongCards([
      { wrongCardIds: ["a", "b"], createdAt: "2026-01-01T10:00:00.000Z" },
      { wrongCardIds: ["a"], createdAt: "2026-01-02T10:00:00.000Z" },
      { wrongCardIds: ["a", "c"], createdAt: "2026-01-03T10:00:00.000Z" },
    ]);
    const byId = Object.fromEntries(result.map((r) => [r.cardId, r]));
    expect(byId.a.wrongCount).toBe(3);
    expect(byId.b.wrongCount).toBe(1);
    expect(byId.c.wrongCount).toBe(1);
  });

  it("lấy thời điểm sai gần nhất (lastWrongAt)", () => {
    const result = aggregateWrongCards([
      { wrongCardIds: ["a"], createdAt: "2026-01-01T10:00:00.000Z" },
      { wrongCardIds: ["a"], createdAt: "2026-01-05T10:00:00.000Z" },
      { wrongCardIds: ["a"], createdAt: "2026-01-03T10:00:00.000Z" },
    ]);
    expect(result[0].lastWrongAt).toBe("2026-01-05T10:00:00.000Z");
  });

  it("sắp xếp theo số lần sai giảm dần", () => {
    const result = aggregateWrongCards([
      { wrongCardIds: ["rare"], createdAt: "2026-01-01T10:00:00.000Z" },
      { wrongCardIds: ["often", "often-2"], createdAt: "2026-01-02T10:00:00.000Z" },
      { wrongCardIds: ["often"], createdAt: "2026-01-03T10:00:00.000Z" },
      { wrongCardIds: ["often"], createdAt: "2026-01-04T10:00:00.000Z" },
    ]);
    expect(result[0].cardId).toBe("often");
    expect(result[0].wrongCount).toBe(3);
  });
});
