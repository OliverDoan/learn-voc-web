"use client";

import { Flame } from "lucide-react";
import { useStreakState } from "@/hooks/use-streak";
import { useDueCount } from "@/hooks/use-due-count";
import { streakMessage } from "@/lib/streak";
import { cn } from "@/lib/utils";
import { useSettingsDialog } from "@/components/settings/settings-dialog";

interface StreakChipProps {
  /** Sidebar đang thu gọn → chỉ hiện icon + số. */
  collapsed?: boolean;
}

/** Chip chuỗi ngày học ở sidebar, đổi màu khi chuỗi sắp mất. */
export function StreakChip({ collapsed = false }: StreakChipProps) {
  const streak = useStreakState();
  const { due } = useDueCount();
  const settings = useSettingsDialog();

  if (!streak) return null;

  const atRisk = streak.status === "at_risk" || streak.status === "urgent";
  const urgent = streak.status === "urgent";

  return (
    <button
      type="button"
      onClick={() => settings?.openSettings("study")}
      title={streakMessage(streak)}
      className={cn(
        "mt-3 flex items-center rounded-[10px] border transition-colors",
        collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2",
        urgent
          ? "border-orange-500/50 bg-orange-500/10"
          : atRisk
            ? "border-primary/30 bg-primary/5"
            : "border-transparent bg-accent/50 hover:bg-accent",
      )}
    >
      <span className="relative flex shrink-0 items-center">
        <Flame
          className={cn(
            "h-[18px] w-[18px]",
            urgent
              ? "text-orange-500"
              : streak.status === "done_today"
                ? "text-primary"
                : "text-muted-foreground",
          )}
        />
      </span>
      {collapsed ? (
        <span className="sr-only">{streak.currentStreak} ngày</span>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">
            {streak.currentStreak} ngày liên tục
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {streak.status === "done_today"
              ? "Hôm nay đã xong ✓"
              : due > 0
                ? `${due} từ đang chờ`
                : "Chưa học hôm nay"}
          </p>
        </div>
      )}
    </button>
  );
}
