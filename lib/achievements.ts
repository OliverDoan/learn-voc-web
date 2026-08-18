/**
 * Huy hiệu thành tích — định nghĩa tĩnh + hàm đánh giá thuần (test được).
 *
 * Model `Achievement` trong DB chỉ lưu id đã mở khoá; toàn bộ điều kiện nằm ở
 * file này để thêm/sửa huy hiệu không cần migration.
 */

export interface AchievementStats {
  currentStreak: number;
  longestStreak: number;
  /** Tổng số lượt ôn từ trước tới nay (cộng dồn DailyStat). */
  totalReviewed: number;
  /** Số thẻ đang ở trạng thái MATURE. */
  matureCount: number;
  /** Số deck đã đánh dấu học xong. */
  learnedDecks: number;
  /** Số từ ôn trong ngày nhiều nhất. */
  bestDayReviewed: number;
  /** Số ngày đúng 100% (tối thiểu 10 từ trong ngày). */
  perfectDays: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Điều kiện mở khoá. */
  check: (stats: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: "first-review",
    title: "Bước đầu tiên",
    description: "Ôn từ đầu tiên của bạn",
    icon: "🌱",
    check: (s) => s.totalReviewed >= 1,
  },
  {
    id: "streak-3",
    title: "Ba ngày liền",
    description: "Giữ chuỗi học 3 ngày",
    icon: "🔥",
    check: (s) => s.longestStreak >= 3,
  },
  {
    id: "streak-7",
    title: "Trọn một tuần",
    description: "Giữ chuỗi học 7 ngày",
    icon: "⚡",
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: "streak-30",
    title: "Một tháng bền bỉ",
    description: "Giữ chuỗi học 30 ngày",
    icon: "🏔️",
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: "streak-100",
    title: "Trăm ngày không nghỉ",
    description: "Giữ chuỗi học 100 ngày",
    icon: "💎",
    check: (s) => s.longestStreak >= 100,
  },
  {
    id: "reviewed-100",
    title: "Trăm lượt ôn",
    description: "Hoàn thành 100 lượt ôn từ",
    icon: "📗",
    check: (s) => s.totalReviewed >= 100,
  },
  {
    id: "reviewed-500",
    title: "Năm trăm lượt ôn",
    description: "Hoàn thành 500 lượt ôn từ",
    icon: "📚",
    check: (s) => s.totalReviewed >= 500,
  },
  {
    id: "reviewed-1000",
    title: "Nghìn lượt ôn",
    description: "Hoàn thành 1000 lượt ôn từ",
    icon: "🎓",
    check: (s) => s.totalReviewed >= 1000,
  },
  {
    id: "mature-50",
    title: "Vốn từ vững",
    description: "Có 50 từ đã thuộc lâu dài",
    icon: "🌳",
    check: (s) => s.matureCount >= 50,
  },
  {
    id: "deck-master",
    title: "Xong Unit đầu tiên",
    description: "Đánh dấu học xong một deck",
    icon: "✅",
    check: (s) => s.learnedDecks >= 1,
  },
  {
    id: "deck-5",
    title: "Năm Unit",
    description: "Học xong 5 deck",
    icon: "🏅",
    check: (s) => s.learnedDecks >= 5,
  },
  {
    id: "marathon",
    title: "Ngày cày cuốc",
    description: "Ôn 100 từ trong một ngày",
    icon: "🚀",
    check: (s) => s.bestDayReviewed >= 100,
  },
  {
    id: "perfect-day",
    title: "Ngày hoàn hảo",
    description: "Một ngày đúng 100% với ít nhất 10 từ",
    icon: "🎯",
    check: (s) => s.perfectDays >= 1,
  },
];

/** Danh sách id huy hiệu thoả điều kiện với số liệu hiện tại. */
export function evaluateAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id);
}

/** Huy hiệu vừa đạt được mà chưa có trong danh sách đã mở khoá. */
export function newlyUnlocked(
  stats: AchievementStats,
  unlockedIds: readonly string[],
): string[] {
  const owned = new Set(unlockedIds);
  return evaluateAchievements(stats).filter((id) => !owned.has(id));
}

/** Tra định nghĩa theo id (không có → undefined). */
export function findAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
