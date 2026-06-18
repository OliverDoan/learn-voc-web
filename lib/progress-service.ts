import { prisma } from "./db";
import { SINGLETON_PROGRESS_ID } from "./constants";

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
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}) {
  // Đảm bảo record singleton tồn tại trước khi update
  await getUserProgress();
  // Chuỗi rỗng → null để xoá giá trị (tên, bio, avatar)
  const emptyToNull = (v: string | null | undefined) =>
    v === undefined ? undefined : v === "" ? null : v;
  return prisma.userProgress.update({
    where: { id: SINGLETON_PROGRESS_ID },
    data: {
      dailyGoal: patch.dailyGoal,
      freezeTokens: patch.freezeTokens,
      displayName: emptyToNull(patch.displayName),
      bio: emptyToNull(patch.bio),
      avatarUrl: emptyToNull(patch.avatarUrl),
    },
  });
}

/**
 * Đặt lại chuỗi streak hiện tại về 0 và xoá ngày học gần nhất.
 * Giữ nguyên kỷ lục dài nhất (longestStreak) và freezeTokens.
 */
export async function resetStreak() {
  await getUserProgress();
  return prisma.userProgress.update({
    where: { id: SINGLETON_PROGRESS_ID },
    data: {
      currentStreak: 0,
      lastStudyDate: null,
    },
  });
}

export async function recordStudyActivity(now: Date = new Date()) {
  const progress = await getUserProgress();
  const today = startOfDay(now);

  let currentStreak = progress.currentStreak;
  let longestStreak = progress.longestStreak;
  let freezeTokens = progress.freezeTokens;

  if (!progress.lastStudyDate) {
    currentStreak = 1;
  } else {
    const lastDay = startOfDay(progress.lastStudyDate);
    const diff = daysBetween(lastDay, today);
    if (diff === 0) {
      // cùng ngày → không đổi streak
    } else if (diff === 1) {
      currentStreak += 1;
    } else if (diff === 2 && freezeTokens > 0) {
      freezeTokens -= 1;
      currentStreak += 1;
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
    },
  });
}

export async function upsertDailyStat(now: Date, patch: {
  cardsReviewed?: number;
  cardsLearned?: number;
  correctCount?: number;
  totalCount?: number;
  timeSpentSec?: number;
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
    },
  });
}
