"use client";

import { Flame, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useResetStreak } from "@/hooks/use-progress";
import type { UserProgress } from "@/lib/types";

interface StreakSectionProps {
  progress: UserProgress;
}

/** Hiển thị chuỗi streak và cho phép đặt lại (có xác nhận). */
export function StreakSection({ progress }: StreakSectionProps) {
  const reset = useResetStreak();
  const { confirm, confirmDialog } = useConfirm();

  const handleReset = async () => {
    const okToReset = await confirm({
      title: "Đặt lại chuỗi streak?",
      description: `Chuỗi hiện tại (${progress.currentStreak} ngày) sẽ về 0. Kỷ lục dài nhất (${progress.longestStreak} ngày) được giữ nguyên. Hành động này không thể hoàn tác.`,
      confirmText: "Đặt lại",
      variant: "destructive",
    });
    if (!okToReset) return;

    try {
      await reset.mutateAsync();
      toast.success("Đã đặt lại chuỗi streak");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi đặt lại streak",
      );
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Chuỗi streak</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Đặt lại chuỗi học liên tục về 0 nếu bạn muốn bắt đầu lại từ đầu.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Hiện tại
            </p>
            <p className="text-xl font-bold">{progress.currentStreak} ngày</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Dài nhất
            </p>
            <p className="text-xl font-bold">{progress.longestStreak} ngày</p>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={handleReset}
          disabled={reset.isPending || progress.currentStreak === 0}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Đặt lại
        </Button>
      </div>

      {confirmDialog}
    </section>
  );
}
