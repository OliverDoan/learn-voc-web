import { XP_REWARDS } from "./constants";
import type { Rating } from "./constants";

export function xpForReview(rating: Rating, isNewCard: boolean): number {
  let xp: number;
  switch (rating) {
    case 1:
      xp = XP_REWARDS.REVIEW_AGAIN;
      break;
    case 2:
      xp = XP_REWARDS.REVIEW_HARD;
      break;
    case 3:
      xp = XP_REWARDS.REVIEW_GOOD;
      break;
    case 4:
      xp = XP_REWARDS.REVIEW_EASY;
      break;
  }
  if (isNewCard) xp += XP_REWARDS.NEW_CARD;
  return xp;
}

export function levelFromXp(totalXp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, totalXp) / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function xpToNextLevel(totalXp: number): { current: number; needed: number; pct: number } {
  const lv = levelFromXp(totalXp);
  const currentLvXp = xpForLevel(lv);
  const nextLvXp = xpForLevel(lv + 1);
  const current = totalXp - currentLvXp;
  const needed = nextLvXp - currentLvXp;
  const pct = needed === 0 ? 0 : Math.min(100, Math.round((current / needed) * 100));
  return { current, needed, pct };
}
