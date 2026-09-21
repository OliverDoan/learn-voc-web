"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, History } from "lucide-react";
import { cn } from "@/lib/utils";

/** Thông tin tối thiểu để hiện một từ trong danh sách sai. */
export interface PrevWrongEntry {
  id: string;
  word: string;
  meaning: string;
}

interface PrevWrongPanelProps {
  /** ID các thẻ làm sai ở LẦN GẦN NHẤT của đúng dạng bài tập này. */
  wrongIds: readonly string[];
  /** Nguồn tra cứu từ/nghĩa (thường là toàn bộ thẻ của deck). */
  cards: readonly PrevWrongEntry[];
  /** Thẻ đang hỏi — được đánh dấu trong danh sách. */
  currentCardId?: string | null;
  className?: string;
}

/**
 * Bảng "Lần trước bạn sai" mở ngay trong bài tập: xem lại danh sách từ đã làm
 * sai ở lượt gần nhất của chính dạng bài đang làm, không cần rời màn hình.
 * Bổ sung cho {@link PrevWrongBadge} vốn chỉ nhắc ở từng thẻ đang hỏi.
 */
export function PrevWrongPanel({
  wrongIds,
  cards,
  currentCardId,
  className,
}: PrevWrongPanelProps) {
  const [open, setOpen] = useState(false);

  const cardById = new Map(cards.map((c) => [c.id, c]));
  const entries = wrongIds
    .map((id) => cardById.get(id))
    .filter((c): c is PrevWrongEntry => c !== undefined);

  if (entries.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-[13px] font-medium text-amber-600 transition-colors hover:bg-amber-500/15 dark:text-amber-400"
      >
        <History className="h-4 w-4 shrink-0" />
        <span className="flex-1">Lần trước bạn sai {entries.length} từ</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul className="mt-2 divide-y rounded-lg border bg-card text-sm">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={cn(
                "flex items-baseline gap-2 px-3 py-2",
                entry.id === currentCardId && "bg-amber-500/10",
              )}
            >
              <span className="font-semibold">{entry.word}</span>
              <span className="flex-1 text-muted-foreground">{entry.meaning}</span>
              {entry.id === currentCardId ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" /> đang hỏi
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
