"use client";

import { BookOpen, Check, Layers, Mic, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SelectionActivity = "study" | "quiz" | "flashcards" | "pronounce";

interface SelectionActionBarProps {
  count: number;
  /** Deck đang khoá → chặn các hoạt động tính vào tiến độ. */
  locked: boolean;
  onOpen: (activity: SelectionActivity) => void;
  onClear: () => void;
}

/** Thanh nổi ở đáy màn hình khi đang chọn nhiều từ trong deck. */
export function SelectionActionBar({
  count,
  locked,
  onOpen,
  onClear,
}: SelectionActionBarProps) {
  if (count === 0) return null;

  const lockedTitle = locked ? "Hoàn thành deck trước để mở khóa" : undefined;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-4 md:bottom-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="h-4 w-4" />
            </span>
            <span>
              Đã chọn <strong className="text-primary">{count}</strong> từ
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => onOpen("study")}
              disabled={locked}
              title={lockedTitle}
            >
              <Play className="h-4 w-4" /> Ôn
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpen("flashcards")}>
              <Layers className="h-4 w-4" /> Lật thẻ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpen("quiz")}
              disabled={locked}
              title={lockedTitle}
            >
              <BookOpen className="h-4 w-4" /> Quiz
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpen("pronounce")}>
              <Mic className="h-4 w-4" /> Phát âm
            </Button>
            <Button size="sm" variant="ghost" onClick={onClear}>
              <X className="h-4 w-4" /> Bỏ chọn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
