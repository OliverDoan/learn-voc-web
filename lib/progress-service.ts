import { prisma } from "./db";
import { SINGLETON_PROGRESS_ID, XP_REWARDS } from "./constants";
import { levelFromXp } from "./xp";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / (1000 * 60 * 60 * 24));
}

export async function getUserProgress() {
  return prisma.userProgress.upsert({
    where: { id: SINGLETON_PROGRESS_ID },
    update: {},
    create: { id: SINGLETON_PROGRESS_ID },
  });
}

export async function updateUserProgress(patch: {
  dailyGoal?: number;
  freezeTokens?: number;
}) {
  // Đảm bảo record singleton tồn tại trước khi update
  await getUserProgress();
  return prisma.userProgress.update({
    where: { id: SINGLETON_PROGRESS_ID },
    data: patch,
  });
}

export async function recordStudyActivity(now: Date = new Date()) {
  const progress = await getUserProgress();
  const today = startOfDay(now);

  let currentStreak = progress.currentStreak;
  let longestStreak = progress.longestStreak;
  let freezeTokens = progress.freezeTokens;
  let xpBonus = 0;

  if (!progress.lastStudyDate) {
    currentStreak = 1;
    xpBonus += XP_REWARDS.MAINTAIN_STREAK;
  } else {
    const lastDay = startOfDay(progress.lastStudyDate);
    const diff = daysBetween(lastDay, today);
    if (diff === 0) {
      // cùng ngày → không đổi streak
    } else if (diff === 1) {
      currentStreak += 1;
      xpBonus += XP_REWARDS.MAINTAIN_STREAK;
    } else if (diff === 2 && freezeTokens > 0) {
      freezeTokens -= 1;
      currentStreak += 1;
      xpBonus += XP_REWARDS.MAINTAIN_STREAK;
    } else {
      currentStreak = 1;
    }
  }

  if (currentStreak > longestStreak) longestStreak = currentStreak;

  return prisma.userProgress.update({
    where: { id: SINGLETON_PROGRESS_ID },
    data: {
      currentStreak,
      longestStreak,
      freezeTokens,
      lastStudyDate: now,
      totalXp: { increment: xpBonus },
    },
  });
}

export async function addXp(amount: number) {
  if (amount <= 0) return getUserProgress();
  const updated = await prisma.userProgress.update({
    where: { id: SINGLETON_PROGRESS_ID },
    data: { totalXp: { increment: amount } },
  });
  const newLevel = levelFromXp(updated.totalXp);
  if (newLevel !== updated.level) {
    return prisma.userProgress.update({
      where: { id: SINGLETON_PROGRESS_ID },
      data: { level: newLevel },
    });
  }
  return updated;
}

export async function upsertDailyStat(now: Date, patch: {
  cardsReviewed?: number;
  cardsLearned?: number;
  correctCount?: number;
  totalCount?: number;
  timeSpentSec?: number;
  xpEarned?: number;
}) {
  const day = startOfDay(now);
  return prisma.dailyStat.upsert({
    where: { date: day },
    create: { date: day, ...patch },
    update: {
      cardsReviewed: { increment: patch.cardsReviewed ?? 0 },
      cardsLearned: { increment: patch.cardsLearned ?? 0 },
      correctCount: { increment: patch.correctCount ?? 0 },
      totalCount: { increment: patch.totalCount ?? 0 },
      timeSpentSec: { increment: patch.timeSpentSec ?? 0 },
      xpEarned: { increment: patch.xpEarned ?? 0 },
    },
  });
}
