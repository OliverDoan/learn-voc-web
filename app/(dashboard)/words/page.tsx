"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Layers,
  Library,
  Loader2,
  Mic,
  Play,
  Star,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MultiSelectMenu } from "@/components/ui/multi-select-menu";
import type { SelectOption } from "@/components/ui/select-menu";
import { CardDetailDialog } from "@/components/deck/card-detail-dialog";
import { DialectBadge } from "@/components/deck/dialect-badge";
import { useAllWords, useToggleFavorite } from "@/hooks/use-cards";
import { speak } from "@/lib/tts";
import { cardPosCategories, cn, POS_FILTERS, type PosKey } from "@/lib/utils";
import type { CardWithDeck } from "@/hooks/use-cards";

/** Thông tin deck rút gọn để hiển thị nút lọc. */
interface DeckFilterOption {
  id: string;
  name: string;
  icon: string | null;
  count: number;
}

export default function AllWordsPage() {
  const router = useRouter();
  const { data: cards, isLoading } = useAllWords();
  const toggleFavoriteMut = useToggleFavorite();

  const [search, setSearch] = useState("");
  // Lọc theo deck (đa chọn). Rỗng = tất cả deck.
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([]);
  // Lọc theo từ loại (đa chọn). Rỗng = không lọc.
  const [selectedPos, setSelectedPos] = useState<PosKey[]>([]);
  // Lọc theo chữ cái đầu. null = không lọc.
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  // Thẻ đang xem chi tiết (mở dialog).
  const [detailCard, setDetailCard] = useState<CardWithDeck | undefined>(undefined);

  // Chữ cái đầu của 1 từ: A–Z, còn lại gom vào "#".
  const firstLetter = (word: string): string => {
    const ch = word.trim()[0]?.toUpperCase() ?? "";
    return ch >= "A" && ch <= "Z" ? ch : "#";
  };

  // Các chữ cái thực sự có trong dữ liệu (đã sắp xếp).
  const availableLetters = useMemo<string[]>(() => {
    if (!cards) return [];
    const set = new Set<string>();
    for (const c of cards) set.add(firstLetter(c.word));
    return Array.from(set).sort();
  }, [cards]);

  const togglePos = (pos: PosKey) =>
    setSelectedPos((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );

  // Các nhóm từ loại thực sự có trong dữ liệu (giữ thứ tự chuẩn của POS_FILTERS).
  const availablePos = useMemo<PosKey[]>(() => {
    if (!cards) return [];
    const set = new Set<PosKey>();
    for (const c of cards) {
      for (const k of cardPosCategories(c.partOfSpeech)) set.add(k);
    }
    return POS_FILTERS.map((p) => p.key).filter((k) => set.has(k));
  }, [cards]);

  // Danh sách deck có trong toàn bộ từ, kèm số lượng từ mỗi deck.
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
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }, [cards]);

  // Tuỳ chọn cho dropdown lọc deck (đa chọn).
  const deckSelectOptions = useMemo<SelectOption[]>(
    () =>
      deckOptions.map((deck) => ({
        value: deck.id,
        label: deck.name,
        icon: deck.icon ?? "📘",
        count: deck.count,
      })),
    [deckOptions],
  );

  const filteredCards = useMemo<CardWithDeck[]>(() => {
    if (!cards) return [];
    const q = search.trim().toLowerCase();
    return cards.filter((card) => {
      if (selectedDeckIds.length > 0 && !selectedDeckIds.includes(card.deck.id))
        return false;
      if (selectedLetter && firstLetter(card.word) !== selectedLetter) return false;
      if (selectedPos.length > 0) {
        const cats = cardPosCategories(card.partOfSpeech);
        if (!selectedPos.some((p) => cats.includes(p))) return false;
      }
      if (!q) return true;
      return (
        card.word.toLowerCase().includes(q) ||
        card.meaning.toLowerCase().includes(q)
      );
    });
  }, [cards, selectedDeckIds, selectedLetter, selectedPos, search]);

  // Bắt đầu một dạng bài tập với chính các từ đang hiển thị (theo bộ lọc).
  // Dùng deckId ảo "all" + danh sách ids để học liên deck.
  const startExercise = (kind: "study" | "flashcards" | "quiz" | "pronounce") => {
    const ids = filteredCards.map((c) => c.id).join(",");
    if (!ids) {
      toast.error("Không có từ nào để luyện tập");
      return;
    }
    router.push(`/${kind}/all?ids=${encodeURIComponent(ids)}`);
  };

  const handleToggleFavorite = async (card: CardWithDeck) => {
    try {
      await toggleFavoriteMut.mutateAsync({
        cardId: card.id,
        favorite: !card.favorite,
      });
      toast.success(card.favorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Library className="h-6 w-6 text-primary" /> Tất cả từ
        </h1>
        <p className="text-sm text-muted-foreground">
          Tổng hợp toàn bộ từ vựng từ mọi deck — tìm kiếm, lọc theo deck và luyện tập.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !cards || cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Library className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Chưa có từ nào</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Hãy thêm từ vào các deck của bạn, chúng sẽ xuất hiện ở đây.
          </p>
          <Link href="/decks" className="mt-4">
            <Button variant="outline">Tới Decks</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Bộ lọc: tìm kiếm + chọn deck (đa chọn, dropdown có checkbox) */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm từ hoặc nghĩa..."
              className="max-w-xs flex-1"
            />
            {deckOptions.length > 1 ? (
              <MultiSelectMenu
                id="deck-filter"
                values={selectedDeckIds}
                onChange={setSelectedDeckIds}
                options={deckSelectOptions}
                placeholder="Tất cả deck"
                summaryLabel={(n) => `${n} deck đã chọn`}
                className="max-w-xs flex-1"
              />
            ) : null}
          </div>

          {/* Lọc theo từ loại (đa chọn) — chỉ hiện các nhóm có trong dữ liệu */}
          {availablePos.length > 0 ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {POS_FILTERS.filter((p) => availablePos.includes(p.key)).map((p) => {
                const active = selectedPos.includes(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePos(p.key)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
              {selectedPos.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedPos([])}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Xoá lọc
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Lọc theo chữ cái đầu — chỉ hiện các chữ có trong dữ liệu */}
          {availableLetters.length > 1 ? (
            <div className="mb-4 flex flex-wrap gap-1">
              {availableLetters.map((letter) => {
                const active = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setSelectedLetter(active ? null : letter)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
              {selectedLetter ? (
                <button
                  type="button"
                  onClick={() => setSelectedLetter(null)}
                  className="ml-1 self-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Xoá lọc
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Các dạng bài tập với chính các từ đang hiển thị */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => startExercise("study")}>
              <Play className="h-4 w-4" /> Ôn
            </Button>
            <Button size="sm" variant="outline" onClick={() => startExercise("flashcards")}>
              <Layers className="h-4 w-4" /> Flashcard
            </Button>
            <Button size="sm" variant="outline" onClick={() => startExercise("quiz")}>
              <BookOpen className="h-4 w-4" /> Quiz
            </Button>
            <Button size="sm" variant="outline" onClick={() => startExercise("pronounce")}>
              <Mic className="h-4 w-4" /> Phát âm
            </Button>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            {filteredCards.length} / {cards.length} từ
          </p>

          {filteredCards.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
              Không có từ nào khớp bộ lọc.
            </div>
          ) : (
            <ul className="space-y-2 pb-24">
              {filteredCards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 shrink-0"
                    onClick={() => speak(card.word)}
                    aria-label="Phát âm"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => setDetailCard(card)}
                    className="min-w-0 flex-1 text-left"
                    title="Xem chi tiết"
                  >
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
                      <DialectBadge dialect={card.dialect} variantWord={card.variantWord} />
                    </div>
                    <p className="mt-1 text-sm">{card.meaning}</p>
                    {card.example ? (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        &ldquo;{card.example}&rdquo;
                      </p>
                    ) : null}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 shrink-0"
                    onClick={() => handleToggleFavorite(card)}
                    aria-label={card.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                    title={card.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                  >
                    <Star
                      className={
                        card.favorite
                          ? "h-4 w-4 fill-amber-400 text-amber-400"
                          : "h-4 w-4 text-muted-foreground"
                      }
                    />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <CardDetailDialog
        open={!!detailCard}
        onOpenChange={(o) => !o && setDetailCard(undefined)}
        card={detailCard}
      />
    </div>
  );
}
