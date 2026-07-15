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

const norm = (s: string): string => s.trim().toLowerCase();

// Chuẩn hoá từ gốc để gom nhóm: bỏ phần "(...)", trim, lowercase.
function rootKey(rootWord: string): string {
  return norm(rootWord.replace(/\s*\([^)]*\)\s*$/, ""));
}

interface RootGroup {
  key: string;
  header: string; // "engine (n)"
  meaning: string | null;
  rootCard: CardWithDeck | null; // nếu chính từ gốc cũng là một thẻ
  words: CardWithDeck[]; // các từ vựng phái sinh trong họ
}

export default function WordRootsPage() {
  const { data: cards, isLoading } = useAllWords();
  const [query, setQuery] = useState("");
  const [detailCard, setDetailCard] = useState<CardWithDeck | null>(null);

  // Gom các từ phái sinh thành "họ từ" — nối chuỗi engine→engineer→engineering
  // bằng union-find để những từ gốc trùng/nối tiếp nhau về chung một nhóm.
  const groups = useMemo<RootGroup[]>(() => {
    const all = cards ?? [];
    const derived = all.filter((c) => displayRootWord(c.word, c.rootWord));

    // Union-find trên chuỗi từ (đã chuẩn hoá).
    const parent = new Map<string, string>();
    const find = (x: string): string => {
      if (!parent.has(x)) parent.set(x, x);
      let root = x;
      while (parent.get(root) !== root) root = parent.get(root)!;
      while (parent.get(x) !== root) {
        const next = parent.get(x)!;
        parent.set(x, root);
        x = next;
      }
      return root;
    };
    const union = (a: string, b: string) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    };

    for (const c of derived) union(norm(c.word), rootKey(c.rootWord ?? ""));

    // Tra cứu phụ trợ
    const cardByWord = new Map<string, CardWithDeck>();
    for (const c of all) {
      const w = norm(c.word);
      if (!cardByWord.has(w)) cardByWord.set(w, c);
    }
    const rootDisplay = new Map<string, { label: string; meaning: string | null }>();
    for (const c of derived) {
      const rk = rootKey(c.rootWord ?? "");
      if (!rk) continue;
      const cur = rootDisplay.get(rk);
      if (!cur) rootDisplay.set(rk, { label: (c.rootWord ?? "").trim(), meaning: c.rootWordMeaning ?? null });
      else if (!cur.meaning && c.rootWordMeaning) cur.meaning = c.rootWordMeaning;
    }
    // Từ phái sinh = xuất hiện ở vế trái (word) của một thẻ có từ gốc khác nó.
    const derivedTokens = new Set(derived.map((c) => norm(c.word)));

    // Gom thẻ phái sinh theo thành phần liên thông + tập token của mỗi nhóm.
    const compCards = new Map<string, CardWithDeck[]>();
    const compTokens = new Map<string, Set<string>>();
    for (const c of derived) {
      const r = find(norm(c.word));
      (compCards.get(r) ?? compCards.set(r, []).get(r)!).push(c);
    }
    for (const t of parent.keys()) {
      const r = find(t);
      (compTokens.get(r) ?? compTokens.set(r, new Set()).get(r)!).add(t);
    }

    const list: RootGroup[] = [];
    for (const [r, ws] of compCards) {
      const tokens = compTokens.get(r) ?? new Set(ws.map((w) => norm(w.word)));
      // Từ gốc "gốc nhất" của họ = token không phải từ phái sinh.
      const rootTokens = [...tokens].filter((t) => !derivedTokens.has(t));
      const primary =
        rootTokens.sort((a, b) => {
          const fa = ws.filter((w) => rootKey(w.rootWord ?? "") === a).length;
          const fb = ws.filter((w) => rootKey(w.rootWord ?? "") === b).length;
          return fb !== fa ? fb - fa : a.localeCompare(b);
        })[0] ?? [...tokens].sort()[0];

      const rootCard = cardByWord.get(primary) ?? null;
      const rd = rootDisplay.get(primary);
      const header = rootCard
        ? `${rootCard.word}${rootCard.partOfSpeech ? ` (${shortPos(rootCard.partOfSpeech)})` : ""}`
        : (rd?.label ?? primary);
      const meaning = rootCard ? rootCard.meaning : (rd?.meaning ?? null);

      const words = ws
        .filter((w) => norm(w.word) !== primary)
        .sort((a, b) => a.word.localeCompare(b.word));
      if (words.length === 0) continue;

      list.push({ key: primary, header, meaning, rootCard, words });
    }

    // Tìm kiếm
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (g) =>
            g.header.toLowerCase().includes(q) ||
            (g.meaning ?? "").toLowerCase().includes(q) ||
            g.words.some(
              (w) => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q),
            ),
        )
      : list;

    filtered.sort((a, b) => a.key.localeCompare(b.key));
    return filtered;
  }, [cards, query]);

  const totalWords = useMemo(
    () => groups.reduce((sum, g) => sum + g.words.length, 0),
    [groups],
  );

  // Danh sách phẳng theo đúng thứ tự hiển thị (từ gốc rồi các từ phái sinh)
  // để nút mũi tên / phím ← → chuyển qua lại giữa các từ.
  const flatCards = useMemo<CardWithDeck[]>(
    () =>
      groups.flatMap((g) => (g.rootCard ? [g.rootCard, ...g.words] : g.words)),
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
          Gom theo họ từ, ví dụ <b>engine (n)</b> → <b>engineer (n)</b>, <b>engineering (n)</b>.
        </p>
      </header>

      <div className="mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo từ gốc, từ vựng hoặc nghĩa…"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {groups.length} họ từ · {totalWords} từ vựng
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Không có từ nào khớp.</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.key} className="rounded-xl border bg-card p-4">
              {/* Từ gốc của họ */}
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 shrink-0 text-primary" />
                {g.rootCard ? (
                  <button
                    type="button"
                    onClick={() => setDetailCard(g.rootCard)}
                    className="text-lg font-bold text-primary hover:underline"
                    title="Xem chi tiết"
                  >
                    {g.header}
                  </button>
                ) : (
                  <span className="text-lg font-bold text-primary">{g.header}</span>
                )}
                {g.meaning ? (
                  <span className="text-sm text-muted-foreground">— {g.meaning}</span>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7 shrink-0"
                  onClick={() => speak(g.key)}
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
        cards={flatCards}
        onNavigate={setDetailCard}
      />
    </div>
  );
}
