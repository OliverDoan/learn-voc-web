import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  newlyUnlocked,
  type AchievementStats,
} from "../achievements";

const empty: AchievementStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalReviewed: 0,
  matureCount: 0,
  learnedDecks: 0,
  bestDayReviewed: 0,
  perfectDays: 0,
};

const stats = (patch: Partial<AchievementStats>): AchievementStats => ({
  ...empty,
  ...patch,
});

describe("ACHIEVEMENTS", () => {
  it("mọi huy hiệu có id duy nhất", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mọi huy hiệu có tiêu đề và mô tả", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("evaluateAchievements", () => {
  it("người dùng mới chưa mở khoá gì", () => {
    expect(evaluateAchievements(empty)).toEqual([]);
  });

  it("ôn từ đầu tiên mở khoá first-review", () => {
    expect(evaluateAchievements(stats({ totalReviewed: 1 }))).toContain(
      "first-review",
    );
  });

  it("streak mở khoá theo mốc tăng dần", () => {
    expect(evaluateAchievements(stats({ longestStreak: 3 }))).toContain("streak-3");
    expect(evaluateAchievements(stats({ longestStreak: 3 }))).not.toContain(
      "streak-7",
    );
    const at30 = evaluateAchievements(stats({ longestStreak: 30 }));
    expect(at30).toContain("streak-3");
    expect(at30).toContain("streak-7");
    expect(at30).toContain("streak-30");
  });

  it("tổng số lượt ôn mở khoá mốc 100/500/1000", () => {
    expect(evaluateAchievements(stats({ totalReviewed: 100 }))).toContain(
      "reviewed-100",
    );
    expect(evaluateAchievements(stats({ totalReviewed: 999 }))).not.toContain(
      "reviewed-1000",
    );
    expect(evaluateAchievements(stats({ totalReviewed: 1000 }))).toContain(
      "reviewed-1000",
    );
  });

  it("từ đã thuộc lâu (MATURE) mở khoá mốc 50", () => {
    expect(evaluateAchievements(stats({ matureCount: 50 }))).toContain("mature-50");
  });

  it("học xong deck mở khoá deck-master", () => {
    expect(evaluateAchievements(stats({ learnedDecks: 1 }))).toContain("deck-master");
    expect(evaluateAchievements(stats({ learnedDecks: 5 }))).toContain("deck-5");
  });

  it("ngày học nhiều nhất mở khoá marathon", () => {
    expect(evaluateAchievements(stats({ bestDayReviewed: 100 }))).toContain(
      "marathon",
    );
  });

  it("ngày đúng tuyệt đối mở khoá perfect-day", () => {
    expect(evaluateAchievements(stats({ perfectDays: 1 }))).toContain("perfect-day");
  });
});

describe("newlyUnlocked", () => {
  it("chỉ trả về huy hiệu chưa có trong danh sách đã mở", () => {
    const result = newlyUnlocked(
      stats({ totalReviewed: 100, longestStreak: 3 }),
      ["first-review", "streak-3"],
    );
    expect(result).toEqual(["reviewed-100"]);
  });

  it("không có gì mới → mảng rỗng", () => {
    expect(
      newlyUnlocked(stats({ totalReviewed: 1 }), ["first-review"]),
    ).toEqual([]);
  });
});
