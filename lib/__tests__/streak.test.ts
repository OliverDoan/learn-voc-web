import { describe, expect, it } from "vitest";
import { getStreakState, URGENT_HOURS } from "../streak";

/** 2026-03-10 lúc 10:00 sáng (giờ local) — mốc "hiện tại" dùng chung. */
const now = new Date(2026, 2, 10, 10, 0, 0);
/** Sát nửa đêm: 21:00 → chỉ còn 3 giờ. */
const lateNow = new Date(2026, 2, 10, 21, 0, 0);

const yesterday = new Date(2026, 2, 9, 20, 0, 0);
const twoDaysAgo = new Date(2026, 2, 8, 20, 0, 0);
const fourDaysAgo = new Date(2026, 2, 6, 20, 0, 0);

describe("getStreakState - chưa có streak", () => {
  it("chưa học bao giờ → none", () => {
    const s = getStreakState(
      { currentStreak: 0, lastStudyDate: null, freezeTokens: 2 },
      now,
    );
    expect(s.status).toBe("none");
    expect(s.currentStreak).toBe(0);
  });

  it("streak = 0 dù có lastStudyDate cũ → none", () => {
    const s = getStreakState(
      { currentStreak: 0, lastStudyDate: fourDaysAgo, freezeTokens: 0 },
      now,
    );
    expect(s.status).toBe("none");
  });
});

describe("getStreakState - đã học hôm nay", () => {
  it("lastStudyDate là hôm nay → done_today", () => {
    const s = getStreakState(
      {
        currentStreak: 5,
        lastStudyDate: new Date(2026, 2, 10, 8, 0, 0),
        freezeTokens: 1,
      },
      now,
    );
    expect(s.status).toBe("done_today");
    expect(s.currentStreak).toBe(5);
  });

  it("nhận cả chuỗi ISO cho lastStudyDate", () => {
    const s = getStreakState(
      {
        currentStreak: 3,
        lastStudyDate: new Date(2026, 2, 10, 8, 0, 0).toISOString(),
        freezeTokens: 0,
      },
      now,
    );
    expect(s.status).toBe("done_today");
  });
});

describe("getStreakState - streak đang treo (học hôm qua)", () => {
  it("còn nhiều giờ → at_risk", () => {
    const s = getStreakState(
      { currentStreak: 7, lastStudyDate: yesterday, freezeTokens: 2 },
      now,
    );
    expect(s.status).toBe("at_risk");
    expect(s.hoursLeft).toBe(14);
  });

  it("còn ít hơn ngưỡng khẩn cấp → urgent", () => {
    const s = getStreakState(
      { currentStreak: 7, lastStudyDate: yesterday, freezeTokens: 2 },
      lateNow,
    );
    expect(s.status).toBe("urgent");
    expect(s.hoursLeft).toBe(3);
    expect(s.hoursLeft).toBeLessThanOrEqual(URGENT_HOURS);
  });
});

describe("getStreakState - đã lỡ 1 ngày", () => {
  it("còn freeze → at_risk và báo freeze sẽ cứu", () => {
    const s = getStreakState(
      { currentStreak: 12, lastStudyDate: twoDaysAgo, freezeTokens: 2 },
      now,
    );
    expect(s.status).toBe("at_risk");
    expect(s.freezeWillSave).toBe(true);
  });

  it("hết freeze → broken", () => {
    const s = getStreakState(
      { currentStreak: 12, lastStudyDate: twoDaysAgo, freezeTokens: 0 },
      now,
    );
    expect(s.status).toBe("broken");
    expect(s.freezeWillSave).toBe(false);
  });

  it("lỡ từ 2 ngày trở lên → broken dù còn freeze", () => {
    const s = getStreakState(
      { currentStreak: 12, lastStudyDate: fourDaysAgo, freezeTokens: 5 },
      now,
    );
    expect(s.status).toBe("broken");
  });
});

describe("getStreakState - cờ tiện dụng", () => {
  it("needsStudyToday đúng khi chưa học hôm nay", () => {
    expect(
      getStreakState(
        { currentStreak: 4, lastStudyDate: yesterday, freezeTokens: 1 },
        now,
      ).needsStudyToday,
    ).toBe(true);
    expect(
      getStreakState(
        { currentStreak: 4, lastStudyDate: now, freezeTokens: 1 },
        now,
      ).needsStudyToday,
    ).toBe(false);
  });

  it("hoursLeft không bao giờ âm và tối đa 24", () => {
    const midnight = new Date(2026, 2, 10, 0, 0, 0);
    const s = getStreakState(
      { currentStreak: 1, lastStudyDate: yesterday, freezeTokens: 0 },
      midnight,
    );
    expect(s.hoursLeft).toBe(24);
    expect(s.hoursLeft).toBeGreaterThan(0);
  });
});
