import { describe, expect, it } from "vitest";
import { calculateNextReview, previewIntervals } from "../srs";

const now = new Date("2026-01-01T00:00:00Z");

describe("calculateNextReview - Again (rating=1)", () => {
  it("reset repetitions to 0 và interval = 1", () => {
    const result = calculateNextReview(
      { rating: 1, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.newState).toBe("LEARNING");
  });

  it("tăng lapses lên 1", () => {
    const result = calculateNextReview(
      { rating: 1, easeFactor: 2.5, interval: 10, repetitions: 3, lapses: 2 },
      now,
    );
    expect(result.lapses).toBe(3);
  });

  it("giảm easeFactor nhưng không dưới 1.3", () => {
    const result = calculateNextReview(
      { rating: 1, easeFactor: 1.4, interval: 5, repetitions: 2 },
      now,
    );
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("nextReviewDate là 1 ngày sau", () => {
    const result = calculateNextReview(
      { rating: 1, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    const diff = result.nextReviewDate.getTime() - now.getTime();
    expect(diff).toBe(24 * 60 * 60 * 1000);
  });
});

describe("calculateNextReview - Good (rating=3)", () => {
  it("first review (rep=0): interval = 1", () => {
    const result = calculateNextReview(
      { rating: 3, easeFactor: 2.5, interval: 0, repetitions: 0 },
      now,
    );
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it("second review (rep=1): interval = 6", () => {
    const result = calculateNextReview(
      { rating: 3, easeFactor: 2.5, interval: 1, repetitions: 1 },
      now,
    );
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
    expect(result.newState).toBe("REVIEW");
  });

  it("third review: interval = round(prev * ease)", () => {
    const result = calculateNextReview(
      { rating: 3, easeFactor: 2.5, interval: 6, repetitions: 2 },
      now,
    );
    expect(result.interval).toBe(15);
    expect(result.repetitions).toBe(3);
  });

  it("interval >= 21 → MATURE", () => {
    const result = calculateNextReview(
      { rating: 3, easeFactor: 2.5, interval: 15, repetitions: 3 },
      now,
    );
    expect(result.interval).toBeGreaterThanOrEqual(21);
    expect(result.newState).toBe("MATURE");
  });
});

describe("calculateNextReview - Hard (rating=2)", () => {
  it("giảm interval so với Good", () => {
    const hard = calculateNextReview(
      { rating: 2, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    const good = calculateNextReview(
      { rating: 3, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    expect(hard.interval).toBeLessThanOrEqual(good.interval);
  });

  it("giảm easeFactor", () => {
    const result = calculateNextReview(
      { rating: 2, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    expect(result.easeFactor).toBeLessThan(2.5);
  });
});

describe("calculateNextReview - Easy (rating=4)", () => {
  it("tăng interval so với Good", () => {
    const easy = calculateNextReview(
      { rating: 4, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    const good = calculateNextReview(
      { rating: 3, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    expect(easy.interval).toBeGreaterThanOrEqual(good.interval);
  });

  it("tăng easeFactor", () => {
    const result = calculateNextReview(
      { rating: 4, easeFactor: 2.5, interval: 10, repetitions: 3 },
      now,
    );
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });
});

describe("calculateNextReview - bounds", () => {
  it("easeFactor không thấp hơn 1.3 sau Hard liên tục", () => {
    let state = { easeFactor: 1.5, interval: 1, repetitions: 1, lapses: 0 };
    for (let i = 0; i < 20; i++) {
      const r = calculateNextReview({ ...state, rating: 2 }, now);
      state = {
        easeFactor: r.easeFactor,
        interval: r.interval,
        repetitions: r.repetitions,
        lapses: r.lapses,
      };
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("interval luôn >= 1", () => {
    const result = calculateNextReview(
      { rating: 2, easeFactor: 1.3, interval: 0, repetitions: 0 },
      now,
    );
    expect(result.interval).toBeGreaterThanOrEqual(1);
  });
});

describe("previewIntervals", () => {
  it("trả về 4 interval cho 4 rating", () => {
    const preview = previewIntervals({ easeFactor: 2.5, interval: 6, repetitions: 2 });
    expect(preview.again).toBe(1);
    expect(preview.easy).toBeGreaterThanOrEqual(preview.good);
    expect(preview.good).toBeGreaterThanOrEqual(preview.hard);
  });
});
