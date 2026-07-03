"use client";

import Link from "next/link";
import { Check, ChevronRight, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { activityHref, EXERCISE_PASS_ACCURACY } from "@/lib/deck-activities";
import { cn } from "@/lib/utils";
import type { DeckExerciseStatus } from "@/lib/types";

interface DeckExerciseProgressProps {
  deckId: string;
  exercises: readonly DeckExerciseStatus[];
}

/**
 * Thanh tiến độ "đã làm hết bài tập chưa" của một deck.
 * Chỉ hiển thị các dạng KHẢ DỤNG cho deck (server đã lọc theo số thẻ + dữ liệu thẻ).
 * Mỗi ô là link nhảy thẳng vào dạng bài tương ứng.
 */
export function DeckExerciseProgress({ deckId, exercises }: DeckExerciseProgressProps) {
  if (exercises.length === 0) return null;

  const doneCount = exercises.filter((e) => e.done).length;
  const allDone = doneCount === exercises.length;

  return (
    <div className="mb-6 rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Tiến độ bài tập
          {allDone ? (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓ Hoàn thành</span>
          ) : null}
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {doneCount}/{exercises.length} dạng
        </span>
      </div>

      <Progress value={doneCount} max={exercises.length} className="mb-4" />

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {exercises.map((ex) => {
          const showAccuracy = ex.scored && ex.bestAccuracy != null;
          return (
            <li key={ex.key}>
              <Link
                href={activityHref(ex.key, deckId)}
                title={`Nhấn để làm ngay: ${ex.label}`}
                className={cn(
                  "group flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors",
                  ex.done
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/70 hover:bg-emerald-500/10"
                    : "border-dashed text-muted-foreground hover:border-primary hover:bg-primary/5",
                )}
              >
                {ex.done ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {ex.label}
                </span>
                {showAccuracy ? (
                  <span
                    className={cn(
                      "shrink-0 font-mono",
                      ex.done
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {ex.bestAccuracy}%
                  </span>
                ) : null}
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          );
        })}
      </ul>

      {!allDone ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Nhấn vào từng ô để làm ngay dạng đó. Làm hết các dạng (dạng có chấm điểm cần đạt ≥{" "}
          {EXERCISE_PASS_ACCURACY}%) để mở khóa nút &ldquo;Đánh dấu học xong&rdquo;.
        </p>
      ) : null}
    </div>
  );
}
