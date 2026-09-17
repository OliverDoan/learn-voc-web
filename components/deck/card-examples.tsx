"use client";

import { Loader2, Quote, Volume2 } from "lucide-react";
import { speak } from "@/lib/tts";
import { useCardPracticeSentences } from "@/hooks/use-practice-sentences";
import type { Card } from "@/lib/types";

interface CardExamplesProps {
  card: Card;
  /** Chỉ tải khi hộp thoại đang mở (tránh gọi API cho thẻ không ai xem). */
  enabled?: boolean;
}

interface ExampleRow {
  key: string;
  english: string;
  vietnamese: string | null;
}

/**
 * Danh sách câu ví dụ của một từ: câu chính (`card.example`) đứng đầu, sau đó
 * là các câu trong bảng PracticeSentence. Trùng câu tiếng Anh thì chỉ hiện một
 * lần. Mỗi câu có nút loa đọc riêng.
 */
export function CardExamples({ card, enabled = true }: CardExamplesProps) {
  const { data: sentences, isLoading } = useCardPracticeSentences(card.id, enabled);

  const rows: ExampleRow[] = [];
  const seen = new Set<string>();
  const push = (key: string, english: string, vietnamese: string | null) => {
    const normalized = english.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    rows.push({ key, english: english.trim(), vietnamese: vietnamese?.trim() || null });
  };

  if (card.example) push("main", card.example, card.exampleTranslation ?? null);
  for (const s of sentences ?? []) push(s.id, s.english, s.vietnamese);

  if (rows.length === 0) {
    return isLoading ? (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải câu ví dụ…
      </div>
    ) : null;
  }

  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Quote className="h-3.5 w-3.5" />
        Câu ví dụ
        <span className="font-mono normal-case tracking-normal text-muted-foreground/70">
          ({rows.length})
        </span>
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      </div>

      <ol className="space-y-2">
        {rows.map((row, i) => (
          <li key={row.key} className="flex gap-2 rounded-lg border bg-muted/30 p-3">
            <span className="mt-0.5 font-mono text-xs text-muted-foreground/70">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm italic">&ldquo;{row.english}&rdquo;</p>
              {row.vietnamese ? (
                <p className="mt-1 text-sm text-muted-foreground">{row.vietnamese}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => speak(row.english, "en-US")}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Đọc câu này"
              title="Đọc câu này"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
