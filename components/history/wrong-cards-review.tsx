"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { BookOpen, Dumbbell, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { speak } from "@/lib/tts";
import type { WrongCardItem } from "@/lib/types";

interface WrongCardsReviewProps {
  cards: readonly WrongCardItem[];
}

interface DeckGroup {
  deckId: string;
  deckName: string;
  cards: WrongCardItem[];
}

/** Danh sách "Câu sai cần ôn", nhóm theo deck, kèm nút ôn lại nhanh. */
export function WrongCardsReview({ cards }: WrongCardsReviewProps) {
  // Gom theo deck, giữ thứ tự xuất hiện (đã sắp theo số lần sai từ server).
  const groups = useMemo<DeckGroup[]>(() => {
    const map = new Map<string, DeckGroup>();
    for (const c of cards) {
      const g = map.get(c.deck.id);
      if (g) g.cards.push(c);
      else map.set(c.deck.id, { deckId: c.deck.id, deckName: c.deck.name, cards: [c] });
    }
    return Array.from(map.values());
  }, [cards]);

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có câu sai nào. Làm quiz hoặc bài kiểm tra, những từ bạn sai sẽ hiện ở đây để ôn lại.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        // Ôn lại đúng các từ đã sai của deck này (quiz tự chọn theo ids).
        const ids = g.cards.map((c) => c.id).join(",");
        const reviewHref = `/quiz/${g.deckId}?ids=${encodeURIComponent(ids)}`;
        return (
          <div key={g.deckId} className="rounded-2xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Link
                href={`/decks/${g.deckId}`}
                className="flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold hover:text-primary"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                {g.deckName}
                <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">
                  {g.cards.length} từ
                </span>
              </Link>
              <Link href={reviewHref} className="shrink-0">
                <Button size="sm" className="rounded-full">
                  <Dumbbell className="h-4 w-4" /> Ôn lại
                </Button>
              </Link>
            </div>

            <ul className="space-y-1.5">
              {g.cards.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => speak(c.word)}
                    className="shrink-0 text-muted-foreground hover:text-primary"
                    aria-label={`Phát âm ${c.word}`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold">{c.word}</span>
                      {c.phonetic ? (
                        <span className="font-phonetic text-xs text-muted-foreground">
                          {c.phonetic}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{c.meaning}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <Badge variant="destructive" className="text-[10px]">
                      sai {c.wrongCount} lần
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(c.lastWrongAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
