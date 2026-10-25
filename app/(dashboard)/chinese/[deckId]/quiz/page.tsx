"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { ChineseQuizRunner } from "@/components/chinese/chinese-quiz-runner";
import { WrongLanguageNotice } from "@/components/chinese/wrong-language-notice";
import { isChineseDeck } from "@/lib/chinese";
import { useCards } from "@/hooks/use-cards";
import { useDeck } from "@/hooks/use-decks";
import type { Card } from "@/lib/types";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function ChineseQuizPage({ params }: PageProps) {
  const { deckId } = use(params);
  const { data: deck } = useDeck(deckId);
  const { data: cards, isLoading } = useCards({ deckId });

  const liveCards = useMemo<Card[]>(
    () => (cards ?? []).filter((c) => !c.deletedAt),
    [cards],
  );

  if (isLoading) return <PageLoader />;

  if (deck && !isChineseDeck(deck)) {
    return <WrongLanguageNotice href={`/quiz/${deckId}`} deckName={deck.name} />;
  }

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
      <div className="mb-4 w-full">
        <Link
          href={`/chinese/${deckId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {deck?.name ?? "Deck"}
        </Link>
      </div>

      <ChineseQuizRunner cards={liveCards} backHref={`/chinese/${deckId}`} />
    </div>
  );
}
