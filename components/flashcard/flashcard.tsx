"use client";

import { motion } from "framer-motion";
import { Sprout, Volume2 } from "lucide-react";
import { speak } from "@/lib/tts";
import { displayRootWord } from "@/lib/utils";
import type { QueueCard } from "@/lib/daily-queue";

// Chỉ những field cần để hiển thị thẻ — cả QueueCard (SRS) lẫn Card đều thoả.
export type FlashcardData = Pick<
  QueueCard,
  "word" | "meaning" | "partOfSpeech" | "rootWord" | "phonetic" | "example" | "exampleTranslation"
>;

interface FlashcardProps {
  card: FlashcardData;
  flipped: boolean;
  onFlip: () => void;
  reverse?: boolean;
}

// Nền thẻ NewEra: royal blue đậm, học theo ngữ cảnh
const CARD_BG = "#00004F";

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
        className="preserve-3d relative h-[440px] w-full"
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

// Highlight lần xuất hiện đầu tiên của từ trong câu ví dụ
function HighlightedExample({ text, word }: { text: string; word: string }) {
  const re = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");
  const idx = text.search(re);
  if (idx < 0) {
    return <>“{text}”</>;
  }
  const match = text.match(re)![0];
  return (
    <>
      “{text.slice(0, idx)}
      <span
        className="font-sans font-bold"
        style={{ color: "#9cc2ff", borderBottom: "2px solid #0076FC" }}
      >
        {match}
      </span>
      {text.slice(idx + match.length)}”
    </>
  );
}

function SpeakBtn({ word, size = 20 }: { word: string; size?: number }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(word);
      }}
      aria-label="Phát âm"
      className="text-[#7eb0ff] transition-opacity hover:opacity-80"
      style={{ fontSize: size }}
    >
      <Volume2 style={{ width: size, height: size }} />
    </button>
  );
}

function FaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="backface-hidden absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center shadow-[0_24px_64px_rgba(0,13,139,.24)]"
      style={{ background: CARD_BG, color: "#eaf0ff" }}
    >
      {children}
    </div>
  );
}

function WordFace({ card }: { card: FlashcardData }) {
  return (
    <FaceShell>
      <div className="flex items-center gap-3">
        <span className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          {card.word}
        </span>
        <SpeakBtn word={card.word} />
      </div>
      <div className="font-phonetic mt-2 text-sm text-white/55">
        {card.phonetic ? `${card.phonetic} · ` : ""}
        {card.partOfSpeech ?? ""}
      </div>
      <p className="absolute bottom-5 text-xs text-white/45">Nhấn để lật (Space)</p>
    </FaceShell>
  );
}

function MeaningFace({ card }: { card: FlashcardData }) {
  return (
    <FaceShell>
      <div className="eyebrow !text-[#7eb0ff]">Đảo chiều · Việt → Anh</div>
      <p className="mt-4 text-3xl font-semibold text-[#dde6ff] md:text-4xl">{card.meaning}</p>
      {card.exampleTranslation ? (
        <p className="font-serif mt-4 max-w-sm text-sm italic text-white/55">
          {card.exampleTranslation}
        </p>
      ) : null}
      <p className="absolute bottom-5 text-xs text-white/45">Nhớ từ tiếng Anh? Nhấn để xem.</p>
    </FaceShell>
  );
}

function BackFace({ card, reverse }: { card: FlashcardData; reverse: boolean }) {
  const root = displayRootWord(card.word, card.rootWord);
  return (
    <div
      className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center shadow-[0_24px_64px_rgba(0,13,139,.24)]"
      style={{ background: CARD_BG, color: "#eaf0ff", transform: "rotateY(180deg)" }}
    >
      {card.example ? (
        <>
          <div className="eyebrow !text-[#7eb0ff]">Câu ví dụ</div>
          <p className="font-serif mt-3.5 text-[22px] leading-relaxed text-[#eaf0ff]">
            <HighlightedExample text={card.example} word={card.word} />
          </p>
        </>
      ) : null}

      <div className="mt-6 flex items-center gap-2.5">
        <span className="text-[32px] font-bold tracking-tight text-white">{card.word}</span>
        <SpeakBtn word={card.word} size={20} />
      </div>
      {card.phonetic || card.partOfSpeech ? (
        <div className="font-phonetic mt-1 text-sm text-white/55">
          {card.phonetic ? `${card.phonetic}` : ""}
          {card.phonetic && card.partOfSpeech ? " · " : ""}
          {card.partOfSpeech ?? ""}
        </div>
      ) : null}
      <div className="mt-3.5 text-[22px] font-semibold text-[#dde6ff]">{card.meaning}</div>

      {root ? (
        <div
          className="mt-3.5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[#9cc2ff]"
          style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)" }}
        >
          <Sprout className="h-3.5 w-3.5" />
          Từ gốc: {root}
        </div>
      ) : null}

      {reverse && card.exampleTranslation ? (
        <p className="font-serif mt-3 max-w-sm text-xs italic text-white/50">
          {card.exampleTranslation}
        </p>
      ) : null}
    </div>
  );
}
