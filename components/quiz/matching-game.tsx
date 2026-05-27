"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/types";

const PAIR_COUNT = 6;

interface MatchingGameProps {
  deckId: string;
  cards: Card[];
  onComplete?: (elapsedMs: number) => void;
}

interface Slot {
  cardId: string;
  side: "word" | "meaning";
  text: string;
  key: string;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function bestKey(deckId: string): string {
  return `voca-match-best:${deckId}`;
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const remainSec = s % 60;
  return m > 0 ? `${m}:${remainSec.toString().padStart(2, "0")}` : `${remainSec}s`;
}

export function MatchingGame({ deckId, cards, onComplete }: MatchingGameProps) {
  const round = useMemo(() => {
    const pick = shuffle(cards).slice(0, PAIR_COUNT);
    const wordSlots: Slot[] = pick.map((c) => ({
      cardId: c.id,
      side: "word",
      text: c.word,
      key: `w-${c.id}`,
    }));
    const meaningSlots: Slot[] = pick.map((c) => ({
      cardId: c.id,
      side: "meaning",
      text: c.meaning,
      key: `m-${c.id}`,
    }));
    return {
      words: shuffle(wordSlots),
      meanings: shuffle(meaningSlots),
    };
  }, [cards]);

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ word: string; meaning: string } | null>(null);
  const [startTime] = useState(() => performance.now());
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(bestKey(deckId));
    if (stored) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed)) setBest(parsed);
    }
  }, [deckId]);

  useEffect(() => {
    if (matched.size === PAIR_COUNT && doneAt === null) {
      const elapsed = performance.now() - startTime;
      setDoneAt(elapsed);
      if (best === null || elapsed < best) {
        setBest(elapsed);
        if (typeof window !== "undefined") {
          localStorage.setItem(bestKey(deckId), String(Math.round(elapsed)));
        }
      }
      onComplete?.(elapsed);
    }
  }, [matched, doneAt, startTime, best, deckId, onComplete]);

  const handleWordClick = (slotKey: string, cardId: string) => {
    if (matched.has(cardId) || wrongPair) return;
    setSelectedWord(slotKey);
    if (selectedMeaning) {
      const meaningSlot = round.meanings.find((s) => s.key === selectedMeaning);
      if (meaningSlot && meaningSlot.cardId === cardId) {
        setMatched((prev) => new Set(prev).add(cardId));
        setSelectedWord(null);
        setSelectedMeaning(null);
      } else if (meaningSlot) {
        setWrongPair({ word: slotKey, meaning: selectedMeaning });
        setTimeout(() => {
          setWrongPair(null);
          setSelectedWord(null);
          setSelectedMeaning(null);
        }, 600);
      }
    }
  };

  const handleMeaningClick = (slotKey: string, cardId: string) => {
    if (matched.has(cardId) || wrongPair) return;
    setSelectedMeaning(slotKey);
    if (selectedWord) {
      const wordSlot = round.words.find((s) => s.key === selectedWord);
      if (wordSlot && wordSlot.cardId === cardId) {
        setMatched((prev) => new Set(prev).add(cardId));
        setSelectedWord(null);
        setSelectedMeaning(null);
      } else if (wordSlot) {
        setWrongPair({ word: selectedWord, meaning: slotKey });
        setTimeout(() => {
          setWrongPair(null);
          setSelectedWord(null);
          setSelectedMeaning(null);
        }, 600);
      }
    }
  };

  if (doneAt !== null) {
    const isNewBest = best !== null && doneAt <= best;
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-md">
        <Trophy className="mx-auto mb-3 h-14 w-14 text-yellow-500" />
        <h2 className="mb-1 text-2xl font-bold">Tuyệt vời!</h2>
        <p className="mb-4 text-muted-foreground">
          Bạn ghép xong trong{" "}
          <span className="font-semibold text-foreground">{formatMs(doneAt)}</span>
        </p>
        {isNewBest ? (
          <p className="mb-4 text-sm font-semibold text-green-500">
            🎉 Kỷ lục mới của bạn cho deck này!
          </p>
        ) : best !== null ? (
          <p className="mb-4 text-xs text-muted-foreground">
            Kỷ lục hiện tại: {formatMs(best)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Đã ghép {matched.size} / {PAIR_COUNT}
        </span>
        {best !== null ? (
          <span className="text-xs text-muted-foreground">
            Best: {formatMs(best)}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Column
          title="Từ"
          slots={round.words}
          matched={matched}
          selectedKey={selectedWord}
          wrongKey={wrongPair?.word ?? null}
          onClick={handleWordClick}
        />
        <Column
          title="Nghĩa"
          slots={round.meanings}
          matched={matched}
          selectedKey={selectedMeaning}
          wrongKey={wrongPair?.meaning ?? null}
          onClick={handleMeaningClick}
        />
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  slots: Slot[];
  matched: Set<string>;
  selectedKey: string | null;
  wrongKey: string | null;
  onClick: (slotKey: string, cardId: string) => void;
}

function Column({ title, slots, matched, selectedKey, wrongKey, onClick }: ColumnProps) {
  return (
    <div>
      <p className="mb-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {slots.map((slot) => {
            const isMatched = matched.has(slot.cardId);
            const isSelected = selectedKey === slot.key;
            const isWrong = wrongKey === slot.key;
            if (isMatched) {
              return (
                <motion.li
                  key={slot.key}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0.35, scale: 0.97 }}
                  className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm"
                >
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="line-through">{slot.text}</span>
                </motion.li>
              );
            }
            return (
              <motion.li
                key={slot.key}
                animate={isWrong ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  type="button"
                  onClick={() => onClick(slot.key, slot.cardId)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                    isSelected && "border-primary bg-primary/15",
                    isWrong && "border-red-500 bg-red-500/15",
                    !isSelected && !isWrong && "border-border bg-card hover:border-primary/60",
                  )}
                >
                  {slot.text}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export function MatchingGameLauncher({ deckId, cards }: { deckId: string; cards: Card[] }) {
  const [round, setRound] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <MatchingGame
        key={round}
        deckId={deckId}
        cards={cards}
        onComplete={() => {
          /* result rendered inside component */
        }}
      />
      <Button variant="outline" onClick={() => setRound((r) => r + 1)}>
        <RotateCcw className="h-4 w-4" /> Chơi lại
      </Button>
    </div>
  );
}
