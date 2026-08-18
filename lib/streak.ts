/**
 * Trạng thái chuỗi ngày học (streak) — logic thuần, dùng chung cho banner cảnh
 * báo, chip ở sidebar và thông báo nhắc học.
 *
 * Quy tắc streak ở server (`lib/progress-service.ts`): học hôm nay và lần học
 * gần nhất là hôm qua → +1; cách 2 ngày mà còn freeze token → tiêu 1 token và
 * vẫn +1; xa hơn → streak reset về 1. File này chỉ SUY ĐOÁN trạng thái để hiển
 * thị, không thay đổi dữ liệu.
 */

/** Dưới ngưỡng này (giờ) thì cảnh báo chuyển sang mức khẩn cấp. */
export const URGENT_HOURS = 4;

export type StreakStatus =
  /** Chưa có chuỗi nào đang chạy. */
  | "none"
  /** Đã học hôm nay → chuỗi an toàn. */
  | "done_today"
  /** Chưa học hôm nay, vẫn còn thời gian trong ngày. */
  | "at_risk"
  /** Chưa học hôm nay và sắp hết ngày. */
  | "urgent"
  /** Đã lỡ quá số ngày cho phép → chuỗi sẽ mất. */
  | "broken";

export interface StreakInput {
  currentStreak: number;
  lastStudyDate: Date | string | null;
  freezeTokens: number;
}

export interface StreakState {
  status: StreakStatus;
  currentStreak: number;
  /** Số giờ còn lại tới nửa đêm (làm tròn lên, 1–24). */
  hoursLeft: number;
  /** Hôm nay chưa học → cần học để giữ chuỗi. */
  needsStudyToday: boolean;
  /** Đã lỡ đúng 1 ngày nhưng còn freeze token cứu được chuỗi. */
  freezeWillSave: boolean;
}

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS,
  );
}

/** Số giờ còn lại tới nửa đêm, làm tròn lên (0 giờ sáng → 24). */
function hoursUntilMidnight(now: Date): number {
  const midnight = startOfDay(now).getTime() + DAY_MS;
  return Math.max(1, Math.ceil((midnight - now.getTime()) / HOUR_MS));
}

export function getStreakState(
  input: StreakInput,
  now: Date = new Date(),
): StreakState {
  const hoursLeft = hoursUntilMidnight(now);
  const last = input.lastStudyDate ? new Date(input.lastStudyDate) : null;

  const base = {
    currentStreak: input.currentStreak,
    hoursLeft,
    needsStudyToday: true,
    freezeWillSave: false,
  };

  if (!last || input.currentStreak <= 0) {
    return { ...base, status: "none" };
  }

  const daysSince = daysBetween(last, now);

  if (daysSince <= 0) {
    return { ...base, status: "done_today", needsStudyToday: false };
  }

  if (daysSince === 1) {
    return {
      ...base,
      status: hoursLeft <= URGENT_HOURS ? "urgent" : "at_risk",
    };
  }

  // Lỡ đúng 1 ngày: server sẽ tiêu 1 freeze token nếu hôm nay học.
  if (daysSince === 2 && input.freezeTokens > 0) {
    return { ...base, status: "at_risk", freezeWillSave: true };
  }

  return { ...base, status: "broken" };
}

/** Câu chữ hiển thị cho từng trạng thái (tiếng Việt, dùng ở banner/thông báo). */
export function streakMessage(state: StreakState): string {
  switch (state.status) {
    case "done_today":
      return `Chuỗi ${state.currentStreak} ngày — hôm nay đã xong, giữ nhịp nhé!`;
    case "at_risk":
      return state.freezeWillSave
        ? `Bạn lỡ mất hôm qua. Học hôm nay để dùng 1 băng bảo vệ và giữ chuỗi ${state.currentStreak} ngày.`
        : `Chuỗi ${state.currentStreak} ngày đang chờ bạn — còn ${state.hoursLeft} giờ trong hôm nay.`;
    case "urgent":
      return `Chỉ còn ${state.hoursLeft} giờ để giữ chuỗi ${state.currentStreak} ngày!`;
    case "broken":
      return "Chuỗi đã dừng. Học một phiên ngắn hôm nay để bắt đầu lại.";
    case "none":
      return "Học một phiên hôm nay để bắt đầu chuỗi ngày của bạn.";
  }
}
