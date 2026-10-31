"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Layers,
  List,
  PenLine,
  Plus,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { splitDeckName } from "@/lib/inbox";
import { ChineseCardsTable } from "@/components/chinese/chinese-cards-table";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import type { Card, DeckWithCounts } from "@/lib/types";
import { IconButton } from "./icon-button";
import { ChineseWordMailRow } from "./chinese-word-mail-row";

interface DeckRef {
  id: string;
  name: string;
}

interface ChineseDeckMailViewProps {
  deckId: string;
  deck: DeckWithCounts | undefined;
  cards: Card[];
  isLoading: boolean;
  hasReading: boolean;
  prevDeck: DeckRef | null | undefined;
  nextDeck: DeckRef | null | undefined;
  onAdd: () => void;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

/** Trang chi tiết deck tiếng Trung kiểu "mở một thư" của Gmail. */
export function ChineseDeckMailView(props: ChineseDeckMailViewProps) {
  const { deckId, deck, cards, isLoading, hasReading, prevDeck, nextDeck } = props;
  const router = useRouter();
  const [view, setView] = useState<"list" | "table">("list");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  const toggle = (card: Card) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  const allOpen = cards.length > 0 && expanded.size === cards.length;
  const name = deck?.name ?? "Deck";
  const { sender } = splitDeckName(name);
  const hasCards = cards.length > 0;

  return (
    <article>
      <div className="sticky top-[var(--shell-top)] z-20 flex h-12 items-center gap-1 rounded-t-2xl bg-card px-2 md:px-4">
        <IconButton label="Quay lại Deck China" onClick={() => router.push("/chinese")}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <IconButton label="Thêm chữ" onClick={props.onAdd}>
          <Plus className="h-5 w-5" />
        </IconButton>
        {hasCards ? (
          <>
            <IconButton label="Lật thẻ" onClick={() => router.push(`/chinese/${deckId}/flashcards`)}>
              <Layers className="h-5 w-5" />
            </IconButton>
            <IconButton label="Luyện viết" onClick={() => router.push(`/chinese/${deckId}/writing`)}>
              <PenLine className="h-5 w-5" />
            </IconButton>
          </>
        ) : null}
        {hasReading ? (
          <IconButton label="Bài đọc" onClick={() => router.push(`/chinese/${deckId}/reading`)}>
            <BookOpenText className="h-5 w-5" />
          </IconButton>
        ) : null}
        <div className="mx-1 h-5 w-px bg-border" />
        <IconButton
          label="Xem dạng danh sách"
          onClick={() => setView("list")}
          className={cn(view === "list" && "bg-mail-active text-foreground")}
        >
          <List className="h-5 w-5" />
        </IconButton>
        <IconButton
          label="Xem dạng bảng"
          onClick={() => setView("table")}
          className={cn(view === "table" && "bg-mail-active text-foreground")}
        >
          <Table2 className="h-5 w-5" />
        </IconButton>

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <span className="hidden sm:inline">{cards.length} từ</span>
          <IconButton
            label={prevDeck ? `Deck trước: ${prevDeck.name}` : "Deck trước"}
            disabled={!prevDeck}
            onClick={() => prevDeck && router.push(`/chinese/${prevDeck.id}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton
            label={nextDeck ? `Deck tiếp theo: ${nextDeck.name}` : "Deck tiếp theo"}
            disabled={!nextDeck}
            onClick={() => nextDeck && router.push(`/chinese/${nextDeck.id}`)}
          >
            <ChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <header className="px-4 pb-4 pt-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3 pb-4 md:pl-14">
          <h1 lang="zh-CN" className="text-[22px] leading-7">
            {name}
          </h1>
          <Link
            href="/chinese"
            className="rounded bg-foreground/[.08] px-1.5 py-px text-xs text-muted-foreground hover:bg-foreground/[.14]"
          >
            Deck China
          </Link>
        </div>
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
            style={{ backgroundColor: `${deck?.color ?? "#3b82f6"}22` }}
          >
            {deck?.icon ?? "🀄"}
          </span>
          <div className="min-w-0 flex-1">
            <b className="text-sm">{sender}</b>
            <p className="text-xs text-muted-foreground">{deck?.description ?? "tới tôi"}</p>
          </div>
          {hasCards && view === "list" ? (
            <button
              type="button"
              onClick={() => setExpanded(allOpen ? new Set() : new Set(cards.map((c) => c.id)))}
              className="shrink-0 text-xs text-primary hover:underline"
            >
              {allOpen ? "Thu gọn tất cả" : "Mở rộng tất cả"}
            </button>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="p-4">
          <ListSkeleton />
        </div>
      ) : !hasCards ? (
        <p className="p-12 text-center text-sm text-muted-foreground">
          Deck này chưa có từ nào — bấm + để thêm chữ.
        </p>
      ) : view === "table" ? (
        <div className="px-4 pb-6 md:px-6">
          <ChineseCardsTable cards={cards} deckId={deckId} />
        </div>
      ) : (
        <div className="border-t pb-6">
          {cards.map((card) => (
            <ChineseWordMailRow
              key={card.id}
              card={card}
              expanded={expanded.has(card.id)}
              onToggle={toggle}
              onEdit={props.onEdit}
              onDelete={props.onDelete}
            />
          ))}
        </div>
      )}
    </article>
  );
}
