"use client";

import { useState } from "react";
import { Loader2, RotateCcw, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useTrash, useTrashAction } from "@/hooks/use-cards";
import { useDeckTrash, useDeckTrashAction } from "@/hooks/use-decks";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

function deletedAgo(value: string | null): string | null {
  if (!value) return null;
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: vi });
}

export default function TrashPage() {
  const { data: cards, isLoading: cardsLoading } = useTrash();
  const { data: decks, isLoading: decksLoading } = useDeckTrash();
  const cardMut = useTrashAction();
  const deckMut = useDeckTrashAction();
  const { confirm, confirmDialog } = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);

  const isLoading = cardsLoading || decksLoading;
  const cardIds = cards?.map((c) => c.id) ?? [];
  const deckIds = decks?.map((d) => d.id) ?? [];
  const isEmpty = cardIds.length === 0 && deckIds.length === 0;

  const runCards = async (action: "restore" | "purge", ids: string[], purgeTitle?: string) => {
    if (ids.length === 0) return;
    if (purgeTitle) {
      const ok = await confirm({
        title: purgeTitle,
        description: "Từ sẽ bị xoá vĩnh viễn khỏi cơ sở dữ liệu. Hành động này không thể hoàn tác.",
        confirmText: "Xoá vĩnh viễn",
      });
      if (!ok) return;
    }
    setBusy(ids.length === 1 ? ids[0] : "cards-all");
    try {
      const res = await cardMut.mutateAsync({ action, ids });
      toast.success(
        action === "restore" ? `Đã khôi phục ${res.count} từ` : `Đã xoá vĩnh viễn ${res.count} từ`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setBusy(null);
    }
  };

  const runDecks = async (action: "restore" | "purge", ids: string[], purgeTitle?: string) => {
    if (ids.length === 0) return;
    if (purgeTitle) {
      const ok = await confirm({
        title: purgeTitle,
        description:
          "Deck cùng toàn bộ từ và truyện bên trong sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.",
        confirmText: "Xoá vĩnh viễn",
      });
      if (!ok) return;
    }
    setBusy(ids.length === 1 ? ids[0] : "decks-all");
    try {
      const res = await deckMut.mutateAsync({ action, ids });
      toast.success(
        action === "restore"
          ? `Đã khôi phục ${res.count} deck`
          : `Đã xoá vĩnh viễn ${res.count} deck`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Trash className="h-6 w-6" /> Thùng rác
        </h1>
        <p className="text-sm text-muted-foreground">
          Deck và từ đã xoá nằm ở đây — khôi phục bất cứ lúc nào hoặc xoá vĩnh viễn.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Trash className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Thùng rác trống</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Khi bạn xoá một deck hoặc một từ, nó sẽ xuất hiện ở đây để có thể khôi phục.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {deckIds.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Decks đã xoá ({deckIds.length})
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => runDecks("restore", deckIds)}>
                    <RotateCcw className="h-4 w-4" /> Khôi phục tất cả
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => runDecks("purge", deckIds, `Xoá vĩnh viễn ${deckIds.length} deck?`)}
                  >
                    <Trash2 className="h-4 w-4" /> Dọn sạch
                  </Button>
                </div>
              </div>
              <ul className="space-y-2">
                {decks!.map((deck) => {
                  const b = busy === deck.id || busy === "decks-all";
                  return (
                    <li key={deck.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                        style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
                      >
                        {deck.icon ?? "📘"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{deck.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {deck._count.cards} từ · {deck._count.stories} truyện
                          {deletedAgo(deck.deletedAt) ? ` · đã xoá ${deletedAgo(deck.deletedAt)}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => runDecks("restore", [deck.id])}
                          disabled={b}
                          title="Khôi phục"
                          aria-label="Khôi phục"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => runDecks("purge", [deck.id], `Xoá vĩnh viễn deck "${deck.name}"?`)}
                          disabled={b}
                          title="Xoá vĩnh viễn"
                          aria-label="Xoá vĩnh viễn"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {cardIds.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Từ đã xoá ({cardIds.length})
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => runCards("restore", cardIds)}>
                    <RotateCcw className="h-4 w-4" /> Khôi phục tất cả
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => runCards("purge", cardIds, `Xoá vĩnh viễn ${cardIds.length} từ?`)}
                  >
                    <Trash2 className="h-4 w-4" /> Dọn sạch
                  </Button>
                </div>
              </div>
              <ul className="space-y-2">
                {cards!.map((card) => {
                  const b = busy === card.id || busy === "cards-all";
                  return (
                    <li key={card.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-semibold">{card.word}</span>
                          {card.partOfSpeech ? (
                            <Badge variant="outline" className="text-xs">
                              {card.partOfSpeech}
                            </Badge>
                          ) : null}
                          <Badge variant="secondary" className="text-xs">
                            {card.deck.icon ?? "📘"} {card.deck.name}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{card.meaning}</p>
                        {deletedAgo(card.deletedAt) ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Đã xoá {deletedAgo(card.deletedAt)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => runCards("restore", [card.id])}
                          disabled={b}
                          title="Khôi phục"
                          aria-label="Khôi phục"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => runCards("purge", [card.id], `Xoá vĩnh viễn "${card.word}"?`)}
                          disabled={b}
                          title="Xoá vĩnh viễn"
                          aria-label="Xoá vĩnh viễn"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      )}
      {confirmDialog}
    </div>
  );
}
