import { describe, expect, it } from "vitest";
import { levelFromXp, xpForLevel, xpForReview, xpToNextLevel } from "../xp";

describe("xpForReview", () => {
  it("Good = 5, Easy = 7, Hard = 3, Again = 1", () => {
    expect(xpForReview(3, false)).toBe(5);
    expect(xpForReview(4, false)).toBe(7);
    expect(xpForReview(2, false)).toBe(3);
    expect(xpForReview(1, false)).toBe(1);
  });

  it("isNewCard cộng thêm 10", () => {
    expect(xpForReview(3, true)).toBe(15);
    expect(xpForReview(4, true)).toBe(17);
  });
});

describe("levelFromXp", () => {
  it("0 XP → level 1", () => {
    expect(levelFromXp(0)).toBe(1);
  });
  it("100 XP → level 2", () => {
    expect(levelFromXp(100)).toBe(2);
  });
  it("400 XP → level 3", () => {
    expect(levelFromXp(400)).toBe(3);
  });
  it("900 XP → level 4", () => {
    expect(levelFromXp(900)).toBe(4);
  });
});

describe("xpForLevel", () => {
  it("level 1 = 0, level 2 = 100, level 3 = 400", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(400);
  });
});

describe("xpToNextLevel", () => {
  it("tại level 2 với 250 XP: cần 300 để lên 3", () => {
    const r = xpToNextLevel(250);
    expect(r.current).toBe(150);
    expect(r.needed).toBe(300);
    expect(r.pct).toBe(50);
  });
});
