"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpenText, Headphones, Languages, type LucideIcon } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { ReadingTest, type ReadingTestMode } from "@/components/chinese/reading-test";
import { ReadingView } from "@/components/chinese/reading-view";
import { WrongLanguageNotice } from "@/components/chinese/wrong-language-notice";
import { useDeck } from "@/hooks/use-decks";
import { chineseLessonNumber, isChineseDeck } from "@/lib/chinese";
import { getChineseReading, readingItems } from "@/lib/chinese-readings";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

type Tab = "read" | ReadingTestMode;

const TABS: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "read", label: "Bài đọc", icon: BookOpenText },
  { id: "dictation", label: "Nghe chép", icon: Headphones },
  { id: "translate", label: "Việt → Trung", icon: Languages },
];

export default function ChineseReadingPage({ params }: PageProps) {
  const { deckId } = use(params);
  const { data: deck, isLoading } = useDeck(deckId);
  const [tab, setTab] = useState<Tab>("read");

  const reading = deck ? getChineseReading(chineseLessonNumber(deck.name)) : null;
  const items = useMemo(() => (reading ? readingItems(reading) : []), [reading]);

  if (isLoading) return <PageLoader />;

  if (deck && !isChineseDeck(deck)) {
    return <WrongLanguageNotice href={`/decks/${deckId}`} deckName={deck.name} />;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Link
        href={`/chinese/${deckId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {deck?.name ?? "Deck"}
      </Link>

      {!reading ? (
        <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Bài này chưa có bài đọc.
        </div>
      ) : (
        <>
          <h1 lang="zh-CN" className="mb-1 text-2xl font-bold">
            Bài đọc · {reading.title}
          </h1>
          <p className="mb-5 text-sm text-muted-foreground">
            {items.length} câu · đọc bài rồi luyện nghe chép hoặc dịch Việt → Trung
          </p>

          <div className="mb-5 inline-flex rounded-lg border bg-card p-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {tab === "read" ? (
            <ReadingView reading={reading} />
          ) : (
            // key theo chế độ: đổi chế độ thì bài làm & lịch sử nạp lại từ đầu.
            <ReadingTest
              key={tab}
              items={items}
              mode={tab}
              historyKey={`${deckId}-reading-${tab}`}
            />
          )}
        </>
      )}
    </div>
  );
}
