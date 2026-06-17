"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Layers,
  Mic,
  Pencil,
  Play,
  Plus,
  Sprout,
  Square,
  SquareCheck,
  Star,
  Trash2,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CardFormDialog } from "@/components/deck/card-form-dialog";
import { DeckFormDialog } from "@/components/deck/deck-form-dialog";
import { ImportCardsDialog } from "@/components/deck/import-cards-dialog";
import { ExportButton } from "@/components/deck/export-cards-dialog";
import { ReadAllButton } from "@/components/deck/read-all-button";
import { CardsFilterBar, type CardStateFilter } from "@/components/deck/cards-filter-bar";
import { StoryList } from "@/components/story/story-list";
import { useCards, useDeleteCard, useRestoreCard, useToggleFavorite } from "@/hooks/use-cards";
import { useDeck, useDeleteDeck, useRestoreDeck } from "@/hooks/use-decks";
import { displayRootWord, parseTags } from "@/lib/utils";
import { speak } from "@/lib/tts";
import type { Card as CardType } from "@/lib/types";

const stateColors: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  NEW: "secondary",
  LEARNING: "warning",
  REVIEW: "default",
  MATURE: "success",
  SUSPENDED: "outline",
};

const stateLabels: Record<string, string> = {
  NEW: "Mới",
  LEARNING: "Đang học",
  REVIEW: "Ôn tập",
  MATURE: "Thuộc",
  SUSPENDED: "Tạm dừng",
};

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function DeckDetailPage({ params }: PageProps) {
  const { deckId } = use(params);
  const router = useRouter();
  const [openAddCard, setOpenAddCard] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openEditDeck, setOpenEditDeck] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | undefined>();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<CardStateFilter>("ALL");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: cards, isLoading: cardsLoading } = useCards({
    deckId,
    q: search,
    state: stateFilter === "ALL" ? undefined : stateFilter,
  });
  const deleteCardMut = useDeleteCard();
  const restoreCardMut = useRestoreCard();
  const toggleFavoriteMut = useToggleFavorite();
  const deleteDeckMut = useDeleteDeck();
  const restoreDeckMut = useRestoreDeck();
  const { confirm, confirmDialog } = useConfirm();

  const availableTags = useMemo(() => {
    if (!cards) return [] as string[];
    const set = new Set<string>();
    for (const c of cards) {
      for (const t of parseTags(c.tags)) set.add(t);
    }
    return Array.from(set).sort();
  }, [cards]);

  const filteredCards = useMemo<CardType[]>(() => {
    if (!cards) return [];
    return cards.filter((c) => {
      if (favoriteOnly && !c.favorite) return false;
      if (selectedTags.length > 0) {
        const tags = parseTags(c.tags);
        if (!selectedTags.every((t) => tags.includes(t))) return false;
      }
      return true;
    });
  }, [cards, selectedTags, favoriteOnly]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleSelectCard = (cardId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const filteredAllSelected =
    filteredCards.length > 0 && filteredCards.every((c) => selectedIds.has(c.id));

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (filteredAllSelected) {
        for (const c of filteredCards) next.delete(c.id);
      } else {
        for (const c of filteredCards) next.add(c.id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const goStudySelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(",");
    router.push(`/study/${deckId}?ids=${encodeURIComponent(ids)}`);
  };

  const goQuizSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(",");
    router.push(`/quiz/${deckId}?ids=${encodeURIComponent(ids)}`);
  };

  const goFlashcardsSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(",");
    router.push(`/flashcards/${deckId}?ids=${encodeURIComponent(ids)}`);
  };

  const goPronounceSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(",");
    router.push(`/pronounce/${deckId}?ids=${encodeURIComponent(ids)}`);
  };

  const handleToggleFavorite = async (card: CardType) => {
    try {
      await toggleFavoriteMut.mutateAsync({ cardId: card.id, favorite: !card.favorite });
      toast.success(card.favorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật yêu thích");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const ok = await confirm({
      title: "Xoá từ này?",
      description: "Từ sẽ được chuyển vào Thùng rác — bạn có thể khôi phục bất cứ lúc nào.",
    });
    if (!ok) return;
    try {
      await deleteCardMut.mutateAsync(cardId);
      toast.success("Đã chuyển từ vào thùng rác", {
        action: {
          label: "Hoàn tác",
          onClick: async () => {
            try {
              await restoreCardMut.mutateAsync(cardId);
              toast.success("Đã khôi phục từ");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Không khôi phục được");
            }
          },
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi xoá");
    }
  };

  const handleDeleteDeck = async () => {
    const ok = await confirm({
      title: `Xoá deck "${deck?.name}"?`,
      description: `Deck cùng ${deck?._count.cards} từ sẽ được chuyển vào Thùng rác — bạn có thể khôi phục bất cứ lúc nào.`,
    });
    if (!ok) return;
    try {
      await deleteDeckMut.mutateAsync(deckId);
      router.push("/decks");
      toast.success("Đã chuyển deck vào thùng rác", {
        action: {
          label: "Hoàn tác",
          onClick: async () => {
            try {
              await restoreDeckMut.mutateAsync(deckId);
              toast.success("Đã khôi phục deck");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Không khôi phục được");
            }
          },
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi xoá");
    }
  };

  if (deckLoading) {
    return <div className="container mx-auto max-w-5xl p-6">Đang tải...</div>;
  }
  if (!deck) {
    return (
      <div className="container mx-auto max-w-5xl p-6">
        <p>Không tìm thấy deck.</p>
        <Link href="/decks" className="text-primary underline">
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <Link
        href="/decks"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tất cả decks
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
          >
            {deck.icon ?? "📘"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            {deck.description ? (
              <p className="text-sm text-muted-foreground">{deck.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {deck._count.cards} từ · {deck._count.stories} truyện
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/study/${deckId}`}>
            <Button>
              <Play className="h-4 w-4" />
              Bắt đầu ôn
            </Button>
          </Link>
          <Link href={`/flashcards/${deckId}`}>
            <Button variant="outline">
              <Layers className="h-4 w-4" />
              Flashcard
            </Button>
          </Link>
          <Link href={`/quiz/${deckId}`}>
            <Button variant="outline">
              <BookOpen className="h-4 w-4" />
              Quiz
            </Button>
          </Link>
          <Link href={`/pronounce/${deckId}`}>
            <Button variant="outline">
              <Mic className="h-4 w-4" />
              Phát âm
            </Button>
          </Link>
          <ReadAllButton cards={cards ?? []} />
          <Button variant="outline" size="icon" onClick={() => setOpenEditDeck(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDeleteDeck}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm từ hoặc nghĩa..."
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <ExportButton
            deckId={deckId}
            deckName={deck.name}
            cardCount={deck._count.cards}
          />
          <Button variant="outline" onClick={() => setOpenImport(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button onClick={() => setOpenAddCard(true)}>
            <Plus className="h-4 w-4" /> Thêm từ
          </Button>
        </div>
      </div>

      <CardsFilterBar
        state={stateFilter}
        onStateChange={setStateFilter}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={() => setSelectedTags([])}
        favoriteOnly={favoriteOnly}
        onToggleFavoriteOnly={() => setFavoriteOnly((v) => !v)}
        matchCount={filteredCards.length}
        totalCount={cards?.length ?? 0}
      />

      {filteredCards.length > 0 ? (
        <div className="mb-2 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            {filteredAllSelected ? (
              <SquareCheck className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {filteredAllSelected
              ? `Bỏ chọn ${filteredCards.length} từ`
              : `Chọn tất cả (${filteredCards.length})`}
          </button>
          {selectedIds.size > 0 ? (
            <span className="text-muted-foreground">
              Đã chọn <strong className="text-primary">{selectedIds.size}</strong> từ
            </span>
          ) : null}
        </div>
      ) : null}

      {cardsLoading ? (
        <p className="text-center text-muted-foreground">Đang tải...</p>
      ) : !cards || cards.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed py-12 text-center">
          <p className="mb-4 text-muted-foreground">Chưa có từ nào</p>
          <div className="flex gap-2">
            <Button onClick={() => setOpenAddCard(true)}>
              <Plus className="h-4 w-4" /> Thêm từ đầu tiên
            </Button>
            <Button variant="outline" onClick={() => setOpenImport(true)}>
              <Upload className="h-4 w-4" /> Import từ file
            </Button>
          </div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Không có từ nào khớp bộ lọc.
        </div>
      ) : (
        <ul className="space-y-2 pb-24">
          {filteredCards.map((card) => {
            const tags = parseTags(card.tags);
            const isSelected = selectedIds.has(card.id);
            return (
              <li
                key={card.id}
                className={`group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30 ${
                  isSelected ? "border-primary/60 bg-primary/5" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSelectCard(card.id)}
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary"
                  }`}
                  aria-label={isSelected ? "Bỏ chọn" : "Chọn từ"}
                  aria-pressed={isSelected}
                >
                  {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 shrink-0"
                  onClick={() => speak(card.word)}
                  aria-label="Phát âm"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 shrink-0"
                  onClick={() => handleToggleFavorite(card)}
                  aria-label={card.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                  aria-pressed={card.favorite}
                  title={card.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                >
                  <Star
                    className={`h-4 w-4 ${
                      card.favorite
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold">{card.word}</span>
                    {card.phonetic ? (
                      <span className="font-phonetic text-xs text-muted-foreground">
                        {card.phonetic}
                      </span>
                    ) : null}
                    {card.partOfSpeech ? (
                      <Badge variant="outline" className="text-xs">
                        {card.partOfSpeech}
                      </Badge>
                    ) : null}
                    <Badge variant={stateColors[card.state] ?? "secondary"} className="text-xs">
                      {stateLabels[card.state] ?? card.state}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{card.meaning}</p>
                  {displayRootWord(card.word, card.rootWord) ? (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Sprout className="h-3 w-3 shrink-0" />
                      <span className="text-muted-foreground">Từ gốc:</span>
                      <span>{displayRootWord(card.word, card.rootWord)}</span>
                    </div>
                  ) : null}
                  {card.example ? (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      &ldquo;{card.example}&rdquo;
                    </p>
                  ) : null}
                  {tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCard(card)}
                    aria-label="Sửa"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCard(card.id)}
                    aria-label="Xoá"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <StoryList deckId={deckId} />

      <CardFormDialog
        open={openAddCard}
        onOpenChange={setOpenAddCard}
        deckId={deckId}
      />
      <CardFormDialog
        open={!!editingCard}
        onOpenChange={(o) => !o && setEditingCard(undefined)}
        deckId={deckId}
        card={editingCard}
      />
      <DeckFormDialog
        open={openEditDeck}
        onOpenChange={setOpenEditDeck}
        deck={deck}
      />
      <ImportCardsDialog
        open={openImport}
        onOpenChange={setOpenImport}
        deckId={deckId}
      />

      {selectedIds.size > 0 ? (
        <div className="fixed inset-x-0 bottom-16 z-40 px-4 md:bottom-4">
          <div className="container mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <span>
                  Đã chọn <strong className="text-primary">{selectedIds.size}</strong> từ
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={goStudySelected}>
                  <Play className="h-4 w-4" /> Ôn
                </Button>
                <Button size="sm" variant="outline" onClick={goFlashcardsSelected}>
                  <Layers className="h-4 w-4" /> Lật thẻ
                </Button>
                <Button size="sm" variant="outline" onClick={goQuizSelected}>
                  <BookOpen className="h-4 w-4" /> Quiz
                </Button>
                <Button size="sm" variant="outline" onClick={goPronounceSelected}>
                  <Mic className="h-4 w-4" /> Phát âm
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  <X className="h-4 w-4" /> Bỏ chọn
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {confirmDialog}
    </div>
  );
}
