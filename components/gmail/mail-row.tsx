"use client";

import Link from "next/link";
import { Archive, Clock, MailOpen, Star, Trash2, Undo2 } from "lucide-react";
import { cn, posBadgeClass } from "@/lib/utils";
import type { CardWithDeck } from "@/hooks/use-cards";
import { formatMailDate, mailDateOf, mailPreview } from "@/lib/inbox";
import { IconButton } from "./icon-button";

export interface MailRowHandlers {
  onToggleSelect: (card: CardWithDeck) => void;
  onStar: (card: CardWithDeck) => void;
  onArchive: (card: CardWithDeck) => void;
  onMarkRead: (card: CardWithDeck) => void;
  onSnooze: (card: CardWithDeck) => void;
  onDelete: (card: CardWithDeck) => void;
  onRestore: (card: CardWithDeck) => void;
}

interface MailRowProps extends MailRowHandlers {
  card: CardWithDeck;
  href: string;
  /** Chỉ dùng để bật/tắt nút "Đánh dấu đã ôn" — mọi dòng đều hiển thị đậm, nền trắng. */
  unread: boolean;
  selected: boolean;
  inTrash: boolean;
  /** Đang xem trong 1 nhãn → không cần hiện chip nhãn. */
  hideLabel: boolean;
  now: Date;
}

/** Một dòng "mail": người gửi = từ, tiêu đề = nghĩa, xem trước = câu ví dụ. */
export function MailRow(props: MailRowProps) {
  const { card, href, unread, selected, inTrash, hideLabel, now } = props;
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    <div
      className={cn(
        "group relative flex h-10 items-center border-b pr-2 text-sm transition-shadow hover:z-10 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]",
        selected ? "bg-mail-active" : "bg-card",
      )}
    >
      <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center pl-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => props.onToggleSelect(card)}
          className="h-[18px] w-[18px] cursor-pointer accent-primary"
          aria-label={`Chọn ${card.word}`}
        />
      </label>
      <button
        type="button"
        onClick={() => props.onStar(card)}
        aria-label={card.favorite ? "Bỏ gắn sao" : "Gắn sao"}
        className="flex h-10 w-8 shrink-0 items-center justify-center"
      >
        <Star
          className={cn(
            "h-5 w-5",
            card.favorite ? "fill-[#f4b400] text-[#f4b400]" : "text-muted-foreground/60 hover:text-foreground",
          )}
        />
      </button>

      <Link href={href} className="flex min-w-0 flex-1 items-center gap-2 self-stretch">
        <span
          className={cn(
            "w-28 shrink-0 truncate pl-2 sm:w-[168px]",
            "font-bold text-foreground",
          )}
        >
          {card.word}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {!hideLabel ? (
            <span className="mr-1.5 hidden rounded bg-foreground/[.08] px-1.5 py-px text-xs text-muted-foreground sm:inline">
              {card.deck.name}
            </span>
          ) : null}
          {card.partOfSpeech ? (
            <span
              className={cn(
                "mr-1.5 rounded-full border px-1.5 py-px text-[11px] font-medium",
                posBadgeClass(card.partOfSpeech),
              )}
            >
              {card.partOfSpeech}
            </span>
          ) : null}
          <span className="font-bold text-foreground">{card.meaning}</span>
          {mailPreview(card) ? (
            <span className="text-muted-foreground"> - {mailPreview(card)}</span>
          ) : null}
        </span>
        <span
          className={cn(
            "w-[72px] shrink-0 pr-2 text-right text-xs group-hover:invisible",
            "font-bold text-foreground",
          )}
        >
          {formatMailDate(mailDateOf(card), now)}
        </span>
      </Link>

      {/* Nút thao tác nhanh hiện khi hover, đè lên cột ngày như Gmail */}
      <div className="absolute right-2 hidden items-center bg-inherit group-hover:flex">
        {inTrash ? (
          <IconButton label="Khôi phục" onClick={stop(() => props.onRestore(card))}>
            <Undo2 className="h-[18px] w-[18px]" />
          </IconButton>
        ) : (
          <>
            <IconButton label="Lưu trữ (đã thuộc)" onClick={stop(() => props.onArchive(card))}>
              <Archive className="h-[18px] w-[18px]" />
            </IconButton>
            <IconButton label="Xoá" onClick={stop(() => props.onDelete(card))}>
              <Trash2 className="h-[18px] w-[18px]" />
            </IconButton>
            <IconButton label="Đánh dấu đã ôn" onClick={stop(() => props.onMarkRead(card))} disabled={!unread}>
              <MailOpen className="h-[18px] w-[18px]" />
            </IconButton>
            <IconButton label="Tạm ẩn tới ngày mai" onClick={stop(() => props.onSnooze(card))}>
              <Clock className="h-[18px] w-[18px]" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}
