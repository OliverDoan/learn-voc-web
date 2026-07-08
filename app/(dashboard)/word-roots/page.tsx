"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Loader2, Sprout, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardDetailDialog } from "@/components/deck/card-detail-dialog";
import { useAllWords } from "@/hooks/use-cards";
import { speak } from "@/lib/tts";
import { displayRootWord } from "@/lib/utils";
import type { CardWithDeck } from "@/hooks/use-cards";

// Viết tắt từ loại tiếng Anh: noun→n, verb→v, adjective→adj, adverb→adv…
const POS_SHORT: Record<string, string> = {
  noun: "n",
  verb: "v",
  adjective: "adj",
  adverb: "adv",
  pronoun: "pron",
  preposition: "prep",
  conjunction: "conj",
  interjection: "interj",
  determiner: "det",
};

function shortPos(pos: string | null): string {
  if (!pos) return "";
  return pos
    .split(/\s*[/,]\s*/)
    .map((p) => POS_SHORT[p.trim().toLowerCase()] ?? p.trim())
    .join("/");
}

export default function WordRootsPage() {
  const { data: cards, isLoading } = useAllWords();
  const [query, setQuery] = useState("");
  const [detailCard, setDetailCard] = useState<CardWithDeck | null>(null);

  // Chỉ giữ từ có từ gốc KHÁC chính nó (từ phái sinh thật sự).
  const derived = useMemo(() => {
    const list = (cards ?? []).filter((c) => displayRootWord(c.word, c.rootWord));
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (c) =>
            c.word.toLowerCase().includes(q) ||
            (c.rootWord ?? "").toLowerCase().includes(q) ||
            c.meaning.toLowerCase().includes(q),
        )
      : list;
    return [...filtered].sort((a, b) => a.word.localeCompare(b.word));
  }, [cards, query]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sprout className="h-6 w-6 text-primary" /> Từ gốc
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Danh sách từ phái sinh và từ gốc của chúng, ví dụ <b>rainy (adj)</b> → <b>rain (n/v)</b>.
        </p>
      </header>

      <div className="mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo từ, từ gốc hoặc nghĩa…"
        />
        <p className="mt-2 text-xs text-muted-foreground">{derived.length} từ có từ gốc</p>
      </div>

      {derived.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Không có từ nào khớp.
        </p>
      ) : (
        <ul className="space-y-2">
          {derived.map((card) => (
            <li
              key={card.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => speak(card.word)}
                aria-label="Phát âm"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => setDetailCard(card)}
                className="min-w-0 flex-1 text-left"
                title="Xem chi tiết"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold">
                    {card.word}
                    {card.partOfSpeech ? (
                      <span className="ml-1 font-normal text-muted-foreground">
                        ({shortPos(card.partOfSpeech)})
                      </span>
                    ) : null}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-primary">{card.rootWord}</span>
                  {card.rootWordMeaning ? (
                    <span className="text-sm text-muted-foreground">— {card.rootWordMeaning}</span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{card.meaning}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CardDetailDialog
        open={!!detailCard}
        onOpenChange={(o) => !o && setDetailCard(null)}
        card={detailCard ?? undefined}
      />
    </div>
  );
}
