"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SearchX, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { useCards } from "@/hooks/use-cards";
import { useDecks } from "@/hooks/use-decks";
import type { DictionaryResult } from "@/lib/dictionary";
import { WordResult } from "./word-result";
import { AddToDeckPanel } from "./add-to-deck-panel";

export function WordSearch() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim(), 500);
  const enabled = debounced.length > 1;

  // Tra từ điển
  const {
    data: result,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["dictionary", debounced],
    queryFn: () =>
      apiFetch<DictionaryResult>(`/api/dictionary?word=${encodeURIComponent(debounced)}`),
    enabled,
    retry: false,
  });

  // Kiểm tra từ đã có trong deck nào chưa
  const { data: cards } = useCards({ q: enabled ? debounced : undefined });
  const { data: decks } = useDecks();

  const existingDeckNames = useMemo(() => {
    if (!cards) return [];
    const target = (result?.word ?? debounced).toLowerCase();
    if (!target) return [];
    const deckIds = new Set(
      cards.filter((c) => c.word.toLowerCase() === target).map((c) => c.deckId),
    );
    return (decks ?? [])
      .filter((d) => deckIds.has(d.id))
      .map((d) => d.name);
  }, [result, cards, decks, debounced]);

  // Từ "tạm" để thêm thủ công khi từ điển không có
  const manualResult: DictionaryResult = {
    word: debounced,
    meanings: [],
    synonyms: [],
    antonyms: [],
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ tiếng Anh muốn tra..."
          className="h-12 bg-card pl-10 text-base"
          autoFocus
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {!enabled && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Gõ một từ tiếng Anh để tra nghĩa, phiên âm và thêm vào deck.
        </p>
      )}

      {enabled && isError && !isFetching && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 pt-8 text-center text-muted-foreground">
            <SearchX className="h-8 w-8" />
            <p className="text-sm">
              Không tìm thấy &ldquo;{debounced}&rdquo; trong từ điển. Có thể do gõ
              nhầm, hoặc từ điển miễn phí chưa có từ này.
            </p>
          </div>

          {/* Vẫn cho phép thêm thủ công từ chưa có trong từ điển */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-2xl font-bold">{debounced}</h2>
              {existingDeckNames.length > 0 && (
                <span className="text-xs text-warning">
                  (đã có trong: {existingDeckNames.join(", ")})
                </span>
              )}
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Tự nhập nghĩa rồi thêm vào deck — phù hợp cho tên riêng, từ chuyên
              ngành hoặc từ chưa có trong từ điển.
            </p>
            <AddToDeckPanel result={manualResult} />
          </div>
        </div>
      )}

      {result && !isError && (
        <WordResult result={result} existingDeckNames={existingDeckNames} />
      )}
    </div>
  );
}
