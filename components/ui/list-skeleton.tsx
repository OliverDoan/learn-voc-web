import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  /** Số dòng giả. */
  rows?: number;
  /** Có ô icon vuông ở đầu dòng không (giống thẻ deck / thẻ từ). */
  withIcon?: boolean;
  className?: string;
}

/**
 * Khung xương cho danh sách dạng dòng — giữ đúng chiều cao và nhịp của nội dung
 * thật để trang không "nhảy" khi dữ liệu về.
 */
export function ListSkeleton({
  rows = 6,
  withIcon = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border bg-card p-4"
        >
          {withIcon ? <Skeleton className="h-10 w-10 shrink-0 rounded-lg" /> : null}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Độ dài dòng so le cho giống danh sách thật. */}
            <Skeleton className="h-4" style={{ width: `${45 + ((i * 13) % 35)}%` }} />
            <Skeleton className="h-3" style={{ width: `${25 + ((i * 17) % 30)}%` }} />
          </div>
          <Skeleton className="h-4 w-4 shrink-0 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Khung xương cho trang Decks: vài nhóm topic, mỗi nhóm có tiêu đề + dòng. */
export function DeckGroupsSkeleton({ groups = 2 }: { groups?: number }) {
  return (
    <div className="space-y-8" aria-hidden>
      {Array.from({ length: groups }).map((_, i) => (
        <section key={i}>
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-12" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <ListSkeleton rows={3} />
        </section>
      ))}
    </div>
  );
}
