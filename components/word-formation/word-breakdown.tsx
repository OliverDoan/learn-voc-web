"use client";

import { Blocks } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeWord } from "@/lib/word-formation";

interface WordBreakdownProps {
  word: string;
  className?: string;
  /** Vẫn hiện khối (kèm ghi chú) ngay cả khi không dò được affix. */
  alwaysShow?: boolean;
}

/**
 * Hiển thị gợi ý cấu tạo của một từ: tiền tố + gốc + hậu tố kèm nghĩa.
 * Mặc định tự ẩn nếu không dò được tiền/hậu tố nào (trừ khi `alwaysShow`).
 */
export function WordBreakdown({ word, className, alwaysShow = false }: WordBreakdownProps) {
  const a = analyzeWord(word);

  if (!a.hasAny) {
    if (!alwaysShow) return null;
    return (
      <div className={cn("space-y-1 rounded-xl border bg-muted/30 p-3", className)}>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Blocks className="h-3.5 w-3.5" /> Cấu tạo từ (gợi ý)
        </p>
        <p className="text-xs text-muted-foreground">
          Không tách được tiền/hậu tố quen thuộc — có thể đây là từ gốc.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 rounded-xl border bg-muted/30 p-3", className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Blocks className="h-3.5 w-3.5" /> Cấu tạo từ (gợi ý)
      </p>

      {/* Sơ đồ tiền tố + gốc + hậu tố */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        {a.prefixText && (
          <>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 font-semibold text-primary">
              {a.prefixText}-
            </span>
            <span className="text-muted-foreground">+</span>
          </>
        )}
        {a.root && (
          <span className="rounded-md bg-foreground/10 px-2 py-0.5 font-semibold">
            {a.root}
          </span>
        )}
        {a.suffixText && (
          <>
            <span className="text-muted-foreground">+</span>
            <span className="rounded-md bg-success/15 px-2 py-0.5 font-semibold text-success">
              -{a.suffixText}
            </span>
          </>
        )}
      </div>

      {/* Giải nghĩa affix */}
      <ul className="space-y-1 text-xs text-muted-foreground">
        {a.prefix && (
          <li>
            <span className="font-semibold text-foreground">{a.prefix.label}</span>{" "}
            — {a.prefix.meaning}
          </li>
        )}
        {a.suffix && (
          <li>
            <span className="font-semibold text-foreground">{a.suffix.label}</span>{" "}
            — {a.suffix.meaning}
            {a.suffix.makes ? ` (→ ${a.suffix.makes})` : ""}
          </li>
        )}
      </ul>
    </div>
  );
}
