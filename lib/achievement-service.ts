import { prisma } from "./db";
import {
  evaluateAchievements,
  newlyUnlocked,
  type AchievementStats,
} from "./achievements";
import { getUserProgress } from "./progress-service";

/** Số từ tối thiểu trong ngày để tính là "ngày hoàn hảo". */
const PERFECT_DAY_MIN_CARDS = 10;

/** Gom số liệu cần cho việc xét huy hiệu từ DB. */
export async function collectAchievementStats(): Promise<AchievementStats> {
  const [progress, dailyStats, matureCount, learnedDecks] = await Promise.all([
    getUserProgress(),
    prisma.dailyStat.findMany({
      select: { cardsReviewed: true, correctCount: true, totalCount: true },
    }),
    prisma.card.count({
      where: { state: "MATURE", deletedAt: null, deck: { deletedAt: null } },
    }),
    prisma.deck.count({ where: { deletedAt: null, learnedAt: { not: null } } }),
  ]);

  const totalReviewed = dailyStats.reduce((sum, d) => sum + d.cardsReviewed, 0);
  const bestDayReviewed = dailyStats.reduce(
    (max, d) => Math.max(max, d.cardsReviewed),
    0,
  );
  const perfectDays = dailyStats.filter(
    (d) => d.totalCount >= PERFECT_DAY_MIN_CARDS && d.correctCount === d.totalCount,
  ).length;

  return {
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
    totalReviewed,
    matureCount,
    learnedDecks,
    bestDayReviewed,
    perfectDays,
  };
}

export interface AchievementSyncResult {
  /** Toàn bộ id đã mở khoá (kể cả vừa mở). */
  unlockedIds: string[];
  /** Id vừa mở khoá trong lần gọi này — dùng để bắn toast chúc mừng. */
  newIds: string[];
  stats: AchievementStats;
}

/**
 * Xét lại toàn bộ huy hiệu theo số liệu hiện tại và ghi các huy hiệu mới vào DB.
 * Idempotent: gọi nhiều lần chỉ ghi thêm huy hiệu chưa có.
 */
export async function syncAchievements(): Promise<AchievementSyncResult> {
  const stats = await collectAchievementStats();
  const existing = await prisma.achievement.findMany({ select: { id: true } });
  const existingIds = existing.map((a) => a.id);

  const newIds = newlyUnlocked(stats, existingIds);
  if (newIds.length > 0) {
    await prisma.achievement.createMany({
      data: newIds.map((id) => ({ id })),
      skipDuplicates: true,
    });
  }

  return {
    unlockedIds: evaluateAchievements(stats).filter((id) =>
      [...existingIds, ...newIds].includes(id),
    ),
    newIds,
    stats,
  };
}
