import type { CardState, Rating } from "./constants";

export interface SRSInput {
  rating: Rating;
  easeFactor: number;
  interval: number;
  repetitions: number;
  lapses?: number;
}

export interface SRSOutput {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  newState: CardState;
  lapses: number;
}

const MIN_EASE = 1.3;
const MATURE_THRESHOLD_DAYS = 21;

function computeState(interval: number, repetitions: number): CardState {
  if (interval >= MATURE_THRESHOLD_DAYS) return "MATURE";
  if (repetitions >= 1) return "REVIEW";
  return "LEARNING";
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

export function calculateNextReview(input: SRSInput, now: Date = new Date()): SRSOutput {
  const { rating, easeFactor: prevEase, interval: prevInterval, repetitions: prevReps } = input;
  const lapses = input.lapses ?? 0;

  if (rating === 1) {
    return {
      easeFactor: Math.max(MIN_EASE, prevEase - 0.2),
      interval: 1,
      repetitions: 0,
      nextReviewDate: addDays(now, 1),
      newState: "LEARNING",
      lapses: lapses + 1,
    };
  }

  let easeFactor = prevEase + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02));
  if (easeFactor < MIN_EASE) easeFactor = MIN_EASE;

  let interval: number;
  if (rating === 2) {
    interval = Math.max(1, Math.round((prevInterval || 1) * 1.2));
  } else {
    if (prevReps === 0) interval = rating === 4 ? 4 : 1;
    else if (prevReps === 1) interval = rating === 4 ? 8 : 6;
    else interval = Math.round(prevInterval * easeFactor * (rating === 4 ? 1.3 : 1));
    interval = Math.max(1, interval);
  }

  const repetitions = prevReps + 1;

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: addDays(now, interval),
    newState: computeState(interval, repetitions),
    lapses,
  };
}

export interface IntervalPreview {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export function previewIntervals(input: Omit<SRSInput, "rating">): IntervalPreview {
  const ratings: Rating[] = [1, 2, 3, 4];
  const [again, hard, good, easy] = ratings.map((r) =>
    calculateNextReview({ ...input, rating: r }).interval,
  );
  return { again, hard, good, easy };
}
