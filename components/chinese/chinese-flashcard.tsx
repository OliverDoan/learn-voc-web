"use client";

import { motion } from "framer-motion";
import { HanziAudioButton } from "@/components/chinese/hanzi-audio-button";
import { strokeSummary } from "@/lib/chinese";
import type { Card } from "@/lib/types";

interface ChineseFlashcardProps {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
}

// Nút loa phải nằm NGOÀI vùng bấm-để-lật: HTML không cho lồng <button> trong <button>.

/**
 * Thẻ lật tiếng Trung: mặt trước là Hán tự, mặt sau là pinyin + nghĩa + ghi chú chữ.
 * Bấm vào thẻ (hoặc phím Space ở trang cha) để lật.
 */
export function ChineseFlashcard({
  card,
  flipped,
  onFlip,
}: ChineseFlashcardProps) {
  const strokes = strokeSummary(card);

  return (
    <div className="w-full max-w-xl">
      <motion.button
        type="button"
        onClick={onFlip}
        whileTap={{ scale: 0.99 }}
        className="flex min-h-[320px] w-full flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-md transition-colors hover:border-primary/50"
        aria-label={flipped ? "Xem mặt trước" : "Xem nghĩa"}
      >
        <span lang="zh-CN" className="text-7xl font-semibold leading-none">
          {card.word}
        </span>

        {flipped ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full space-y-3 border-t pt-4"
          >
            {card.phonetic ? (
              <p className="font-phonetic text-2xl text-primary">
                {card.phonetic}
              </p>
            ) : null}
            <p className="text-xl font-medium">{card.meaning}</p>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {card.sinoVietnamese ? (
                <span className="rounded-full bg-muted px-2 py-0.5 italic">
                  Hán Việt: {card.sinoVietnamese}
                </span>
              ) : null}
              {card.partOfSpeech ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                  {card.partOfSpeech}
                </span>
              ) : null}
              {card.hanziFormal ? (
                <span className="rounded-full bg-muted px-2 py-0.5">
                  Đại tả: <span lang="zh-CN">{card.hanziFormal}</span>
                </span>
              ) : null}
              {strokes ? (
                <span className="rounded-full bg-muted px-2 py-0.5">
                  {strokes}
                </span>
              ) : null}
            </div>

            {card.example ? (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p lang="zh-CN" className="font-medium">
                  {card.example}
                </p>
                {card.examplePinyin ? (
                  <p className="font-phonetic mt-1 text-xs text-primary/80">
                    {card.examplePinyin}
                  </p>
                ) : null}
                {card.exampleTranslation ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.exampleTranslation}
                  </p>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        ) : (
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Bấm để xem nghĩa
          </p>
        )}
      </motion.button>

      <div className="mt-3 flex justify-center">
        <HanziAudioButton text={card.word} label={`Phát âm ${card.word}`} />
      </div>
    </div>
  );
}
