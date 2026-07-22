"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeckCard } from "@/components/deck/deck-card";
import { useDecks } from "@/hooks/use-decks";
import {
  groupDecksByTopic,
  topicDeckId,
  topicName,
  topicTitle,
} from "@/lib/deck-topics";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default function TopicPage({ params }: PageProps) {
  const { topicId } = use(params);
  const topicIndex = /^\d+$/.test(topicId) ? Number(topicId) : null;
  const { data: decks, isLoading } = useDecks();

  // Các unit (deck) thuộc topic này, đã sắp theo số Unit.
  const group = useMemo(() => {
    if (!decks || topicIndex === null) return null;
    return groupDecksByTopic(decks).find((g) => g.index === topicIndex) ?? null;
  }, [decks, topicIndex]);

  const totalWords = useMemo(
    () => group?.decks.reduce((sum, d) => sum + d._count.cards, 0) ?? 0,
    [group],
  );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (topicIndex === null || !group || group.decks.length === 0) {
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Layers className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Không tìm thấy topic</h2>
        <p className="mb-6 text-muted-foreground">
          Topic này chưa có unit nào. Hãy quay lại danh sách deck.
        </p>
        <Link href="/decks">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="h-4 w-4" /> Về danh sách deck
          </Button>
        </Link>
      </div>
    );
  }

  const name = topicName(topicIndex);
  const virtualId = topicDeckId(topicIndex);
  const hasWords = totalWords > 0;

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Link
        href="/decks"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Về danh sách deck
      </Link>

      {/* Tiêu đề topic */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {topicTitle(topicIndex)}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{name ?? `Topic ${topicIndex + 1}`}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {group.decks.length} unit · {totalWords} từ
        </p>
      </div>

      {/* Học / lật thẻ cả topic */}
      {hasWords ? (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <Link href={`/study/${virtualId}`}>
            <Button
              size="lg"
              className="h-auto w-full justify-start rounded-2xl py-4 shadow-[0_8px_20px_rgba(23,61,201,.28)]"
            >
              <Sparkles className="h-5 w-5" />
              <span className="flex flex-col items-start">
                <span className="font-semibold">Học cả topic</span>
                <span className="text-xs font-normal opacity-90">
                  Gộp toàn bộ {totalWords} từ (SRS)
                </span>
              </span>
            </Button>
          </Link>
          <Link href={`/flashcards/${virtualId}`}>
            <Button
              size="lg"
              variant="outline"
              className="h-auto w-full justify-start rounded-2xl py-4"
            >
              <BookOpen className="h-5 w-5" />
              <span className="flex flex-col items-start">
                <span className="font-semibold">Lật thẻ cả topic</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Xem nhanh {totalWords} từ
                </span>
              </span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
          Topic này chưa có từ nào. Hãy thêm từ vào các unit bên dưới.
        </div>
      )}

      {/* Danh sách unit trong topic */}
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Các unit
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-2">
        {group.decks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} />
        ))}
      </div>
    </div>
  );
}
