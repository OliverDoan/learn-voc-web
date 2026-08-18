"use client";

import { Flame, Loader2, RotateCcw, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { useResetStreak, useUpdateProgress } from "@/hooks/use-progress";
import { getStreakState, streakMessage } from "@/lib/streak";
import type { UserProgress } from "@/lib/types";

const MAX_FREEZE = 5;

interface StreakSectionProps {
  progress: UserProgress;
}

/**
 * Chuỗi ngày học: xem chuỗi hiện tại, kỷ lục, số "băng bảo vệ" (freeze token)
 * và đặt lại chuỗi khi muốn bắt đầu lại từ đầu.
 */
export function StreakSection({ progress }: StreakSectionProps) {
  const reset = useResetStreak();
  const update = useUpdateProgress();
  const { confirm, confirmDialog } = useConfirm();

  const state = getStreakState({
    currentStreak: progress.currentStreak,
    lastStudyDate: progress.lastStudyDate,
    freezeTokens: progress.freezeTokens,
  });

  const handleReset = async () => {
    const agreed = await confirm({
      title: "Đặt lại chuỗi ngày học?",
      description:
        "Chuỗi hiện tại sẽ về 0. Kỷ lục dài nhất và số băng bảo vệ được giữ nguyên.",
      confirmText: "Đặt lại",
      variant: "destructive",
    });
    if (!agreed) return;
    try {
      await reset.mutateAsync();
      toast.success("Đã đặt lại chuỗi ngày học");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi đặt lại chuỗi");
    }
  };

  const handleAddFreeze = async () => {
    if (progress.freezeTokens >= MAX_FREEZE) return;
    try {
      await update.mutateAsync({ freezeTokens: progress.freezeTokens + 1 });
      toast.success("Đã thêm 1 băng bảo vệ ❄️");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật");
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Chuỗi ngày học</h2>
      </div>

      <StreakBadge
        current={progress.currentStreak}
        longest={progress.longestStreak}
        freezeTokens={progress.freezeTokens}
      />

      <p className="mt-3 text-sm text-muted-foreground">{streakMessage(state)}</p>

      <div className="mt-4 rounded-xl border border-dashed p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Snowflake className="h-4 w-4 text-sky-500" />
          Băng bảo vệ
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Nếu lỡ đúng một ngày, hệ thống tự dùng 1 băng để chuỗi không bị đứt. Hiện
          có <span className="font-semibold text-foreground">{progress.freezeTokens}</span>{" "}
          / {MAX_FREEZE}.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2.5"
          onClick={handleAddFreeze}
          disabled={progress.freezeTokens >= MAX_FREEZE || update.isPending}
        >
          {update.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Snowflake className="mr-2 h-4 w-4" />
          )}
          Thêm 1 băng
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Đặt lại chuỗi về 0 (giữ nguyên kỷ lục dài nhất).
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={reset.isPending || progress.currentStreak === 0}
        >
          {reset.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Đặt lại
        </Button>
      </div>

      {confirmDialog}
    </section>
  );
}
