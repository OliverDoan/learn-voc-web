"use client";

import { useDueTitle } from "@/hooks/use-due-title";
import { useStudyReminder } from "@/hooks/use-study-reminder";

/**
 * Không render gì — chỉ chạy hai hiệu ứng nền cho toàn bộ khu vực dashboard:
 * nhắc học theo giờ và gắn số thẻ đến hạn vào tiêu đề tab.
 */
export function StudyReminder() {
  useStudyReminder();
  useDueTitle();
  return null;
}
