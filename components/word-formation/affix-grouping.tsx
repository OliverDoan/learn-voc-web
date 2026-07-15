"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardDetailDialog } from "@/components/deck/card-detail-dialog";
import { useAllWords } from "@/hooks/use-cards";
import {
  analyzeWord,
  PREFIXES,
  PREFIX_GROUPS,
  SUFFIXES,
  SUFFIX_GROUPS,
  type Affix,
} from "@/lib/word-formation";
import type { CardWithDeck } from "@/hooks/use-cards";

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

type Mode = "suffix" | "prefix";

export function AffixGrouping() {
  const { data: cards, isLoading } = useAllWords();
  const [mode, setMode] = useState<Mode>("suffix");
  const [detailCard, setDetailCard] = useState<CardWithDeck | null>(null);

  // Gom từ vựng theo affix dò được (analyzeWord). Mỗi affix → danh sách từ.
  const { suffixMap, prefixMap, matchedCount } = useMemo(() => {
    const sm = new Map<string, CardWithDeck[]>();
    const pm = new Map<string, CardWithDeck[]>();
    const seen = new Set<string>();
    const matched = new Set<string>();

    for (const c of cards ?? []) {
      const key = c.word.trim().toLowerCase();
      if (seen.has(key)) continue; // bỏ trùng từ
      seen.add(key);
      const a = analyzeWord(c.word);
      if (a.suffix) {
        (sm.get(a.suffix.id) ?? sm.set(a.suffix.id, []).get(a.suffix.id)!).push(c);
        matched.add(key);
      }
      if (a.prefix) {
        (pm.get(a.prefix.id) ?? pm.set(a.prefix.id, []).get(a.prefix.id)!).push(c);
        matched.add(key);
      }
    }
    for (const list of sm.values()) list.sort((a, b) => a.word.localeCompare(b.word));
    for (const list of pm.values()) list.sort((a, b) => a.word.localeCompare(b.word));
    return { suffixMap: sm, prefixMap: pm, matchedCount: matched.size };
  }, [cards]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const affixMap = mode === "suffix" ? suffixMap : prefixMap;
  const groups = mode === "suffix" ? SUFFIX_GROUPS : PREFIX_GROUPS;
  const affixes = mode === "suffix" ? SUFFIXES : PREFIXES;

  const totalInMode = [...affixMap.values()].reduce((s, l) => s + l.length, 0);

  // Danh sách phẳng theo đúng thứ tự hiển thị để điều hướng bằng nút mũi tên / phím ← →.
  const flatCards = groups.flatMap((group) =>
    affixes
      .filter((a) => a.group === group && (affixMap.get(a.id)?.length ?? 0) > 0)
      .flatMap((a) => affixMap.get(a.id) ?? []),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border p-0.5">
          <button
            type="button"
            onClick={() => setMode("suffix")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "suffix" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Theo hậu tố
          </button>
          <button
            type="button"
            onClick={() => setMode("prefix")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "prefix" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Theo tiền tố
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {totalInMode} từ được gom · {matchedCount} từ có cấu tạo nhận diện
        </span>
      </div>

      {groups.map((group) => {
        const groupAffixes = affixes.filter(
          (a) => a.group === group && (affixMap.get(a.id)?.length ?? 0) > 0,
        );
        if (groupAffixes.length === 0) return null;
        return (
          <section key={group} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {group}
            </h3>
            <div className="space-y-3">
              {groupAffixes.map((affix) => (
                <AffixWordCard
                  key={affix.id}
                  affix={affix}
                  words={affixMap.get(affix.id) ?? []}
                  onSelect={setDetailCard}
                />
              ))}
            </div>
          </section>
        );
      })}

      {totalInMode === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Chưa có từ nào khớp {mode === "suffix" ? "hậu tố" : "tiền tố"} nào.
        </p>
      ) : null}

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

function AffixWordCard({
  affix,
  words,
  onSelect,
}: {
  affix: Affix;
  words: CardWithDeck[];
  onSelect: (card: CardWithDeck) => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-base font-bold text-primary">{affix.label}</span>
        {affix.makes ? (
          <Badge variant="secondary" className="text-[11px]">
            → {affix.makes}
          </Badge>
        ) : null}
        <span className="text-sm text-muted-foreground">{affix.meaning}</span>
        <span className="ml-auto text-xs text-muted-foreground">{words.length} từ</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onSelect(w)}
            className="rounded-lg border bg-background px-2.5 py-1.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
            title={w.meaning}
          >
            <span className="font-semibold">{w.word}</span>
            {w.partOfSpeech ? (
              <span className="ml-1 text-xs text-muted-foreground">({shortPos(w.partOfSpeech)})</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
