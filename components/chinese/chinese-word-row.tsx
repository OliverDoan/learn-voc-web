"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HanziAudioButton } from "@/components/chinese/hanzi-audio-button";
import { strokeSummary } from "@/lib/chinese";
import type { Card } from "@/lib/types";

interface ChineseWordRowProps {
  card: Card;
  /** Số thứ tự hiển thị bên trái (1-based) */
  index: number;
  onEdit?: (card: Card) => void;
  onDelete?: (card: Card) => void;
}

/**
 * Một dòng từ vựng tiếng Trung: Hán tự + pinyin + nghĩa, kèm chữ đại tả,
 * số nét / bộ thủ và câu ví dụ (nếu có).
 */
export function ChineseWordRow({
  card,
  index,
  onEdit,
  onDelete,
}: ChineseWordRowProps) {
  const strokes = strokeSummary(card);

  return (
    <div className="group flex gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
      <span className="mt-1 w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
        {index}
      </span>

      <div className="flex shrink-0 flex-col items-center gap-2">
        <span lang="zh-CN" className="text-4xl font-semibold leading-none">
          {card.word}
        </span>
        <HanziAudioButton text={card.word} />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {card.phonetic ? (
            <span className="font-phonetic text-base text-primary">
              {card.phonetic}
            </span>
          ) : null}
          {card.sinoVietnamese ? (
            <span className="text-sm italic text-muted-foreground">
              ({card.sinoVietnamese})
            </span>
          ) : null}
          <span className="font-medium">{card.meaning}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {card.partOfSpeech ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
              {card.partOfSpeech}
            </span>
          ) : null}
          {card.hanziFormal ? (
            <span className="rounded-full bg-muted px-2 py-0.5">
              Đại tả:{" "}
              <span lang="zh-CN" className="font-medium">
                {card.hanziFormal}
              </span>
            </span>
          ) : null}
          {strokes ? (
            <span className="rounded-full bg-muted px-2 py-0.5">{strokes}</span>
          ) : null}
        </div>

        {card.example ? (
          <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex items-start gap-2">
              <p lang="zh-CN" className="flex-1 font-medium">
                {card.example}
              </p>
              <HanziAudioButton
                text={card.example}
                rate={0.9}
                label="Đọc câu ví dụ"
                className="h-7 w-7"
              />
            </div>
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
      </div>

      {onEdit || onDelete ? (
        <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {onEdit ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(card)}
              aria-label={`Sửa thẻ ${card.word}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(card)}
              aria-label={`Xoá thẻ ${card.word}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
