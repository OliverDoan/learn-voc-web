"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { speak } from "@/lib/tts";
import type { QueueCard } from "@/lib/daily-queue";

interface FlashcardProps {
  card: QueueCard;
  flipped: boolean;
  onFlip: () => void;
  reverse?: boolean;
}

export function Flashcard({ card, flipped, onFlip, reverse = false }: FlashcardProps) {
  return (
    <div
      className="perspective w-full max-w-xl cursor-pointer select-none"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
      aria-label="Thẻ học - nhấn để lật"
    >
      <motion.div
        className="preserve-3d relative h-80 w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {reverse ? <MeaningFace card={card} /> : <WordFace card={card} />}
        <BackFace card={card} reverse={reverse} />
      </motion.div>
    </div>
  );
}

function WordFace({ card }: { card: QueueCard }) {
  return (
    <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card p-8 shadow-xl">
      <Badge variant="outline" className="absolute left-4 top-4 text-[10px]">
        {card.state}
      </Badge>
      <p className="mb-2 text-center text-4xl font-bold tracking-tight md:text-5xl">
        {card.word}
      </p>
      {card.phonetic ? (
        <p className="font-phonetic mb-4 text-base text-muted-foreground">{card.phonetic}</p>
      ) : null}
      {card.partOfSpeech ? (
        <Badge variant="secondary" className="mb-4">
          {card.partOfSpeech}
        </Badge>
      ) : null}
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          speak(card.word);
        }}
        aria-label="Phát âm"
      >
        <Volume2 className="h-5 w-5" />
      </Button>
      <p className="absolute bottom-4 text-xs text-muted-foreground">
        Nhấn để lật (Space)
      </p>
    </div>
  );
}

function MeaningFace({ card }: { card: QueueCard }) {
  return (
    <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card p-8 shadow-xl">
      <Badge variant="outline" className="absolute left-4 top-4 text-[10px]">
        {card.state}
      </Badge>
      <Badge variant="warning" className="absolute right-4 top-4 text-[10px]">
        Đảo chiều
      </Badge>
      <p className="text-center text-3xl font-bold md:text-4xl">{card.meaning}</p>
      {card.exampleTranslation ? (
        <p className="mt-4 max-w-sm text-center text-sm italic text-muted-foreground">
          {card.exampleTranslation}
        </p>
      ) : null}
      <p className="absolute bottom-4 text-xs text-muted-foreground">
        Nhớ từ tiếng Anh? Nhấn để xem.
      </p>
    </div>
  );
}

function BackFace({ card, reverse }: { card: QueueCard; reverse: boolean }) {
  return (
    <div
      className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-primary/5 p-6 shadow-xl"
      style={{ transform: "rotateY(180deg)" }}
    >
      {reverse ? (
        <>
          <p className="mb-1 text-center text-xs text-muted-foreground">{card.meaning}</p>
          <p className="mb-1 text-center text-4xl font-bold">{card.word}</p>
          {card.phonetic ? (
            <p className="font-phonetic mb-2 text-sm text-muted-foreground">
              {card.phonetic}
            </p>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              speak(card.word);
            }}
            aria-label="Phát âm"
            className="mb-3"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <p className="mb-2 text-center text-xl text-muted-foreground">{card.word}</p>
          <p className="mb-4 text-center text-3xl font-bold">{card.meaning}</p>
        </>
      )}
      {card.example ? (
        <div className="rounded-lg bg-card p-3 text-sm">
          <p className="italic">&ldquo;{card.example}&rdquo;</p>
          {card.exampleTranslation ? (
            <p className="mt-1 text-xs text-muted-foreground">{card.exampleTranslation}</p>
          ) : null}
        </div>
      ) : null}
      {card.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.imageUrl}
          alt={card.word}
          className="mt-4 max-h-32 rounded-md object-contain"
        />
      ) : null}
    </div>
  );
}
