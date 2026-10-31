"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Archive,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Trash2,
  Undo2,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/tts";
import { RATING_LABELS, type Rating } from "@/lib/constants";
import { filterInbox, inboxSearch, isUnread, mailDateOf, parseInboxLocation } from "@/lib/inbox";
import { useInboxSource } from "@/hooks/use-inbox";
import { useMailActions } from "@/hooks/use-mail-actions";
import { usePopover } from "@/hooks/use-popover";
import { PageLoader } from "@/components/ui/page-loader";
import { IconButton } from "./icon-button";
import { MailBody } from "./mail-body";

interface MailReaderProps {
  cardId: string;
}

const SNOOZE_OPTIONS = [
  { days: 1, label: "Ngày mai" },
  { days: 3, label: "3 ngày nữa" },
  { days: 7, label: "Tuần sau" },
] as const;

const RATING_ORDER: readonly Rating[] = [1, 2, 3, 4];

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

/** Trang đọc 1 "mail" (1 từ) — giống màn hình mở email của Gmail. */
export function MailReader({ cardId }: MailReaderProps) {
  const router = useRouter();
  const params = useSearchParams();
  const loc = parseInboxLocation(params);
  const inTrash = loc.folder === "trash" && !loc.labelId;
  const [now] = useState(() => new Date());
  const source = useInboxSource(inTrash ? "trash" : loc.folder);
  const actions = useMailActions();
  const { open: snoozeOpen, setOpen: setSnoozeOpen, ref: snoozeRef } = usePopover<HTMLDivElement>();

  // Giữ danh sách lúc mở để prev/next ổn định dù thẻ vừa thao tác rời khỏi thư mục.
  const list = useMemo(
    () => filterInbox(source.cards, { folder: loc.folder, labelId: loc.labelId, query: loc.query }, now),
    [source.cards, loc.folder, loc.labelId, loc.query, now],
  );
  const card = source.cards.find((c) => c.id === cardId);
  const index = list.findIndex((c) => c.id === cardId);
  const prev = index > 0 ? list[index - 1] : undefined;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : undefined;
  const search = inboxSearch(loc);
  const backHref = `/inbox${search}`;
  const hrefOf = (id: string) => `/inbox/${id}${search}`;

  // Sau khi xử lý xong thư: sang thư kế tiếp, hết thì về danh sách (như Gmail).
  const advance = () => router.push(next ? hrefOf(next.id) : prev ? hrefOf(prev.id) : backHref);
  const after = (ok: boolean) => {
    if (ok) advance();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "j" && next) router.push(hrefOf(next.id));
      else if (e.key === "k" && prev) router.push(hrefOf(prev.id));
      else if (e.key === "u") router.push(backHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (source.isLoading) return <PageLoader />;
  if (!card) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-sm text-muted-foreground">
        <p>Không tìm thấy từ này (có thể đã bị xoá hoặc deck đang khoá).</p>
        <Link href={backHref} className="text-primary hover:underline">
          Quay lại hộp thư
        </Link>
      </div>
    );
  }

  const unread = !inTrash && isUnread(card, now);
  const sentAt = new Date(mailDateOf(card));

  return (
    <article>
      <div className="sticky top-[var(--shell-top)] z-20 flex h-12 items-center gap-1 rounded-t-2xl bg-card px-2 md:px-4">
        <IconButton label="Quay lại hộp thư (u)" onClick={() => router.push(backHref)}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        {inTrash ? (
          <IconButton label="Khôi phục" onClick={async () => after(await actions.restore([card.id]))}>
            <Undo2 className="h-5 w-5" />
          </IconButton>
        ) : (
          <>
            <IconButton label="Lưu trữ (đã thuộc)" onClick={async () => after(await actions.archive([card]))}>
              <Archive className="h-5 w-5" />
            </IconButton>
            <IconButton label="Xoá" onClick={async () => after(await actions.remove([card]))}>
              <Trash2 className="h-5 w-5" />
            </IconButton>
            <div className="mx-1 h-5 w-px bg-border" />
            <div ref={snoozeRef} className="relative">
              <IconButton label="Tạm ẩn" onClick={() => setSnoozeOpen(!snoozeOpen)}>
                <Clock className="h-5 w-5" />
              </IconButton>
              {snoozeOpen ? (
                <div className="absolute left-0 top-11 z-30 w-48 rounded-lg bg-popover py-2 shadow-[0_2px_6px_2px_rgba(0,0,0,.15)]">
                  <p className="px-4 pb-1 text-xs text-muted-foreground">Tạm ẩn cho tới…</p>
                  {SNOOZE_OPTIONS.map((o) => (
                    <button
                      key={o.days}
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-mail-hover"
                      onClick={async () => {
                        setSnoozeOpen(false);
                        after(await actions.snooze([card], o.days));
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          {index >= 0 ? (
            <span className="hidden sm:inline">
              {index + 1} trên {list.length.toLocaleString("vi-VN")}
            </span>
          ) : null}
          <IconButton label="Mới hơn (k)" disabled={!prev} onClick={() => prev && router.push(hrefOf(prev.id))}>
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton label="Cũ hơn (j)" disabled={!next} onClick={() => next && router.push(hrefOf(next.id))}>
            <ChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <div className="px-4 pb-10 md:pl-[72px] md:pr-6">
        <div className="flex flex-wrap items-center gap-3 pb-5 pt-4">
          <h1 className="text-[22px] leading-7">{card.word}</h1>
          {card.phonetic ? <span className="font-phonetic text-muted-foreground">{card.phonetic}</span> : null}
          <IconButton label="Phát âm" onClick={() => speak(card.word)} className="h-8 w-8">
            <Volume2 className="h-[18px] w-[18px]" />
          </IconButton>
          <Link
            href={`/inbox?label=${card.deck.id}`}
            className="rounded bg-foreground/[.08] px-1.5 py-px text-xs text-muted-foreground hover:bg-foreground/[.14]"
          >
            {card.deck.name}
          </Link>
          {unread ? (
            <span className="rounded bg-foreground/[.08] px-1.5 py-px text-xs text-muted-foreground">Hộp thư đến</span>
          ) : null}
        </div>

        <div className="relative flex items-start gap-3 md:-ml-14">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-medium text-white"
            style={{ backgroundColor: card.deck.color }}
          >
            {card.word.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <b className="text-sm">{card.deck.name}</b>
              <span className="text-xs text-muted-foreground">&lt;{card.state.toLowerCase()}@vocalearn&gt;</span>
            </div>
            <p className="text-xs text-muted-foreground">tới tôi</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {format(sentAt, "d 'thg' M, yyyy, HH:mm", { locale: vi })}
          </span>
          <IconButton
            label={card.favorite ? "Bỏ gắn sao" : "Gắn sao"}
            className="-mt-2 h-8 w-8"
            onClick={() => void actions.toggleStar(card)}
          >
            <Star className={cn("h-5 w-5", card.favorite && "fill-[#f4b400] text-[#f4b400]")} />
          </IconButton>
        </div>

        <div className="pt-5">
          <MailBody card={card} />
        </div>

        {!inTrash ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {RATING_ORDER.map((r) => (
              <button
                key={r}
                type="button"
                disabled={actions.isBusy}
                onClick={async () => after(await actions.rate(card, r))}
                className="rounded-full border border-input px-5 py-2 text-sm font-medium hover:bg-mail-hover disabled:opacity-50"
              >
                {RATING_LABELS[r]}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
