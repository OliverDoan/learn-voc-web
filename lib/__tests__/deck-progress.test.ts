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

  it("bỏ học giữa chuỗi làm khóa lại các Unit sau CHƯA học (suy diễn)", () => {
    const status = computeDeckLockStatus([
      deck("u1", "Unit 1: A", now),
      deck("u2", "Unit 2: B"), // chưa học
      deck("u3", "Unit 3: C", now), // đã học
      deck("u4", "Unit 4: D"), // chưa học, đứng sau Unit 2 còn dở
    ]);
    expect(status.get("u2")).toEqual({ learned: false, locked: false });
    // Unit 3 đã học xong thì luôn mở — không thể vừa "đã học" vừa "khóa".
    expect(status.get("u3")).toEqual({ learned: true, locked: false });
    // Unit 4 chưa học và còn Unit 2 dở phía trước → vẫn khóa.
    expect(status.get("u4")).toEqual({ learned: false, locked: true });
  });

  it("deck không có số Unit luôn mở khóa", () => {
    const status = computeDeckLockStatus([
      deck("u1", "Unit 1: A"),
      deck("x", "Daily Life"),
    ]);
    expect(status.get("x")).toEqual({ learned: false, locked: false });
  });
});

describe("computeDeckLockStatus — mở khóa tất cả", () => {
  const now = new Date("2026-06-29T00:00:00Z");

  it("unlockAll: true → mọi deck đều mở, giữ nguyên trạng thái đã học", () => {
    const status = computeDeckLockStatus(
      [deck("u1", "Unit 1: A", now), deck("u2", "Unit 2: B"), deck("u3", "Unit 3: C")],
      { unlockAll: true },
    );
    expect(status.get("u1")).toEqual({ learned: true, locked: false });
    expect(status.get("u2")).toEqual({ learned: false, locked: false });
    expect(status.get("u3")).toEqual({ learned: false, locked: false });
  });

  it("unlockAll: false → khóa tuần tự như bình thường", () => {
    const status = computeDeckLockStatus(
      [deck("u1", "Unit 1: A"), deck("u2", "Unit 2: B")],
      { unlockAll: false },
    );
    expect(status.get("u2")).toEqual({ learned: false, locked: true });
  });
});
