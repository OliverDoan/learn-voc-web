import { cn } from "@/lib/utils";
import { Progress } from "./progress";

/** Trên ngưỡng này thì vẽ thanh liền cho gọn, dưới thì chia từng đoạn. */
const MAX_SEGMENTS = 20;

interface SegmentedProgressProps {
  /** Số thẻ đã hoàn thành. */
  value: number;
  /** Tổng số thẻ trong phiên. */
  total: number;
  className?: string;
}

/**
 * Thanh tiến độ chia đoạn cho phiên học — mỗi đoạn là một thẻ, nhìn ra ngay
 * "còn mấy thẻ nữa là xong" thay vì một dải phần trăm mơ hồ.
 */
export function SegmentedProgress({ value, total, className }: SegmentedProgressProps) {
  if (total <= 0) return null;
  if (total > MAX_SEGMENTS) {
    return <Progress value={value} max={total} className={className} />;
  }

  return (
    <div
      className={cn("flex w-full gap-1", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            i < value ? "bg-primary" : "bg-secondary",
            i === value && "bg-primary/40",
          )}
        />
      ))}
    </div>
  );
}
