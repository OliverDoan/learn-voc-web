import { prisma } from "./db";
import { DEFAULT_DAILY_GOAL, SINGLETON_PROGRESS_ID } from "./constants";

/** Số băng bảo vệ cấp lại sau khi đặt lại toàn bộ. */
const DEFAULT_FREEZE_TOKENS = 2;

export interface ResetSummary {
  /** Số deck được bỏ đánh dấu "đã học". */
  decksUnlearned: number;
  reviewLogs: number;
  dailyStats: number;
  deckActivities: number;
  exerciseAttempts: number;
  achievements: number;
  /** Số thẻ được đưa về trạng thái NEW. */
  cardsReset: number;
  /** Số thẻ bị bỏ đánh dấu yêu thích. */
  favoritesCleared: number;
}

/**
 * Bỏ đánh dấu "đã học xong" ở mọi deck — tiến độ SRS và lịch sử giữ nguyên.
 * Lưu ý: các Unit sau sẽ khoá lại vì khoá deck suy ra từ `learnedAt`.
 */
export async function resetDeckLearnedStatus(): Promise<number> {
  const result = await prisma.deck.updateMany({
    where: { learnedAt: { not: null } },
    data: { learnedAt: null },
  });
  return result.count;
}

/**
 * Đặt lại TOÀN BỘ dữ liệu học về mặc định: xoá lịch sử ôn, thống kê ngày, tiến
 * độ bài tập, huy hiệu, chuỗi ngày; đưa mọi thẻ về trạng thái NEW và bỏ yêu
 * thích. KHÔNG xoá deck, thẻ, truyện hay hồ sơ cá nhân.
 */
export async function resetAllProgress(): Promise<ResetSummary> {
  const now = new Date();
  const [favoritesCount, cardsCount] = await Promise.all([
    prisma.card.count({ where: { favorite: true } }),
    prisma.card.count(),
  ]);

  // Chạy trong transaction để không rơi vào trạng thái nửa vời khi lỗi giữa chừng.
  const [reviewLogs, dailyStats, deckActivities, exerciseAttempts, achievements, decks] =
    await prisma.$transaction([
      prisma.reviewLog.deleteMany({}),
      prisma.dailyStat.deleteMany({}),
      prisma.deckActivity.deleteMany({}),
      prisma.exerciseAttempt.deleteMany({}),
      prisma.achievement.deleteMany({}),
      prisma.deck.updateMany({
        where: { learnedAt: { not: null } },
        data: { learnedAt: null },
      }),
      prisma.card.updateMany({
        data: {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          state: "NEW",
          lapses: 0,
          nextReviewDate: now,
          favorite: false,
        },
      }),
      prisma.story.updateMany({
        where: { readCount: { gt: 0 } },
        data: { readCount: 0, lastReadAt: null },
      }),
      prisma.userProgress.upsert({
        where: { id: SINGLETON_PROGRESS_ID },
        create: { id: SINGLETON_PROGRESS_ID },
        update: {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: null,
          freezeTokens: DEFAULT_FREEZE_TOKENS,
          dailyGoal: DEFAULT_DAILY_GOAL,
        },
      }),
    ]);

  return {
    decksUnlearned: decks.count,
    reviewLogs: reviewLogs.count,
    dailyStats: dailyStats.count,
    deckActivities: deckActivities.count,
    exerciseAttempts: exerciseAttempts.count,
    achievements: achievements.count,
    cardsReset: cardsCount,
    favoritesCleared: favoritesCount,
  };
}
