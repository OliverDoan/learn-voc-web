/**
 * Nhắc học hằng ngày qua Web Notification.
 *
 * Cấu hình lưu ở localStorage (app dùng cá nhân, không cần đồng bộ server).
 * Logic quyết định "có nhắc lúc này không" tách riêng để test được.
 */

const STORAGE_KEY = "voca-reminder";
const LAST_NOTIFIED_KEY = "voca-reminder-last";

export interface ReminderSettings {
  enabled: boolean;
  /** Giờ nhắc dạng "HH:mm" (giờ local). */
  time: string;
}

export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  time: "20:00",
};

/** Tách "HH:mm" → {hours, minutes}. Trả null nếu sai định dạng/ngoài khoảng. */
export function parseReminderTime(
  time: string,
): { hours: number; minutes: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface ShouldRemindParams {
  settings: ReminderSettings;
  now: Date;
  /** Thời điểm đã nhắc gần nhất (epoch ms), null nếu chưa nhắc lần nào. */
  lastNotifiedAt: number | null;
  /** Hôm nay đã học chưa — đã học thì thôi làm phiền. */
  studiedToday: boolean;
}

/** Đã tới giờ nhắc, chưa học hôm nay và chưa nhắc trong ngày → nhắc. */
export function shouldRemindNow({
  settings,
  now,
  lastNotifiedAt,
  studiedToday,
}: ShouldRemindParams): boolean {
  if (!settings.enabled || studiedToday) return false;

  const parsed = parseReminderTime(settings.time);
  if (!parsed) return false;

  const target = new Date(now);
  target.setHours(parsed.hours, parsed.minutes, 0, 0);
  if (now.getTime() < target.getTime()) return false;

  if (lastNotifiedAt !== null && isSameDay(new Date(lastNotifiedAt), now)) {
    return false;
  }
  return true;
}

/** Đọc cấu hình; mọi dữ liệu hỏng/không hợp lệ đều lùi về mặc định. */
export function loadReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") return DEFAULT_REMINDER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_REMINDER;
    const { enabled, time } = parsed as Partial<ReminderSettings>;
    if (typeof enabled !== "boolean" || typeof time !== "string") {
      return DEFAULT_REMINDER;
    }
    if (!parseReminderTime(time)) return DEFAULT_REMINDER;
    return { enabled, time };
  } catch {
    return DEFAULT_REMINDER;
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* localStorage đầy hoặc bị chặn — bỏ qua, nhắc nhở chỉ là phụ trợ */
  }
}

export function getLastNotifiedAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LAST_NOTIFIED_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function markNotified(at: number = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, String(at));
  } catch {
    /* bỏ qua */
  }
}
