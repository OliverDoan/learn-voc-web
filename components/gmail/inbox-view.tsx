"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox } from "lucide-react";
import type { CardWithDeck } from "@/hooks/use-cards";
import { useInboxSource } from "@/hooks/use-inbox";
import { useMailActions } from "@/hooks/use-mail-actions";
import {
  FOLDER_LABELS,
  INBOX_PAGE_SIZE,
  filterInbox,
  inboxSearch,
  isUnread,
  paginate,
  parseInboxLocation,
} from "@/lib/inbox";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { MailToolbar } from "./mail-toolbar";
import { MailRow } from "./mail-row";

/** Danh sách "mail" từ vựng — giống trang Inbox của Gmail. */
export function InboxView() {
  const router = useRouter();
  const params = useSearchParams();
  const loc = parseInboxLocation(params);
  const inTrash = loc.folder === "trash" && !loc.labelId;
  const [now] = useState(() => new Date());
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const source = useInboxSource(inTrash ? "trash" : loc.folder);
  const actions = useMailActions();

  const filtered = useMemo(
    () => filterInbox(source.cards, { folder: loc.folder, labelId: loc.labelId, query: loc.query }, now),
    [source.cards, loc.folder, loc.labelId, loc.query, now],
  );
  const page = paginate(filtered, loc.page ?? 1, INBOX_PAGE_SIZE);
  const selectedCards = page.items.filter((c) => selected.has(c.id));
  const selection =
    selectedCards.length === 0 ? "none" : selectedCards.length === page.items.length ? "all" : "some";

  const goPage = (p: number) => {
    setSelected(new Set());
    router.push(`/inbox${inboxSearch({ ...loc, page: p })}`);
  };
  const toggle = (card: CardWithDeck) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  const toggleAll = () =>
    setSelected(selection === "none" ? new Set(page.items.map((c) => c.id)) : new Set());
  const runBulk = async (fn: () => Promise<boolean>) => {
    if (await fn()) setSelected(new Set());
  };

  const readerSearch = inboxSearch(loc);
  const title = loc.labelId
    ? (source.cards.find((c) => c.deck.id === loc.labelId)?.deck.name ?? "Nhãn")
    : FOLDER_LABELS[loc.folder];

  return (
    <section aria-label={title}>
      <MailToolbar
        selection={selection}
        onToggleAll={toggleAll}
        onRefresh={() => void source.refetch()}
        refreshing={source.isFetching}
        inTrash={inTrash}
        busy={actions.isBusy}
        onArchive={() => runBulk(() => actions.archive(selectedCards))}
        onDelete={() =>
          runBulk(() => (inTrash ? actions.purge(selectedCards.map((c) => c.id)) : actions.remove(selectedCards)))
        }
        onMarkRead={() => runBulk(() => actions.markRead(selectedCards.filter((c) => isUnread(c, now))))}
        onSnooze={() => runBulk(() => actions.snooze(selectedCards, 1))}
        onRestore={() => runBulk(() => actions.restore(selectedCards.map((c) => c.id)))}
        from={page.from}
        to={page.to}
        total={page.total}
        canPrev={page.page > 1}
        canNext={page.page < page.pageCount}
        onPrev={() => goPage(page.page - 1)}
        onNext={() => goPage(page.page + 1)}
      />

      {loc.query ? (
        <p className="border-b px-4 py-2 text-sm text-muted-foreground">
          Kết quả tìm “{loc.query}” trong <b className="text-foreground">{title}</b>
        </p>
      ) : null}

      {source.isLoading ? (
        <div className="p-4">
          <ListSkeleton />
        </div>
      ) : source.error ? (
        <p className="p-10 text-center text-sm text-destructive">Không tải được danh sách từ. Thử làm mới.</p>
      ) : page.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-16 text-center text-muted-foreground">
          <Inbox className="h-12 w-12 opacity-40" />
          <p className="text-sm">
            {loc.folder === "inbox" && !loc.labelId && !loc.query
              ? "Hộp thư trống — hôm nay không còn từ nào cần ôn 🎉"
              : "Không có từ nào trong mục này."}
          </p>
        </div>
      ) : (
        <div className="border-t">
          {page.items.map((card) => (
            <MailRow
              key={card.id}
              card={card}
              href={`/inbox/${card.id}${readerSearch}`}
              unread={!inTrash && isUnread(card, now)}
              selected={selected.has(card.id)}
              inTrash={inTrash}
              hideLabel={!!loc.labelId}
              now={now}
              onToggleSelect={toggle}
              onStar={(c) => void actions.toggleStar(c)}
              onArchive={(c) => void actions.archive([c])}
              onMarkRead={(c) => void actions.markRead([c])}
              onSnooze={(c) => void actions.snooze([c], 1)}
              onDelete={(c) => void actions.remove([c])}
              onRestore={(c) => void actions.restore([c.id])}
            />
          ))}
        </div>
      )}

      <footer className="flex flex-col items-center gap-1 py-6 text-xs text-muted-foreground">
        <span>{page.total.toLocaleString("vi-VN")} từ trong “{title}”</span>
        <span>Lưu trữ = đã thuộc · Tạm ẩn = hẹn ôn lại ngày mai</span>
      </footer>
    </section>
  );
}
