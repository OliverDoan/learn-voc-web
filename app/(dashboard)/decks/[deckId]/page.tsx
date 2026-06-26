"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardCheck,
  GripVertical,
  Layers,
  List,
  Mic,
  Pencil,
  Play,
  Plus,
  Square,
  SquareCheck,
  Star,
  Table2,
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
import { AutoScrollControls } from "@/components/ui/auto-scroll-controls";
import { CardFormDialog } from "@/components/deck/card-form-dialog";
import { CardDetailDialog } from "@/components/deck/card-detail-dialog";
import { DeckFormDialog } from "@/components/deck/deck-form-dialog";
import { ImportCardsDialog } from "@/components/deck/import-cards-dialog";
import { ExportButton } from "@/components/deck/export-cards-dialog";
import { ReadAllButton } from "@/components/deck/read-all-button";
import { CardsFilterBar } from "@/components/deck/cards-filter-bar";
import { CardsTable } from "@/components/deck/cards-table";
import { CardsTest } from "@/components/deck/cards-test";
import { StoryList } from "@/components/story/story-list";
import {
  useCards,
  useDeleteCard,
  useReorderCards,
  useRestoreCard,
  useToggleFavorite,
} from "@/hooks/use-cards";
import { useDeck, useDeleteDeck, useRestoreDeck } from "@/hooks/use-decks";
import {
  cardPosCategories,
  cn,
  parseTags,
  posBadgeClass,
  POS_FILTERS,
  type PosKey,
} from "@/lib/utils";
import { speak } from "@/lib/tts";
import type { Card as CardType } from "@/lib/types";

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
  const [detailCard, setDetailCard] = useState<CardType | undefined>();
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [selectedPos, setSelectedPos] = useState<PosKey[]>([]);
  const [groupByTag, setGroupByTag] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "table" | "test">("list");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // Kéo-thả sắp xếp thứ tự (chỉ khi không lọc/tìm kiếm)
  const [orderedCards, setOrderedCards] = useState<CardType[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragArmed = useRef(false);

  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: cards, isLoading: cardsLoading } = useCards({
    deckId,
    q: search,
  });
  const deleteCardMut = useDeleteCard();
  const restoreCardMut = useRestoreCard();
  const toggleFavoriteMut = useToggleFavorite();
  const reorderMut = useReorderCards();
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

  // Các nhóm từ loại thực sự có trong deck (giữ thứ tự chuẩn của POS_FILTERS)
  const availablePos = useMemo<PosKey[]>(() => {
    if (!cards) return [];
    const set = new Set<PosKey>();
    for (const c of cards) {
      for (const k of cardPosCategories(c.partOfSpeech)) set.add(k);
    }
    return POS_FILTERS.map((p) => p.key).filter((k) => set.has(k));
  }, [cards]);

  const filteredCards = useMemo<CardType[]>(() => {
    if (!cards) return [];
    return cards.filter((c) => {
      if (favoriteOnly && !c.favorite) return false;
      if (selectedTags.length > 0) {
        const tags = parseTags(c.tags);
        if (!selectedTags.every((t) => tags.includes(t))) return false;
      }
      if (selectedPos.length > 0) {
        const cats = cardPosCategories(c.partOfSpeech);
        if (!selectedPos.some((p) => cats.includes(p))) return false;
      }
      return true;
    });
  }, [cards, selectedTags, favoriteOnly, selectedPos]);

  // Đồng bộ danh sách thứ tự cục bộ từ server (dùng cho kéo-thả lạc quan)
  useEffect(() => {
    if (cards) setOrderedCards(cards);
  }, [cards]);

  // Chỉ cho kéo-thả khi đang xem TẤT CẢ thẻ theo thứ tự gốc (không lọc/tìm/nhóm)
  const canReorder =
    selectMode &&
    search.trim() === "" &&
    selectedTags.length === 0 &&
    selectedPos.length === 0 &&
    !favoriteOnly &&
    !groupByTag;

  // Thoát chế độ chọn: tắt cờ và xoá lựa chọn hiện có
  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const displayCards =
    canReorder && orderedCards.length > 0 ? orderedCards : filteredCards;

  // Nhóm các từ đang hiển thị theo tag chủ đề (giữ thứ tự xuất hiện của tag)
  const groupedCards = useMemo<{ tag: string; cards: CardType[] }[]>(() => {
    if (!groupByTag) return [];
    const order: string[] = [];
    const map = new Map<string, CardType[]>();
    const UNTAGGED = "Chưa phân loại";
    for (const card of displayCards) {
      const tags = parseTags(card.tags);
      const key = tags[0] ?? UNTAGGED;
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(card);
    }
    // Đẩy nhóm "Chưa phân loại" xuống cuối cho gọn
    order.sort((a, b) =>
      a === UNTAGGED ? 1 : b === UNTAGGED ? -1 : 0,
    );
    return order.map((tag) => ({ tag, cards: map.get(tag)! }));
  }, [groupByTag, displayCards]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const togglePos = (pos: PosKey) => {
    setSelectedPos((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );
  };

  const handleDrop = async (targetId: string) => {
    const sourceId = dragId;
    setDragId(null);
    setOverId(null);
    dragArmed.current = false;
    if (!sourceId || sourceId === targetId) return;

    const from = orderedCards.findIndex((c) => c.id === sourceId);
    const to = orderedCards.findIndex((c) => c.id === targetId);
    if (from === -1 || to === -1) return;

    const previous = orderedCards;
    const next = [...orderedCards];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrderedCards(next); // cập nhật lạc quan

    try {
      await reorderMut.mutateAsync({ deckId, orderedIds: next.map((c) => c.id) });
    } catch (error) {
      setOrderedCards(previous); // revert nếu lỗi
      toast.error(error instanceof Error ? error.message : "Lỗi khi sắp xếp");
    }
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

  const renderCard = (card: CardType) => {
    const isSelected = selectedIds.has(card.id);
    const isDragging = dragId === card.id;
    const isOver = overId === card.id && dragId !== card.id;
    return (
      <li
        key={card.id}
        draggable={canReorder}
        onDragStart={(e) => {
          if (!canReorder || !dragArmed.current) {
            e.preventDefault();
            return;
          }
          setDragId(card.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => {
          if (!canReorder || !dragId) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (overId !== card.id) setOverId(card.id);
        }}
        onDrop={(e) => {
          if (!canReorder) return;
          e.preventDefault();
          handleDrop(card.id);
        }}
        onDragEnd={() => {
          setDragId(null);
          setOverId(null);
          dragArmed.current = false;
        }}
        className={`group flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 transition-all hover:border-primary/40 hover:shadow-md ${
          isSelected ? "border-primary/60 bg-primary/5" : ""
        } ${isDragging ? "opacity-40" : ""} ${
          isOver ? "border-primary ring-2 ring-primary/40" : ""
        }`}
      >
        {selectMode && canReorder ? (
          <button
            type="button"
            onMouseDown={() => {
              dragArmed.current = true;
            }}
            onMouseUp={() => {
              dragArmed.current = false;
            }}
            className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label="Kéo để sắp xếp"
            title="Kéo để sắp xếp lại thứ tự"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}
        {selectMode ? (
          <button
            type="button"
            onClick={() => toggleSelectCard(card.id)}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-primary"
            }`}
            aria-label={isSelected ? "Bỏ chọn" : "Chọn từ"}
            aria-pressed={isSelected}
          >
            {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
          </button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => speak(card.word)}
          aria-label="Phát âm"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={() => setDetailCard(card)}
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
          title="Xem chi tiết"
        >
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold group-hover:text-primary group-hover:underline">
              {card.word}
            </span>
            {card.phonetic ? (
              <span className="font-phonetic text-xs text-muted-foreground">{card.phonetic}</span>
            ) : null}
            {card.partOfSpeech ? (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                  posBadgeClass(card.partOfSpeech),
                )}
              >
                {card.partOfSpeech}
              </span>
            ) : null}
            <span className="text-sm text-muted-foreground">{card.meaning}</span>
          </span>
          {card.example ? (
            <span className="truncate text-xs italic text-muted-foreground">
              &ldquo;{card.example}&rdquo;
            </span>
          ) : null}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
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
      </li>
    );
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
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
          >
            {deck.icon ?? "📘"}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            {deck.description ? (
              <p className="text-sm text-muted-foreground">{deck.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {deck._count.cards} từ · {deck._count.stories} truyện
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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

      <StoryList deckId={deckId} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm từ hoặc nghĩa..."
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectMode ? "default" : "outline"}
            onClick={toggleSelectMode}
          >
            {selectMode ? (
              <>
                <X className="h-4 w-4" /> Xong
              </>
            ) : (
              <>
                <SquareCheck className="h-4 w-4" /> Chọn / Sắp xếp
              </>
            )}
          </Button>
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
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={() => setSelectedTags([])}
        availablePos={availablePos}
        selectedPos={selectedPos}
        onTogglePos={togglePos}
        favoriteOnly={favoriteOnly}
        onToggleFavoriteOnly={() => setFavoriteOnly((v) => !v)}
        groupByTag={groupByTag}
        onToggleGroupByTag={() => setGroupByTag((v) => !v)}
        matchCount={filteredCards.length}
        totalCount={cards?.length ?? 0}
      />

      {selectMode && filteredCards.length > 0 ? (
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
          ) : canReorder ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <GripVertical className="h-3.5 w-3.5" /> Kéo để sắp xếp lại thứ tự
            </span>
          ) : null}
        </div>
      ) : null}

      {cards && cards.length > 0 ? (
        <div className="mb-3 inline-flex rounded-lg border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="h-4 w-4" /> Danh sách
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "table"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Table2 className="h-4 w-4" /> Bảng
          </button>
          <button
            type="button"
            onClick={() => setViewMode("test")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "test"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ClipboardCheck className="h-4 w-4" /> Kiểm tra
          </button>
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
      ) : viewMode === "test" ? (
        <CardsTest cards={displayCards} />
      ) : viewMode === "table" && deck ? (
        <CardsTable cards={displayCards} deck={deck} />
      ) : groupByTag ? (
        <div className="space-y-6 pb-24">
          {groupedCards.map((group) => (
            <section key={group.tag}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{group.tag}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {group.cards.length}
                </Badge>
              </div>
              <ul className="space-y-2">{group.cards.map(renderCard)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="space-y-2 pb-24">{displayCards.map(renderCard)}</ul>
      )}

      <CardDetailDialog
        open={!!detailCard}
        onOpenChange={(o) => !o && setDetailCard(undefined)}
        card={detailCard}
        onEdit={(c) => {
          setDetailCard(undefined);
          setEditingCard(c);
        }}
        onDelete={(c) => {
          setDetailCard(undefined);
          handleDeleteCard(c.id);
        }}
      />
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

      {/* Tự cuộn lên/xuống — tiện khi danh sách từ dài */}
      {displayCards.length > 4 ? <AutoScrollControls /> : null}
    </div>
  );
}
