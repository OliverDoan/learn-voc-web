"use client";

import { format } from "date-fns";
import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_ATTEMPTS, type TestAttempt } from "@/lib/test-history";

interface TestHistoryProps {
  history: TestAttempt[];
  onClear: () => void;
  /** Ẩn tiêu đề + nút xoá (khi đã có sẵn ở khung ngoài, vd trong dialog). */
  hideHeader?: boolean;
}

/** Lịch sử các từ sai trong deck — dùng dưới bảng kiểm tra và trong dialog. */
export function TestHistory({ history, onClear, hideHeader = false }: TestHistoryProps) {
  if (history.length === 0) return null;

  return (
    <section className={hideHeader ? undefined : "mt-6"}>
      {!hideHeader ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <History className="h-4 w-4 text-primary" /> Lịch sử từ sai
            <span className="font-normal text-muted-foreground">
              ({history.length}/{MAX_ATTEMPTS} lần gần nhất)
            </span>
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Xoá lịch sử
          </Button>
        </div>
      ) : null}

      <div className="space-y-3">
        {history.map((attempt) => (
          <div key={attempt.at} className="rounded-xl border bg-card p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{format(new Date(attempt.at), "HH:mm · dd/MM/yyyy")}</span>
              <span>
                Đúng {attempt.correct}/{attempt.total} ·{" "}
                <span className="text-destructive">sai {attempt.wrong.length}</span>
              </span>
            </div>
            <ul className="space-y-1.5">
              {attempt.wrong.map((w) => (
                <li
                  key={w.cardId}
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm"
                >
                  <span className="text-muted-foreground">{w.meaning}</span>
                  {w.wordWrong ? (
                    <span className="inline-flex items-center gap-1">
                      {w.yourAnswer ? (
                        <span className="text-destructive line-through">{w.yourAnswer}</span>
                      ) : (
                        <span className="italic text-muted-foreground">(bỏ trống)</span>
                      )}
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {w.word}
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium">{w.word}</span>
                  )}
                  {w.posWrong ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">từ loại:</span>
                      <span className="text-destructive line-through">{w.yourPos || "—"}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {w.correctPos}
                      </span>
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
