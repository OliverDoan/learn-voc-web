"use client";

import { Sprout, Star, Volume2 } from "lucide-react";
import { DialectBadge } from "@/components/deck/dialect-badge";
import { speak } from "@/lib/tts";
import { cn, displayRootWord, posBadgeClass, posToVietnamese } from "@/lib/utils";
import type { Card } from "@/lib/types";

interface WordRowProps {
  card: Card;
  onOpenDetail: (card: Card) => void;
  onToggleFavorite: (card: Card) => void;
  /** Nhãn phụ (vd tên unit) hiển thị nhỏ cạnh từ — dùng cho danh sách gộp nhiều deck. */
  sourceLabel?: string;
}

/**
 * Dòng hiển thị một từ theo phong cách "Danh sách" của trang deck:
 * phát âm · từ / phiên âm / từ gốc / ví dụ · badge loại từ · nghĩa · yêu thích.
 * Chỉ để xem + bật/tắt yêu thích (không có chọn/kéo-thả/sửa/xoá).
 */
export function WordRow({ card, onOpenDetail, onToggleFavorite, sourceLabel }: WordRowProps) {
  return (
    <li className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-all hover:border-primary/40 hover:shadow-md">
      {/* Phát âm */}
      <button
        type="button"
        onClick={() => speak(card.word)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Phát âm"
      >
        <Volume2 className="h-4 w-4" />
      </button>

      {/* Từ / phiên âm / từ gốc / ví dụ */}
      <button
        type="button"
        onClick={() => onOpenDetail(card)}
        className="flex min-w-0 flex-[1.4] flex-col gap-0.5 text-left"
        title="Xem chi tiết"
      >
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold group-hover:text-primary group-hover:underline">
            {card.word}
          </span>
          {card.phonetic ? (
            <span className="font-phonetic text-xs text-muted-foreground">{card.phonetic}</span>
          ) : null}
          {/* Badge loại từ inline — chỉ hiện khi khung hẹp */}
          {card.partOfSpeech ? (
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium sm:hidden",
                posBadgeClass(card.partOfSpeech),
              )}
            >
              {posToVietnamese(card.partOfSpeech) || card.partOfSpeech}
            </span>
          ) : null}
          <DialectBadge dialect={card.dialect} variantWord={card.variantWord} />
          {sourceLabel ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {sourceLabel}
            </span>
          ) : null}
        </span>
        {displayRootWord(card.word, card.rootWord) ? (
          <span className="inline-flex flex-wrap items-center gap-1 text-xs text-primary">
            <Sprout className="h-3 w-3 shrink-0" />
            <span className="text-muted-foreground">Từ gốc:</span>
            <span className="font-medium">{displayRootWord(card.word, card.rootWord)}</span>
            {card.rootWordMeaning ? (
              <span className="text-muted-foreground">— {card.rootWordMeaning}</span>
            ) : null}
          </span>
        ) : null}
        {card.example ? (
          <span className="truncate text-xs italic text-muted-foreground">
            &ldquo;{card.example}&rdquo;
          </span>
        ) : null}
      </button>

      {/* Badge loại từ (tiếng Việt) */}
      <div className="hidden w-24 shrink-0 sm:block">
        {card.partOfSpeech ? (
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
              posBadgeClass(card.partOfSpeech),
            )}
          >
            {posToVietnamese(card.partOfSpeech) || card.partOfSpeech}
          </span>
        ) : null}
      </div>

      {/* Nghĩa */}
      <button
        type="button"
        onClick={() => onOpenDetail(card)}
        className="min-w-0 flex-[1.4] text-left text-sm text-muted-foreground"
        title="Xem chi tiết"
      >
        {card.meaning}
      </button>

      {/* Yêu thích */}
      <button
        type="button"
        onClick={() => onToggleFavorite(card)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-accent"
        aria-label={card.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
        aria-pressed={card.favorite}
        title={card.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
      >
        <Star
          className={cn(
            "h-4 w-4",
            card.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
          )}
        />
      </button>
    </li>
  );
}
