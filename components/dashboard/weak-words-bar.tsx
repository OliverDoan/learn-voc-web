"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeakWords } from "@/hooks/use-weak-words";

/** Số từ hay sai đưa vào một phiên ôn nhanh. */
const REVIEW_BATCH = 10;

/**
 * Thanh gợi ý ôn lại các từ hay sai (thống kê từ ReviewLog).
 * Ẩn hoàn toàn khi chưa có dữ liệu — không làm rối trang cho người mới.
 */
export function WeakWordsBar() {
  const { data: weakWords } = useWeakWords();

  if (!weakWords || weakWords.length === 0) return null;

  const batch = weakWords.slice(0, REVIEW_BATCH);
  const ids = batch.map((w) => w.id).join(",");

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <Target className="h-5 w-5 shrink-0 text-amber-500" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {weakWords.length} từ bạn hay quên
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {batch
              .slice(0, 4)
              .map((w) => w.word)
              .join(", ")}
            {batch.length > 4 ? "…" : ""}
          </p>
        </div>
      </div>
      <Link href={`/study/all?ids=${ids}`} className="sm:ml-auto">
        <Button size="sm" variant="outline" className="rounded-full">
          Ôn {batch.length} từ hay sai
        </Button>
      </Link>
    </div>
  );
}
