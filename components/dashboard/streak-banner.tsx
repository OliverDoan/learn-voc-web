"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Snowflake, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/use-progress";
import { useStreakState } from "@/hooks/use-streak";
import { useDueCount } from "@/hooks/use-due-count";
import { dismissForToday, useDismissedToday } from "@/hooks/use-dismissible";
import { streakMessage } from "@/lib/streak";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "voca-streak-banner-dismissed";

/**
 * Banner nhắc giữ chuỗi ngày học, đặt ở đầu trang Decks.
 * Chỉ hiện khi hôm nay chưa học; người dùng có thể ẩn trong ngày.
 */
export function StreakBanner() {
  const streak = useStreakState();
  const { data: progress } = useProgress();
  const { due, total } = useDueCount();
  const dismissed = useDismissedToday(DISMISS_KEY);

  if (!streak || dismissed) return null;
  if (streak.status === "done_today") return null;

  const urgent = streak.status === "urgent";
  const studyHref = due > 0 ? "/study/all" : "/study/all?quick=5";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:gap-4",
        urgent
          ? "border-orange-500/50 bg-gradient-to-r from-orange-500/15 to-red-500/10"
          : "border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Flame
            className={cn(
              "h-9 w-9",
              urgent ? "text-orange-500" : "text-primary",
              streak.status === "broken" && "text-muted-foreground",
            )}
          />
          {streak.currentStreak > 0 ? (
            <span
              className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[10px] font-bold text-white",
                urgent ? "bg-orange-500" : "bg-primary",
              )}
            >
              {streak.currentStreak}
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{streakMessage(streak)}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {total > 0 ? <span>{total} từ đang chờ</span> : null}
            {progress ? (
              <span className="flex items-center gap-1">
                <Snowflake className="h-3 w-3" /> {progress.freezeTokens} băng bảo vệ
              </span>
            ) : null}
            {streak.needsStudyToday && streak.status !== "broken" ? (
              <span>còn {streak.hoursLeft} giờ trong hôm nay</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 sm:ml-auto">
        <Link href={studyHref}>
          <Button size="sm" className="rounded-full">
            <Zap className="h-4 w-4" />
            {due > 0 ? `Ôn ${due} từ` : "Học nhanh 5 từ"}
          </Button>
        </Link>
      </div>

      <button
        type="button"
        onClick={() => dismissForToday(DISMISS_KEY)}
        aria-label="Ẩn nhắc nhở hôm nay"
        className="absolute right-2 top-2 rounded-lg p-1 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground sm:static sm:ml-1"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
