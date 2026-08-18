"use client";

import { AlertTriangle, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useResetProgress } from "@/hooks/use-progress";
import { clearAllTestHistory } from "@/lib/test-history";

/**
 * Vùng nguy hiểm: bỏ đánh dấu đã học, hoặc đưa toàn bộ dữ liệu học về mặc định.
 * Deck, từ vựng và truyện KHÔNG bị xoá — chỉ tiến độ và lịch sử.
 */
export function ResetSection() {
  const reset = useResetProgress();
  const { confirm, confirmDialog } = useConfirm();

  const handleResetLearned = async () => {
    const agreed = await confirm({
      title: "Bỏ đánh dấu đã học ở mọi deck?",
      description:
        "Mọi Unit sẽ trở về trạng thái chưa học, và các Unit sau sẽ khoá lại. Lịch sử ôn và tiến độ SRS được giữ nguyên.",
      confirmText: "Bỏ đánh dấu",
      variant: "destructive",
    });
    if (!agreed) return;

    try {
      const result = await reset.mutateAsync("learned");
      toast.success(`Đã bỏ đánh dấu học xong ở ${result.decksUnlearned} deck`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi đặt lại");
    }
  };

  const handleResetAll = async () => {
    const agreed = await confirm({
      title: "Đặt lại toàn bộ về mặc định?",
      description:
        "Xoá sạch lịch sử ôn, thống kê, tiến độ bài tập, huy hiệu, chuỗi ngày học và danh sách yêu thích; mọi từ trở về trạng thái chưa học. Deck, từ vựng và truyện được giữ nguyên. Không thể hoàn tác.",
      confirmText: "Xoá và đặt lại",
      variant: "destructive",
    });
    if (!agreed) return;

    try {
      const result = await reset.mutateAsync("all");
      // Lịch sử làm bài "Kiểm tra" nằm ở localStorage nên phải dọn riêng.
      clearAllTestHistory();
      toast.success("Đã đặt lại về mặc định", {
        description: `Xoá ${result.reviewLogs ?? 0} lượt ôn, ${result.achievements ?? 0} huy hiệu; ${result.cardsReset ?? 0} từ về trạng thái mới.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi đặt lại");
    }
  };

  return (
    <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-lg font-semibold">Đặt lại dữ liệu học</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Deck, từ vựng và truyện chêm luôn được giữ nguyên — chỉ tiến độ học bị đặt lại.
      </p>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Bỏ đánh dấu &quot;đã học xong&quot;</p>
            <p className="text-xs text-muted-foreground">
              Mọi Unit trở về chưa học (các Unit sau sẽ khoá lại). Giữ nguyên lịch sử ôn.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleResetLearned}
            disabled={reset.isPending}
          >
            {reset.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Bỏ đánh dấu
          </Button>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Đặt lại toàn bộ về mặc định</p>
            <p className="text-xs text-muted-foreground">
              Xoá lịch sử ôn, thống kê, tiến độ bài tập, huy hiệu, chuỗi ngày, từ yêu
              thích; mọi từ về trạng thái mới.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={handleResetAll}
            disabled={reset.isPending}
          >
            {reset.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Đặt lại tất cả
          </Button>
        </div>
      </div>

      {confirmDialog}
    </section>
  );
}
