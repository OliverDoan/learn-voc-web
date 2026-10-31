"use client";

import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { strokeSummary } from "@/lib/chinese";
import { HanziAudioButton } from "@/components/chinese/hanzi-audio-button";
import type { Card } from "@/lib/types";
import { IconButton } from "./icon-button";

interface ChineseWordMailRowProps {
  card: Card;
  expanded: boolean;
  onToggle: (card: Card) => void;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

/**
 * Một từ tiếng Trung dạng dòng mail: người gửi = Hán tự, tiêu đề = pinyin + nghĩa,
 * xem trước = câu ví dụ. Bấm để mở rộng như mở một thư trong chuỗi Gmail.
 */
export function ChineseWordMailRow({ card, expanded, onToggle, onEdit, onDelete }: ChineseWordMailRowProps) {
  const strokes = strokeSummary(card);

  return (
    <div className={cn("group relative border-b bg-card", expanded && "shadow-[0_1px_3px_rgba(60,64,67,.3)]")}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => onToggle(card)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(card);
          }
        }}
        className="flex min-h-12 cursor-pointer items-center gap-3 pl-4 pr-4 text-sm hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3)]"
      >
        <span lang="zh-CN" className="w-16 shrink-0 truncate text-xl font-bold sm:w-24">
          {card.word}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {card.phonetic ? <span className="font-phonetic mr-1.5 text-primary">{card.phonetic}</span> : null}
          {card.sinoVietnamese ? (
            <span className="mr-1.5 italic text-muted-foreground">({card.sinoVietnamese})</span>
          ) : null}
          <span className="font-bold">{card.meaning}</span>
          {card.example && !expanded ? (
            <span className="text-muted-foreground">
              {" - "}
              <span lang="zh-CN">{card.example}</span>
            </span>
          ) : null}
        </span>
        {card.partOfSpeech && !expanded ? (
          <span className="hidden shrink-0 rounded bg-foreground/[.08] px-1.5 py-px text-xs text-muted-foreground sm:inline group-hover:invisible">
            {card.partOfSpeech}
          </span>
        ) : null}
      </div>

      {/* Thao tác nhanh khi hover, đè lên cột từ loại như Gmail */}
      <div className="absolute right-2 top-1 hidden items-center bg-card group-hover:flex">
        <HanziAudioButton text={card.word} className="h-10 w-10" />
        <IconButton label={`Sửa ${card.word}`} onClick={() => onEdit(card)}>
          <Pencil className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton label={`Xoá ${card.word}`} onClick={() => onDelete(card)}>
          <Trash2 className="h-[18px] w-[18px]" />
        </IconButton>
      </div>

      {expanded ? (
        <div className="space-y-3 pb-5 pl-4 pr-6 text-sm sm:pl-[124px]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {card.partOfSpeech ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{card.partOfSpeech}</span>
            ) : null}
            {card.hanziFormal ? (
              <span className="rounded-full bg-muted px-2 py-0.5">
                Đại tả: <span lang="zh-CN">{card.hanziFormal}</span>
              </span>
            ) : null}
            {strokes ? <span className="rounded-full bg-muted px-2 py-0.5">{strokes}</span> : null}
          </div>
          {card.example ? (
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p lang="zh-CN" className="text-base">
                  {card.example}
                </p>
                {card.examplePinyin ? (
                  <p className="font-phonetic text-xs text-primary/80">{card.examplePinyin}</p>
                ) : null}
                {card.exampleTranslation ? (
                  <p className="text-xs text-muted-foreground">{card.exampleTranslation}</p>
                ) : null}
              </div>
              <HanziAudioButton text={card.example} rate={0.9} label="Đọc câu ví dụ" className="h-8 w-8" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Chưa có câu ví dụ.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
