"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/ui/page-loader";
import { ChineseFlashcard } from "@/components/chinese/chinese-flashcard";
import { WrongLanguageNotice } from "@/components/chinese/wrong-language-notice";
import { isChineseDeck } from "@/lib/chinese";
import { useCards } from "@/hooks/use-cards";
import { useDeck } from "@/hooks/use-decks";
import type { Card } from "@/lib/types";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

/** Trộn mảng (Fisher-Yates) — trả mảng mới, không mutate input. */
function shuffleArray<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function ChineseFlashcardsPage({ params }: PageProps) {
  const { deckId } = use(params);
  const { data: deck } = useDeck(deckId);
  const { data: cards, isLoading } = useCards({ deckId });

  const baseCards = useMemo<Card[]>(
    () => (cards ?? []).filter((c) => !c.deletedAt),
    [cards],
  );

  // null = đang dùng thứ tự gốc của deck; có giá trị = đã bấm "Trộn".
  // Suy ra từ dữ liệu thay vì đồng bộ bằng useEffect để tránh render thừa.
  const [shuffledOrder, setShuffledOrder] = useState<Card[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const order = shuffledOrder ?? baseCards;
  // Dữ liệu deck có thể ngắn đi (xoá thẻ) → kẹp vị trí hiện tại cho an toàn.
  const safePos = order.length === 0 ? 0 : Math.min(pos, order.length - 1);

  const goNext = useCallback(() => {
    setFlipped(false);
    setPos((p) => Math.min(p + 1, Math.max(order.length - 1, 0)));
  }, [order.length]);

  const resetTo = useCallback((next: Card[] | null) => {
    setShuffledOrder(next);
    setPos(0);
    setFlipped(false);
  }, []);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setPos((p) => Math.max(p - 1, 0));
  }, []);

  // Phím tắt: Space lật thẻ, ←/→ chuyển thẻ.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (isLoading) return <PageLoader />;

  if (deck && !isChineseDeck(deck)) {
    return <WrongLanguageNotice href={`/flashcards/${deckId}`} deckName={deck.name} />;
  }

  const current = order[safePos];

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
      <div className="mb-4 flex w-full items-center justify-between">
        <Link
          href={`/chinese/${deckId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {deck?.name ?? "Deck"}
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => resetTo(shuffleArray(baseCards))}
          >
            <Shuffle className="h-4 w-4" /> Trộn
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => resetTo(null)}
          >
            <RotateCcw className="h-4 w-4" /> Thứ tự gốc
          </Button>
        </div>
      </div>

      {!current ? (
        <div className="w-full rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Deck này chưa có từ nào.
        </div>
      ) : (
        <>
          <div className="mb-4 flex w-full max-w-xl items-center gap-3">
            <Progress value={((safePos + 1) / order.length) * 100} className="flex-1" />
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {safePos + 1}/{order.length}
            </span>
          </div>

          <ChineseFlashcard
            card={current}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
          />

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={goPrev} disabled={safePos === 0} className="rounded-full">
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <Button
              onClick={goNext}
              disabled={safePos >= order.length - 1}
              className="rounded-full"
            >
              Sau <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Phím tắt: Space lật thẻ · ← → chuyển thẻ
          </p>
        </>
      )}
    </div>
  );
}
