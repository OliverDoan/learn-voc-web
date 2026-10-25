"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { ChineseWritingPractice } from "@/components/chinese/chinese-writing-practice";
import { WrongLanguageNotice } from "@/components/chinese/wrong-language-notice";
import { useCards } from "@/hooks/use-cards";
import { useDeck } from "@/hooks/use-decks";
import { isChineseDeck } from "@/lib/chinese";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function ChineseWritingPage({ params }: PageProps) {
  const { deckId } = use(params);
  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: cards, isLoading: cardsLoading } = useCards({ deckId });

  // Chờ đủ thẻ rồi mới dựng màn luyện: danh sách từ chốt lúc khởi tạo.
  if (deckLoading || cardsLoading) return <PageLoader />;

  if (deck && !isChineseDeck(deck)) {
    return <WrongLanguageNotice href={`/decks/${deckId}`} deckName={deck.name} />;
  }

  const liveCards = (cards ?? []).filter((c) => !c.deletedAt);

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Link
        href={`/chinese/${deckId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {deck?.name ?? "Deck"}
      </Link>
      <h1 className="mb-5 text-2xl font-bold">Luyện viết chữ Hán</h1>

      <ChineseWritingPractice cards={liveCards} historyKey={`${deckId}-writing`} />
    </div>
  );
}
