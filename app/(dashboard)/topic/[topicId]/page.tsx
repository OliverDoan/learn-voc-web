"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardsFilterBar } from "@/components/deck/cards-filter-bar";
import { CardDetailDialog } from "@/components/deck/card-detail-dialog";
import { WordRow } from "@/components/deck/word-row";
import { useCards, useToggleFavorite } from "@/hooks/use-cards";
import { useDecks } from "@/hooks/use-decks";
import {
  groupDecksByTopic,
  topicDeckId,
  topicName,
  topicTitle,
} from "@/lib/deck-topics";
import {
  cardPosCategories,
  parseTags,
  POS_FILTERS,
  type PosKey,
} from "@/lib/utils";
import type { Card } from "@/lib/types";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default function TopicPage({ params }: PageProps) {
  const { topicId } = use(params);
  const topicIndex = /^\d+$/.test(topicId) ? Number(topicId) : null;
  const { data: decks, isLoading } = useDecks();

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPos, setSelectedPos] = useState<PosKey[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [groupByTag, setGroupByTag] = useState(false);
  const [detailCard, setDetailCard] = useState<Card | undefined>();

  // Toàn bộ thẻ của cả topic (gộp 5 unit) + tìm theo từ/nghĩa.
  const { data: topicCards, isLoading: cardsLoading } = useCards(
    topicIndex !== null ? { topic: topicIndex, q: search } : {},
  );
  const toggleFavoriteMut = useToggleFavorite();

  // Các unit (deck) thuộc topic này, đã sắp theo số Unit.
  const group = useMemo(() => {
    if (!decks || topicIndex === null) return null;
    return groupDecksByTopic(decks).find((g) => g.index === topicIndex) ?? null;
  }, [decks, topicIndex]);

  // Map deckId → tên unit để gắn nhãn nguồn cho mỗi từ.
  const unitNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of group?.decks ?? []) map.set(d.id, d.name);
    return map;
  }, [group]);

  const totalWords = useMemo(
    () => group?.decks.reduce((sum, d) => sum + d._count.cards, 0) ?? 0,
    [group],
  );

  const cards = useMemo(() => topicCards ?? [], [topicCards]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) for (const t of parseTags(c.tags)) set.add(t);
    return Array.from(set).sort();
  }, [cards]);

  const availablePos = useMemo<PosKey[]>(() => {
    const set = new Set<PosKey>();
    for (const c of cards) for (const k of cardPosCategories(c.partOfSpeech)) set.add(k);
    return POS_FILTERS.map((p) => p.key).filter((k) => set.has(k));
  }, [cards]);

  const filteredCards = useMemo<Card[]>(() => {
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

  // Nhóm theo tag chủ đề (chỉ khi bật "Nhóm theo chủ đề").
  const groupedByTag = useMemo<{ tag: string; cards: Card[] }[]>(() => {
    if (!groupByTag) return [];
    const order: string[] = [];
    const map = new Map<string, Card[]>();
    const UNTAGGED = "Chưa phân loại";
    for (const card of filteredCards) {
      const key = parseTags(card.tags)[0] ?? UNTAGGED;
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(card);
    }
    order.sort((a, b) => (a === UNTAGGED ? 1 : b === UNTAGGED ? -1 : 0));
    return order.map((tag) => ({ tag, cards: map.get(tag)! }));
  }, [groupByTag, filteredCards]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const togglePos = (pos: PosKey) =>
    setSelectedPos((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );

  const handleToggleFavorite = async (card: Card) => {
    try {
      await toggleFavoriteMut.mutateAsync({ cardId: card.id, favorite: !card.favorite });
      toast.success(card.favorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật yêu thích");
    }
  };

  const renderRow = (card: Card) => (
    <WordRow
      key={card.id}
      card={card}
      sourceLabel={unitNameById.get(card.deckId)}
      onOpenDetail={setDetailCard}
      onToggleFavorite={handleToggleFavorite}
    />
  );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (topicIndex === null || !group || group.decks.length === 0) {
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Layers className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Không tìm thấy topic</h2>
        <p className="mb-6 text-muted-foreground">
          Topic này chưa có unit nào. Hãy quay lại danh sách deck.
        </p>
        <Link href="/decks">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="h-4 w-4" /> Về danh sách deck
          </Button>
        </Link>
      </div>
    );
  }

  const name = topicName(topicIndex);
  const virtualId = topicDeckId(topicIndex);
  const hasWords = totalWords > 0;

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <Link
        href="/decks"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Về danh sách deck
      </Link>

      {/* Tiêu đề topic */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {topicTitle(topicIndex)}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{name ?? `Topic ${topicIndex + 1}`}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {group.decks.length} unit · {totalWords} từ
        </p>
      </div>

      {/* Học / lật thẻ cả topic */}
      {hasWords ? (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <Link href={`/study/${virtualId}`}>
            <Button
              size="lg"
              className="h-auto w-full justify-start rounded-2xl py-4 shadow-[0_8px_20px_rgba(23,61,201,.28)]"
            >
              <Sparkles className="h-5 w-5" />
              <span className="flex flex-col items-start">
                <span className="font-semibold">Học cả topic</span>
                <span className="text-xs font-normal opacity-90">
                  Gộp toàn bộ {totalWords} từ (SRS)
                </span>
              </span>
            </Button>
          </Link>
          <Link href={`/flashcards/${virtualId}`}>
            <Button
              size="lg"
              variant="outline"
              className="h-auto w-full justify-start rounded-2xl py-4"
            >
              <BookOpen className="h-5 w-5" />
              <span className="flex flex-col items-start">
                <span className="font-semibold">Lật thẻ cả topic</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Xem nhanh {totalWords} từ
                </span>
              </span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
          Topic này chưa có từ nào. Hãy thêm từ vào các unit.
        </div>
      )}

      {/* Ô tìm kiếm */}
      <div className="mb-4 flex justify-end">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm từ hoặc nghĩa..."
          className="w-full bg-card shadow-sm sm:w-64"
        />
      </div>

      {/* Bộ lọc loại từ / yêu thích / tag */}
      {cards.length > 0 ? (
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
          totalCount={cards.length}
        />
      ) : null}

      {/* Danh sách từ của cả topic */}
      {cardsLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          {search.trim()
            ? `Không tìm thấy từ nào khớp "${search.trim()}".`
            : "Topic này chưa có từ nào."}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Không có từ nào khớp bộ lọc.
        </div>
      ) : groupByTag ? (
        <div className="space-y-6 pb-16">
          {groupedByTag.map((g) => (
            <section key={g.tag}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-semibold">{g.tag}</h2>
                <span className="font-mono text-xs text-muted-foreground/70">
                  {g.cards.length}
                </span>
              </div>
              <ul className="space-y-2">{g.cards.map(renderRow)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="space-y-2 pb-16">{filteredCards.map(renderRow)}</ul>
      )}

      <CardDetailDialog
        open={!!detailCard}
        onOpenChange={(o) => !o && setDetailCard(undefined)}
        card={detailCard}
        cards={filteredCards}
        onNavigate={setDetailCard}
      />
    </div>
  );
}
