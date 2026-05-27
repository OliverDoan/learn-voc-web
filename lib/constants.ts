export const CARD_STATES = ["NEW", "LEARNING", "REVIEW", "MATURE", "SUSPENDED"] as const;
export type CardState = (typeof CARD_STATES)[number];

export const RATINGS = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
} as const;

export type Rating = (typeof RATINGS)[keyof typeof RATINGS];

export const RATING_LABELS: Record<Rating, string> = {
  1: "Quên",
  2: "Khó",
  3: "Tốt",
  4: "Dễ",
};

export const RATING_COLORS: Record<Rating, string> = {
  1: "bg-red-500 hover:bg-red-600 text-white",
  2: "bg-orange-500 hover:bg-orange-600 text-white",
  3: "bg-green-500 hover:bg-green-600 text-white",
  4: "bg-emerald-600 hover:bg-emerald-700 text-white",
};

export const XP_REWARDS = {
  REVIEW_GOOD: 5,
  REVIEW_EASY: 7,
  REVIEW_HARD: 3,
  REVIEW_AGAIN: 1,
  NEW_CARD: 10,
  DAILY_GOAL: 50,
  MAINTAIN_STREAK: 20,
} as const;

export const DEFAULT_DAILY_GOAL = 20;
export const SINGLETON_PROGRESS_ID = "singleton";

export const DECK_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
] as const;
