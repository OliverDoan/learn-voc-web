"use client";

import { Loader2, Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToggleUnlockAllDecks } from "@/hooks/use-progress";
import type { UserProgress } from "@/lib/types";

interface UnlockDecksSectionProps {
  progress: UserProgress;
}

/**
 * Mở khóa tất cả deck: bỏ qua khóa tuần tự theo Unit để học/tra cứu Unit bất kỳ.
 * Đây là công tắc bật/tắt — KHÔNG đánh dấu "đã học xong", nên tắt lại là các
 * Unit chưa học khóa lại đúng như cũ.
 */
export function UnlockDecksSection({ progress }: UnlockDecksSectionProps) {
  const toggle = useToggleUnlockAllDecks();
  const { confirm, confirmDialog } = useConfirm();
  const unlocked = progress.unlockAllDecks;

  const handleToggle = async () => {
    if (unlocked) {
      const agreed = await confirm({
        title: "Khóa lại theo thứ tự Unit?",
        description:
          "Các Unit chưa đánh dấu học xong sẽ khóa lại. Tiến độ học không bị ảnh hưởng.",
        confirmText: "Khóa lại",
      });
      if (!agreed) return;
    }

    try {
      await toggle.mutateAsync(!unlocked);
      toast.success(
        unlocked ? "Đã bật lại khóa tuần tự theo Unit" : "Đã mở khóa tất cả deck",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật");
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        {unlocked ? (
          <LockOpen className="h-5 w-5 text-primary" />
        ) : (
          <Lock className="h-5 w-5 text-primary" />
        )}
        <h2 className="text-lg font-semibold">Khóa Unit</h2>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Mặc định các Unit mở dần theo thứ tự: phải đánh dấu học xong Unit trước mới
        mở được Unit sau. Bật &quot;Mở khóa tất cả&quot; để học, quiz và tra cứu mọi
        Unit ngay. Không đánh dấu học xong deck nào — tắt đi là khóa lại như cũ.
      </p>

      <div className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {unlocked ? "Đang mở khóa tất cả deck" : "Đang khóa tuần tự theo Unit"}
          </p>
          <p className="text-xs text-muted-foreground">
            {unlocked
              ? "Mọi Unit đều truy cập được, kể cả Unit chưa học."
              : "Chỉ Unit tiếp theo trong chuỗi được mở."}
          </p>
        </div>
        <Button
          variant={unlocked ? "outline" : "default"}
          size="sm"
          className="shrink-0"
          onClick={handleToggle}
          disabled={toggle.isPending}
        >
          {toggle.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : unlocked ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : (
            <LockOpen className="mr-2 h-4 w-4" />
          )}
          {unlocked ? "Khóa lại theo Unit" : "Mở khóa tất cả deck"}
        </Button>
      </div>

      {confirmDialog}
    </section>
  );
}
