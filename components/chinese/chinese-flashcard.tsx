"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { CHINESE_TTS_LANG, strokeSummary } from "@/lib/chinese";
import { isSpeakable, speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface ChineseFlashcardProps {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
}

// Cùng nền với thẻ tiếng Anh (components/flashcard/flashcard.tsx) để hai bên đồng bộ.
const CARD_BG = "#00004F";

/**
 * Thẻ lật tiếng Trung, xoay 3D giống thẻ tiếng Anh: mặt trước là Hán tự,
 * mặt sau là pinyin + nghĩa + ghi chú chữ. Bấm vào thẻ (hoặc Space) để lật.
 */
export function ChineseFlashcard({ card, flipped, onFlip }: ChineseFlashcardProps) {
  return (
    <div
      className="perspective w-full max-w-xl cursor-pointer select-none"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        // Space đã do trang cha xử lý (phím tắt toàn trang) — chỉ bắt Enter để không lật 2 lần.
        if (e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
      aria-label={flipped ? "Xem mặt trước" : "Thẻ học - nhấn để lật"}
    >
      <motion.div
        className="preserve-3d relative h-[440px] w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <FrontFace card={card} />
        <BackFace card={card} />
      </motion.div>
    </div>
  );
}

function SpeakBtn({ text, size = 20 }: { text: string; size?: number }) {
  if (!isSpeakable(text)) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        // Chữ đơn đọc chậm hơn để nghe rõ thanh điệu.
        speak(text, CHINESE_TTS_LANG, 0.85);
      }}
      aria-label={`Phát âm ${text}`}
      className="text-[#7eb0ff] transition-opacity hover:opacity-80"
    >
      <Volume2 style={{ width: size, height: size }} />
    </button>
  );
}

function FaceShell({ back = false, children }: { back?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="backface-hidden absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center shadow-[0_24px_64px_rgba(0,13,139,.24)]"
      style={{
        background: CARD_BG,
        color: "#eaf0ff",
        ...(back ? { transform: "rotateY(180deg)" } : {}),
      }}
    >
      {children}
    </div>
  );
}

function FrontFace({ card }: { card: Card }) {
  return (
    <FaceShell>
      <div className="flex items-center gap-3">
        <span lang="zh-CN" className="text-7xl font-semibold leading-none text-white">
          {card.word}
        </span>
        <SpeakBtn text={card.word} />
      </div>
      <p className="absolute bottom-5 text-xs text-white/45">Nhấn để lật (Space)</p>
    </FaceShell>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[12.5px] text-[#cfe0ff]"
      style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)" }}
    >
      {children}
    </span>
  );
}

function BackFace({ card }: { card: Card }) {
  const strokes = strokeSummary(card);
  return (
    <FaceShell back>
      <div className="flex items-center gap-2.5">
        <span lang="zh-CN" className="text-5xl font-semibold text-white">
          {card.word}
        </span>
        <SpeakBtn text={card.word} />
      </div>
      {card.phonetic ? (
        <p className="font-phonetic mt-2 text-2xl text-[#9cc2ff]">{card.phonetic}</p>
      ) : null}
      <p className="mt-3 text-[22px] font-semibold text-[#dde6ff]">{card.meaning}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {card.sinoVietnamese ? <Chip>Hán Việt: {card.sinoVietnamese}</Chip> : null}
        {card.partOfSpeech ? <Chip>{card.partOfSpeech}</Chip> : null}
        {card.hanziFormal ? (
          <Chip>
            Đại tả: <span lang="zh-CN">{card.hanziFormal}</span>
          </Chip>
        ) : null}
        {strokes ? <Chip>{strokes}</Chip> : null}
      </div>

      {card.example ? (
        <div className="mt-5 max-w-sm">
          <p lang="zh-CN" className="text-lg text-[#eaf0ff]">
            {card.example}
          </p>
          {card.examplePinyin ? (
            <p className="font-phonetic mt-1 text-xs text-[#9cc2ff]/80">{card.examplePinyin}</p>
          ) : null}
          {card.exampleTranslation ? (
            <p className="font-serif mt-1 text-xs italic text-white/50">
              {card.exampleTranslation}
            </p>
          ) : null}
        </div>
      ) : null}
    </FaceShell>
  );
}
