"use client";

import { useEffect, useMemo, useState } from "react";
import { useProgress } from "./use-progress";
import { getStreakState, type StreakState } from "@/lib/streak";

/** Nhịp cập nhật lại trạng thái (mỗi 5 phút) để "còn N giờ" không bị đứng yên. */
const TICK_MS = 5 * 60 * 1000;

/**
 * Trạng thái streak để hiển thị. Trả về undefined khi chưa tải xong progress —
 * tránh nháy banner sai lúc đầu.
 */
export function useStreakState(): StreakState | undefined {
  const { data: progress } = useProgress();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!progress) return undefined;
    // `tick` chỉ để ép tính lại theo thời gian trôi.
    void tick;
    return getStreakState({
      currentStreak: progress.currentStreak,
      lastStudyDate: progress.lastStudyDate,
      freezeTokens: progress.freezeTokens,
    });
  }, [progress, tick]);
}
