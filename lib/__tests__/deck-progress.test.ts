import { describe, expect, it } from "vitest";
import { computeDeckLockStatus, getDeckUnitNumber, type DeckLockInput } from "../deck-progress";

function deck(id: string, name: string, learnedAt: Date | null = null): DeckLockInput {
  return { id, name, learnedAt };
}

describe("getDeckUnitNumber", () => {
  it("trích số Unit từ tên deck", () => {
    expect(getDeckUnitNumber("Unit 10: Khu phố")).toBe(10);
    expect(getDeckUnitNumber("unit 3 - abc")).toBe(3);
  });

  it("trả null khi tên không có Unit", () => {
    expect(getDeckUnitNumber("Daily Life")).toBeNull();
  });
});

describe("computeDeckLockStatus", () => {
  const now = new Date("2026-06-29T00:00:00Z");

  it("chỉ mở Unit 1 khi chưa học deck nào", () => {
    const status = computeDeckLockStatus([
      deck("u1", "Unit 1: A"),
      deck("u2", "Unit 2: B"),
      deck("u3", "Unit 3: C"),
    ]);
    expect(status.get("u1")).toEqual({ learned: false, locked: false });
    expect(status.get("u2")).toEqual({ learned: false, locked: true });
    expect(status.get("u3")).toEqual({ learned: false, locked: true });
  });

  it("học xong Unit 1 thì mở khóa Unit 2, Unit 3 vẫn khóa", () => {
    const status = computeDeckLockStatus([
      deck("u1", "Unit 1: A", now),
      deck("u2", "Unit 2: B"),
      deck("u3", "Unit 3: C"),
    ]);
    expect(status.get("u1")).toEqual({ learned: true, locked: false });
    expect(status.get("u2")).toEqual({ learned: false, locked: false });
    expect(status.get("u3")).toEqual({ learned: false, locked: true });
  });

  it("không phụ thuộc thứ tự đầu vào (sắp theo số Unit)", () => {
    const status = computeDeckLockStatus([
      deck("u3", "Unit 3: C"),
      deck("u1", "Unit 1: A", now),
      deck("u2", "Unit 2: B", now),
    ]);
    expect(status.get("u3")).toEqual({ learned: false, locked: false });
  });

  it("bỏ học giữa chuỗi làm khóa lại các Unit sau (suy diễn)", () => {
    const status = computeDeckLockStatus([
      deck("u1", "Unit 1: A", now),
      deck("u2", "Unit 2: B"), // chưa học
      deck("u3", "Unit 3: C", now), // từng học nhưng Unit 2 chưa xong
    ]);
    expect(status.get("u2")).toEqual({ learned: false, locked: false });
    // Unit 3 vẫn "learned" nhưng bị "locked" vì Unit 2 chưa học xong
    expect(status.get("u3")).toEqual({ learned: true, locked: true });
  });

  it("deck không có số Unit luôn mở khóa", () => {
    const status = computeDeckLockStatus([
      deck("u1", "Unit 1: A"),
      deck("x", "Daily Life"),
    ]);
    expect(status.get("x")).toEqual({ learned: false, locked: false });
  });
});
