"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Layers, Loader2, Mic, Play, SpellCheck, Star, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectMenu, type SelectOption } from "@/components/ui/select-menu";
import { DialectBadge } from "@/components/deck/dialect-badge";
import { ReadAllButton } from "@/components/deck/read-all-button";
import { useFavorites, useToggleFavorite } from "@/hooks/use-cards";
import { speak, spell } from "@/lib/tts";
import type { FavoriteCard } from "@/hooks/use-cards";

/** Thông tin deck rút gọn để hiển thị nút lọc. */
interface DeckFilterOption {
  id: string;
  name: string;
  icon: string | null;
  count: number;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { data: cards, isLoading } = useFavorites();
  const toggleFavoriteMut = useToggleFavorite();

  // null = hiển thị tất cả deck.
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  // Cách sắp xếp: theo chữ cái (A→Z) hoặc gom nhóm theo deck.
  const [sortBy, setSortBy] = useState<"alpha" | "deck">("alpha");

  // Danh sách deck có trong từ yêu thích, kèm số lượng từ mỗi deck.
  const deckOptions = useMemo<DeckFilterOption[]>(() => {
    if (!cards) return [];
    const map = new Map<string, DeckFilterOption>();
    for (const card of cards) {
      const existing = map.get(card.deck.id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(card.deck.id, {
          id: card.deck.id,
          name: card.deck.name,
          icon: card.deck.icon,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cards]);

  const filteredCards = useMemo<FavoriteCard[]>(() => {
    if (!cards) return [];
    if (!selectedDeckId) return cards;
    return cards.filter((card) => card.deck.id === selectedDeckId);
  }, [cards, selectedDeckId]);

  // Sắp xếp: "deck" → theo tên deck rồi theo từ; "alpha" → theo từ (A→Z).
  const sortedCards = useMemo<FavoriteCard[]>(() => {
    const arr = [...filteredCards];
    arr.sort((a, b) =>
      sortBy === "deck"
        ? a.deck.name.localeCompare(b.deck.name) || a.word.localeCompare(b.word)
        : a.word.localeCompare(b.word),
    );
    return arr;
  }, [filteredCards, sortBy]);

  // Gom nhóm theo deck (dùng khi sắp xếp "theo deck"). sortedCards đã theo đúng thứ tự nhóm.
  const groupedByDeck = useMemo(() => {
    const order: string[] = [];
    const map = new Map<
      string,
      { id: string; name: string; icon: string | null; cards: FavoriteCard[] }
    >();
    for (const card of sortedCards) {
      let group = map.get(card.deck.id);
      if (!group) {
        group = { id: card.deck.id, name: card.deck.name, icon: card.deck.icon, cards: [] };
        map.set(card.deck.id, group);
        order.push(card.deck.id);
      }
      group.cards.push(card);
    }
    return order.map((id) => map.get(id)!);
  }, [sortedCards]);

  const sortOptions: SelectOption[] = [
    { value: "alpha", label: "Theo chữ cái (A→Z)" },
    { value: "deck", label: "Theo deck" },
  ];

  // Tuỳ chọn cho dropdown lọc: "Tất cả" + từng deck.
  const selectOptions = useMemo<SelectOption[]>(() => {
    const total = cards?.length ?? 0;
    return [
      { value: "", label: "Tất cả deck", count: total },
      ...deckOptions.map((deck) => ({
        value: deck.id,
        label: deck.name,
        icon: deck.icon ?? "📘",
        count: deck.count,
      })),
    ];
  }, [cards, deckOptions]);

  // Bắt đầu một dạng bài tập với chính các từ yêu thích đang hiển thị (theo bộ lọc deck).
  // Dùng deckId ảo "all" + danh sách ids để học liên deck — giống chế độ chọn từ trong deck.
  const startExercise = (kind: "study" | "flashcards" | "quiz" | "pronounce") => {
    const ids = filteredCards.map((c) => c.id).join(",");
    if (!ids) {
      toast.error("Không có từ yêu thích để luyện tập");
      return;
    }
    router.push(`/${kind}/all?ids=${encodeURIComponent(ids)}`);
  };

  const handleUnfavorite = async (card: FavoriteCard) => {
    try {
      await toggleFavoriteMut.mutateAsync({ cardId: card.id, favorite: false });
      toast.success("Đã bỏ yêu thích");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật");
    }
  };

  const renderCard = (card: FavoriteCard) => (
    <li
      key={card.id}
      className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="mt-0.5 flex shrink-0 flex-col gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => speak(card.word)}
          aria-label="Phát âm"
          title="Phát âm"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => spell(card.word)}
          aria-label="Đánh vần từng chữ"
          title="Đánh vần từng chữ"
        >
          <SpellCheck className="h-4 w-4" />
        </Button>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{card.word}</span>
          {card.phonetic ? (
            <span className="font-phonetic text-xs text-muted-foreground">{card.phonetic}</span>
          ) : null}
          {card.partOfSpeech ? (
            <Badge variant="outline" className="text-xs">
              {card.partOfSpeech}
            </Badge>
          ) : null}
          <DialectBadge dialect={card.dialect} variantWord={card.variantWord} />
          <Link href={`/decks/${card.deck.id}`}>
            <Badge
              variant="secondary"
              className="text-xs transition-colors hover:bg-secondary/70"
            >
              {card.deck.icon ?? "📘"} {card.deck.name}
            </Badge>
          </Link>
        </div>
        <p className="mt-1 text-sm">{card.meaning}</p>
        {card.example ? (
          <p className="mt-1 text-xs italic text-muted-foreground">
            &ldquo;{card.example}&rdquo;
          </p>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="mt-0.5 shrink-0"
        onClick={() => handleUnfavorite(card)}
        aria-label="Bỏ yêu thích"
        title="Bỏ yêu thích"
      >
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      </Button>
    </li>
  );

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Star className="h-6 w-6 fill-amber-400 text-amber-400" /> Từ yêu thích
        </h1>
        <p className="text-sm text-muted-foreground">
          Những từ bạn đã đánh dấu sao — gom từ tất cả các deck.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !cards || cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Star className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Chưa có từ yêu thích</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Nhấn vào icon ngôi sao ở danh sách từ trong mỗi deck để thêm vào đây.
          </p>
        </div>
      ) : (
        <>
          {/* Lọc theo deck + sắp xếp */}
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {deckOptions.length > 1 ? (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="deck-filter"
                  className="shrink-0 text-sm text-muted-foreground"
                >
                  Lọc theo deck
                </label>
                <SelectMenu
                  id="deck-filter"
                  value={selectedDeckId ?? ""}
                  onChange={(v) => setSelectedDeckId(v || null)}
                  options={selectOptions}
                  className="w-48"
                />
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="shrink-0 text-sm text-muted-foreground">
                Sắp xếp
              </label>
              <SelectMenu
                id="sort-by"
                value={sortBy}
                onChange={(v) => setSortBy(v as "alpha" | "deck")}
                options={sortOptions}
                className="w-48"
              />
            </div>
          </div>

          {/* Các dạng bài tập với chính các từ yêu thích — giống deck */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => startExercise("study")}>
              <Play className="h-4 w-4" /> Ôn
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => startExercise("flashcards")}
            >
              <Layers className="h-4 w-4" /> Flashcard
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => startExercise("quiz")}
            >
              <BookOpen className="h-4 w-4" /> Quiz
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => startExercise("pronounce")}
            >
              <Mic className="h-4 w-4" /> Phát âm
            </Button>
            <div className="ml-auto">
              <ReadAllButton cards={sortedCards} />
            </div>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            {filteredCards.length} từ
          </p>
          {sortBy === "deck" && !selectedDeckId ? (
            <div className="space-y-6 pb-24">
              {groupedByDeck.map((group) => (
                <section key={group.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-sm font-semibold">
                      {group.icon ?? "📘"} {group.name}
                    </h2>
                    <Badge variant="secondary" className="text-[10px]">
                      {group.cards.length}
                    </Badge>
                  </div>
                  <ul className="space-y-2">{group.cards.map(renderCard)}</ul>
                </section>
              ))}
            </div>
          ) : (
            <ul className="space-y-2 pb-24">{sortedCards.map(renderCard)}</ul>
          )}
        </>
      )}
    </div>
  );
}
