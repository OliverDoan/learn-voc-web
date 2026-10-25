"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Layers, List, Plus, Table2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ChineseCardFormDialog } from "@/components/chinese/chinese-card-form-dialog";
import { useDeleteCard } from "@/hooks/use-cards";
import type { Card } from "@/lib/types";
import { ChineseWordRow } from "@/components/chinese/chinese-word-row";
import { ChineseCardsTable } from "@/components/chinese/chinese-cards-table";
import { WrongLanguageNotice } from "@/components/chinese/wrong-language-notice";
import { isChineseDeck } from "@/lib/chinese";
import { cn } from "@/lib/utils";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { useCards } from "@/hooks/use-cards";
import { useDeck } from "@/hooks/use-decks";

type ViewMode = "list" | "table";

const VIEW_MODES: Array<{ id: ViewMode; label: string; icon: LucideIcon }> = [
  { id: "list", label: "Danh sách", icon: List },
  { id: "table", label: "Bảng", icon: Table2 },
];

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function ChineseDeckPage({ params }: PageProps) {
  const { deckId } = use(params);
  const { data: deck } = useDeck(deckId);
  const { data: cards, isLoading } = useCards({ deckId });
  const deleteCard = useDeleteCard();
  const { confirm, confirmDialog } = useConfirm();

  // `undefined` = dialog đóng; `null` = thêm thẻ mới; có thẻ = sửa thẻ đó.
  const [editing, setEditing] = useState<Card | null | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const liveCards = (cards ?? []).filter((c) => !c.deletedAt);

  const handleDelete = async (card: Card) => {
    const okToDelete = await confirm({
      title: `Xoá thẻ ${card.word}?`,
      description: "Thẻ sẽ được chuyển vào thùng rác, có thể khôi phục sau.",
      confirmText: "Xoá",
      variant: "destructive",
    });
    if (!okToDelete) return;
    try {
      await deleteCard.mutateAsync(card.id);
      toast.success(`Đã xoá ${card.word}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi xoá thẻ");
    }
  };

  // Mở deck tiếng Anh bằng URL /chinese/... sẽ đọc sai giọng → chỉ sang đúng trang.
  if (deck && !isChineseDeck(deck)) {
    return <WrongLanguageNotice href={`/decks/${deckId}`} deckName={deck.name} />;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Link
        href="/chinese"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Deck China
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{
              backgroundColor: `${deck?.color ?? "#3b82f6"}20`,
              color: deck?.color ?? "#3b82f6",
            }}
          >
            {deck?.icon ?? "🀄"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{deck?.name ?? "Deck"}</h1>
            <p className="text-sm text-muted-foreground">
              {deck?.description ?? `${liveCards.length} từ`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button className="rounded-full" onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" /> Thêm chữ
          </Button>
          {/* Chưa mở phần bài tập (trắc nghiệm) cho Deck China — chỉ bảng từ + lật thẻ. */}
          {liveCards.length > 0 ? (
            <Link
              href={`/chinese/${deckId}/flashcards`}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Layers className="h-4 w-4" /> Lật thẻ
            </Link>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : liveCards.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Deck này chưa có từ nào — bấm “Thêm chữ” để bắt đầu.
        </div>
      ) : (
        <>
          <div className="mb-4 inline-flex rounded-lg border bg-card p-0.5">
            {VIEW_MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewMode(id)}
                aria-pressed={viewMode === id}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  viewMode === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {viewMode === "table" ? (
            <ChineseCardsTable cards={liveCards} deckId={deckId} />
          ) : (
            <div className="flex flex-col gap-2">
              {liveCards.map((card, index) => (
                <ChineseWordRow
                  key={card.id}
                  card={card}
                  index={index + 1}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ChineseCardFormDialog
        key={editing === undefined ? "closed" : (editing?.id ?? "new")}
        open={editing !== undefined}
        onOpenChange={(next) => setEditing(next ? null : undefined)}
        deckId={deckId}
        card={editing ?? undefined}
      />
      {confirmDialog}
    </div>
  );
}
