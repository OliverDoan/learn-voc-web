"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialectBadge } from "@/components/deck/dialect-badge";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface UnitRef {
  id: string;
  name: string;
}

interface TopicWordListProps {
  /** Toàn bộ thẻ của topic (mọi unit). */
  cards: Card[];
  /** Các unit của topic, theo đúng thứ tự hiển thị. */
  units: UnitRef[];
}

/** Danh sách từ chỉ-để-xem của cả topic, nhóm theo từng unit. */
export function TopicWordList({ cards, units }: TopicWordListProps) {
  // Gom thẻ theo deckId để render dưới từng unit.
  const cardsByDeck = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const card of cards) {
      const list = map.get(card.deckId) ?? [];
      list.push(card);
      map.set(card.deckId, list);
    }
    return map;
  }, [cards]);

  return (
    <div className="space-y-6">
      {units.map((unit) => {
        const unitCards = cardsByDeck.get(unit.id) ?? [];
        if (unitCards.length === 0) return null;
        return (
          <section key={unit.id}>
            <div className="mb-2 flex items-center gap-3">
              <Link
                href={`/decks/${unit.id}`}
                className="group inline-flex items-center gap-1 text-sm font-semibold hover:text-primary"
              >
                {unit.name}
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="font-mono text-xs text-muted-foreground/70">
                {unitCards.length} từ
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <ul className="divide-y rounded-xl border bg-card">
              {unitCards.map((card) => (
                <WordRow key={card.id} card={card} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function WordRow({ card }: { card: Card }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        className="mt-0.5 h-8 w-8 shrink-0"
        onClick={() => speak(card.word)}
        aria-label={`Phát âm ${card.word}`}
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{card.word}</span>
          {card.phonetic ? (
            <span className="font-phonetic text-xs text-muted-foreground">
              {card.phonetic}
            </span>
          ) : null}
          {card.partOfSpeech ? (
            <Badge variant="outline" className="text-xs">
              {card.partOfSpeech}
            </Badge>
          ) : null}
          <DialectBadge dialect={card.dialect} variantWord={card.variantWord} />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{card.meaning}</p>
      </div>
    </li>
  );
}
