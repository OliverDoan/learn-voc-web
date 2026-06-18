"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDecks } from "@/hooks/use-decks";

/** Chọn nhanh một deck và mở trang học, không rời khỏi mạch tập trung. */
export function DeckLauncher() {
  const router = useRouter();
  const { data: decks, isLoading } = useDecks();
  const [deckId, setDeckId] = useState("");

  const hasDecks = !!decks && decks.length > 0;

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <p className="text-xs text-muted-foreground">Học một bộ từ trong lúc tập trung</p>
      <div className="flex w-full items-center gap-2">
        <select
          value={deckId}
          onChange={(e) => setDeckId(e.target.value)}
          disabled={isLoading || !hasDecks}
          className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <option value="">
            {isLoading
              ? "Đang tải..."
              : hasDecks
                ? "Chọn bộ từ..."
                : "Chưa có bộ từ nào"}
          </option>
          {decks?.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name} ({deck.due} đến hạn)
            </option>
          ))}
        </select>
        <Button
          disabled={!deckId}
          onClick={() => deckId && router.push(`/study/${deckId}`)}
        >
          <GraduationCap className="h-4 w-4" /> Học
        </Button>
      </div>
    </div>
  );
}
