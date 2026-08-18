"use client";

import { useEffect, useRef } from "react";
import {
  getLastNotifiedAt,
  loadReminderSettings,
  markNotified,
  shouldRemindNow,
} from "@/lib/reminder";
import { useDueCount } from "./use-due-count";
import { useStreakState } from "./use-streak";

/** Kiểm tra mỗi phút — đủ chính xác cho một lời nhắc theo giờ. */
const CHECK_MS = 60 * 1000;

function showNotification(due: number, streakDays: number): void {
  const body =
    due > 0
      ? `Bạn có ${due} từ đến hạn ôn hôm nay.`
      : "Dành 2 phút ôn vài từ để giữ nhịp học nhé.";
  const title =
    streakDays > 0
      ? `Giữ chuỗi ${streakDays} ngày của bạn 🔥`
      : "Đến giờ học từ vựng 📚";
  try {
    new Notification(title, { body, icon: "/icons/icon.svg", tag: "voca-reminder" });
    markNotified();
  } catch {
    /* trình duyệt chặn — bỏ qua, nhắc nhở chỉ là phụ trợ */
  }
}

/**
 * Nhắc học hằng ngày bằng Web Notification khi tab đang mở.
 * Không xin quyền ở đây — quyền được xin trong trang Cài đặt (cần cử chỉ người dùng).
 */
export function useStudyReminder(): void {
  const { due } = useDueCount();
  const streak = useStreakState();
  // Giữ giá trị mới nhất cho interval mà không phải tạo lại timer mỗi lần đổi.
  const latest = useRef({ due, streak });

  useEffect(() => {
    latest.current = { due, streak };
  }, [due, streak]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const check = () => {
      if (Notification.permission !== "granted") return;
      const { due: dueNow, streak: streakNow } = latest.current;
      const studiedToday = streakNow?.status === "done_today";
      if (
        shouldRemindNow({
          settings: loadReminderSettings(),
          now: new Date(),
          lastNotifiedAt: getLastNotifiedAt(),
          studiedToday,
        })
      ) {
        showNotification(dueNow, streakNow?.currentStreak ?? 0);
      }
    };

    check();
    const id = setInterval(check, CHECK_MS);
    return () => clearInterval(id);
  }, []);
}
