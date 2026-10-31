"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { splitDeckName } from "@/lib/inbox";
import type { DeckWithCounts } from "@/lib/types";

interface DeckMailListProps {
  title: string;
  decks: readonly DeckWithCounts[];
  hrefOf: (deck: DeckWithCounts) => string;
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  /** Hiển thị khi danh sách (sau lọc) rỗng. */
  empty: React.ReactNode;
  fallbackIcon?: string;
}

/** Danh sách deck dạng dòng mail Gmail: người gửi = "Bài N", tiêu đề = phần sau dấu ":". */
export function DeckMailList(props: DeckMailListProps) {
  const { title, decks, hrefOf, search, onSearchChange, onCreate, empty, fallbackIcon = "📘" } = props;

  return (
    <section aria-label={title}>
      <div className="sticky top-[var(--shell-top)] z-20 flex h-14 items-center gap-3 rounded-t-2xl border-b bg-card px-4">
        <h1 className="text-lg">{title}</h1>
        <label className="ml-2 flex h-9 min-w-0 max-w-xs flex-1 items-center gap-2 rounded-full bg-mail-search px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Lọc deck…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Lọc deck theo tên hoặc mô tả"
          />
        </label>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">{decks.length} deck</span>
        <button
          type="button"
          onClick={onCreate}
          className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> Tạo deck
        </button>
      </div>

      {decks.length === 0 ? (
        empty
      ) : (
        <ul>
          {decks.map((deck) => {
            const { sender, subject } = splitDeckName(deck.name);
            return (
              <li key={deck.id}>
                <Link
                  href={hrefOf(deck)}
                  className="group relative flex h-12 items-center gap-3 border-b bg-card pl-4 pr-4 text-sm transition-shadow hover:z-10 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: `${deck.color}22` }}
                  >
                    {deck.icon ?? fallbackIcon}
                  </span>
                  <span className="w-20 shrink-0 truncate font-bold sm:w-[120px]">{sender}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {subject ? <span className="font-bold">{subject}</span> : null}
                    {deck.description ? (
                      <span className="text-muted-foreground">
                        {subject ? " - " : ""}
                        {deck.description}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-xs font-bold">{deck._count.cards} từ</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
