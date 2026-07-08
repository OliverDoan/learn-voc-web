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

// Chuẩn hoá từ gốc để gom nhóm: bỏ phần "(...)", trim, lowercase.
function rootKey(rootWord: string): string {
  return rootWord
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .toLowerCase();
}

interface RootGroup {
  key: string;
  root: string; // hiển thị, vd "rain (n/v)"
  meaning: string | null;
  words: CardWithDeck[];
}

export default function WordRootsPage() {
  const { data: cards, isLoading } = useAllWords();
  const [query, setQuery] = useState("");
  const [detailCard, setDetailCard] = useState<CardWithDeck | null>(null);

  // Gom các từ phái sinh theo từ gốc → mỗi nhóm: 1 từ gốc + nhiều từ vựng.
  const groups = useMemo<RootGroup[]>(() => {
    const derived = (cards ?? []).filter((c) => displayRootWord(c.word, c.rootWord));
    const map = new Map<string, RootGroup>();

    for (const c of derived) {
      const key = rootKey(c.rootWord ?? "");
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.words.push(c);
        if (!existing.meaning && c.rootWordMeaning) existing.meaning = c.rootWordMeaning;
      } else {
        map.set(key, {
          key,
          root: (c.rootWord ?? "").trim(),
          meaning: c.rootWordMeaning ?? null,
          words: [c],
        });
      }
    }

    let list = Array.from(map.values());

    // Tìm kiếm: khớp từ gốc, nghĩa gốc, hoặc bất kỳ từ vựng con nào.
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.root.toLowerCase().includes(q) ||
          (g.meaning ?? "").toLowerCase().includes(q) ||
          g.words.some(
            (w) => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q),
          ),
      );
    }

    // Sắp xếp: nhóm theo từ gốc; từ vựng trong nhóm theo bảng chữ cái.
    for (const g of list) g.words.sort((a, b) => a.word.localeCompare(b.word));
    list.sort((a, b) => a.key.localeCompare(b.key));
    return list;
  }, [cards, query]);

  const totalWords = useMemo(
    () => groups.reduce((sum, g) => sum + g.words.length, 0),
    [groups],
  );

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
          Gom theo từ gốc → các từ vựng phái sinh, ví dụ <b>rain (n/v)</b> → <b>rainy (adj)</b>.
        </p>
      </header>

      <div className="mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo từ gốc, từ vựng hoặc nghĩa…"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {groups.length} từ gốc · {totalWords} từ vựng
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Không có từ nào khớp.</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.key} className="rounded-xl border bg-card p-4">
              {/* Từ gốc */}
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-lg font-bold text-primary">{g.root}</span>
                {g.meaning ? (
                  <span className="text-sm text-muted-foreground">— {g.meaning}</span>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7 shrink-0"
                  onClick={() => speak(rootKey(g.root))}
                  aria-label="Phát âm từ gốc"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Các từ vựng phái sinh */}
              <div className="mt-3 flex items-start gap-2">
                <ArrowRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {g.words.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setDetailCard(w)}
                      className="rounded-lg border bg-background px-2.5 py-1.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
                      title={w.meaning}
                    >
                      <span className="font-semibold">{w.word}</span>
                      {w.partOfSpeech ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({shortPos(w.partOfSpeech)})
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
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
