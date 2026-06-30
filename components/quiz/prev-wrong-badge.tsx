import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrevWrongBadgeProps {
  /** Hiện badge khi true (thẻ này đã làm sai ở lần gần nhất). */
  show: boolean;
  className?: string;
}

/**
 * Nhãn nhắc "lần trước bạn sai từ này" — hiển thị trên câu hỏi/thẻ khi người dùng
 * làm lại một dạng bài tập và thẻ hiện tại nằm trong danh sách sai của lần gần nhất.
 */
export function PrevWrongBadge({ show, className }: PrevWrongBadgeProps) {
  if (!show) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400",
        className,
      )}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      Lần trước bạn sai từ này
    </span>
  );
}
