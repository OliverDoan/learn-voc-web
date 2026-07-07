"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  activityHref,
  EXERCISE_PASS_ACCURACY,
  requiredExerciseCount,
} from "@/lib/deck-activities";
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
  // Mặc định đóng — người dùng bấm để mở xem chi tiết các dạng bài.
  const [open, setOpen] = useState(false);

  if (exercises.length === 0) return null;

  const doneCount = exercises.filter((e) => e.done).length;
  const required = requiredExerciseCount(exercises.length);
  // Đủ điều kiện mở khóa: chỉ cần làm ≥ số dạng tối thiểu (cho phép thiếu 1 dạng).
  const canUnlock = doneCount >= required;
  const remaining = Math.max(0, required - doneCount);

  return (
    <div className="mb-6 rounded-2xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", open ? "" : "-rotate-90")}
          />
          Tiến độ bài tập
          {canUnlock ? (
            <span className="text-emerald-600 dark:text-emerald-400">✓ Đã đủ để mở khóa</span>
          ) : null}
        </h2>
        <span className="flex items-center gap-2">
          {/* Thanh progress thu nhỏ luôn hiển thị (kể cả khi đóng) */}
          <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${(doneCount / exercises.length) * 100}%` }}
            />
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {doneCount}/{exercises.length} dạng
          </span>
        </span>
      </button>

      {open ? (
        <div className="px-4 pb-4">
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

          {!canUnlock ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Nhấn vào từng ô để làm ngay dạng đó. Chỉ cần làm {required}/{exercises.length} dạng
              (dạng có chấm điểm cần đạt ≥ {EXERCISE_PASS_ACCURACY}%) để mở khóa nút &ldquo;Đánh dấu
              học xong&rdquo; — còn thiếu {remaining} dạng.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
