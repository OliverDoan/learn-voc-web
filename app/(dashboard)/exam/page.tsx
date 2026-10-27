"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CheckSquare, ClipboardCheck, Lock, Play, Shuffle, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { CardsTest } from "@/components/deck/cards-test";
import { useCards } from "@/hooks/use-cards";
import { useDecks } from "@/hooks/use-decks";
import { cn } from "@/lib/utils";
import {
  EXAM_COUNT_PRESETS,
  EXAM_HISTORY_KEY,
  EXAM_MAX_COUNT,
  sampleExamCards,
  sortDecksByUnit,
} from "@/lib/exam";
import type { Card } from "@/lib/types";

export default function ExamPage() {
  const { data: rawDecks, isLoading } = useDecks("en");
  // API trả Unit mới nhất trước → hiển thị lại theo thứ tự Unit 1 → 50.
  const decks = useMemo(() => sortDecksByUnit(rawDecks ?? []), [rawDecks]);
  // Thẻ của mọi Unit đang mở (API tự bỏ Unit khoá + deck tiếng Trung).
  const { data: allCards, isLoading: cardsLoading } = useCards();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  // null = lấy tất cả từ của các Unit đã chọn.
  const [count, setCount] = useState<number | null>(20);
  // Bộ từ đang kiểm tra (null = đang ở bước chọn Unit). Random lúc bấm Bắt đầu rồi
  // giữ nguyên, để refetch danh sách thẻ không làm đổi bộ từ giữa chừng.
  const [examCards, setExamCards] = useState<Card[] | null>(null);
  // Đổi key để CardsTest mount lại (xoá đáp án) khi random bộ mới.
  const [round, setRound] = useState(0);

  // Unit đang khoá thì không lấy được thẻ (API ẩn thẻ deck khoá) → không cho chọn.
  const openDecks = useMemo(() => decks.filter((d) => !d.locked), [decks]);
  const totalSelectedCards = useMemo(
    () =>
      openDecks.filter((d) => selected.has(d.id)).reduce((sum, d) => sum + d._count.cards, 0),
    [openDecks, selected],
  );
  const effectiveCount = count === null ? totalSelectedCards : Math.min(count, totalSelectedCards);

  const toggleDeck = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const allSelected = openDecks.length > 0 && openDecks.every((d) => selected.has(d.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(openDecks.map((d) => d.id)));

  const handleCountInput = (raw: string) => {
    const n = Number.parseInt(raw, 10);
    setCount(Number.isNaN(n) || n < 1 ? 1 : Math.min(n, EXAM_MAX_COUNT));
  };

  const start = () => {
    if (selected.size === 0) {
      toast.error("Hãy chọn ít nhất 1 Unit");
      return;
    }
    if (totalSelectedCards === 0) {
      toast.error("Các Unit đã chọn chưa có từ nào");
      return;
    }
    const ids = openDecks.filter((d) => selected.has(d.id)).map((d) => d.id);
    const picked = sampleExamCards(allCards ?? [], ids, count);
    if (picked.length === 0) {
      toast.error("Không tải được từ của các Unit đã chọn");
      return;
    }
    setExamCards(picked);
    setRound((r) => r + 1);
  };

  if (examCards) {
    return (
      <div className="container mx-auto max-w-4xl px-6 pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExamCards(null)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Chọn lại Unit
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {examCards.length} từ ngẫu nhiên · {selected.size} Unit
            </span>
            <Button size="sm" variant="outline" className="rounded-full" onClick={start}>
              <Shuffle className="h-4 w-4" /> Random bộ khác
            </Button>
          </div>
        </div>
        <CardsTest key={round} cards={examCards} deckId={EXAM_HISTORY_KEY} />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-primary/[0.08] text-primary">
          <ClipboardCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Kiểm tra</h1>
          <p className="text-sm text-muted-foreground">
            Chọn các Unit và số từ — từ được lấy ngẫu nhiên. Xem nghĩa tiếng Việt, gõ từ tiếng Anh + từ loại.
          </p>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border bg-card p-5">
        <h2 className="mb-3 font-semibold">Số lượng từ</h2>
        <div className="flex flex-wrap items-center gap-2">
          {EXAM_COUNT_PRESETS.map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={count === n ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setCount(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={count === null ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCount(null)}
          >
            Tất cả
          </Button>
          <div className="ml-1 flex items-center gap-2 text-sm text-muted-foreground">
            hoặc
            <Input
              type="number"
              min={1}
              max={EXAM_MAX_COUNT}
              value={count ?? ""}
              placeholder="Tất cả"
              onChange={(e) => handleCountInput(e.target.value)}
              className="h-9 w-24"
              aria-label="Số lượng từ tuỳ chọn"
            />
            từ
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">
            Chọn Unit{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({selected.size} Unit · {totalSelectedCards} từ)
            </span>
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={toggleAll} disabled={!openDecks.length}>
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
        </div>
        {isLoading ? (
          <ListSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((d) => {
              const checked = selected.has(d.id);
              const Icon = d.locked ? Lock : checked ? CheckSquare : Square;
              return (
                <button
                  key={d.id}
                  type="button"
                  disabled={d.locked}
                  onClick={() => toggleDeck(d.id)}
                  aria-pressed={checked}
                  title={d.locked ? "Unit đang khoá — hoàn thành các Unit trước để mở" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-[1.5px] px-3 py-2.5 text-left text-sm transition-colors",
                    checked ? "border-primary bg-primary/5" : "hover:border-primary/50",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", checked ? "text-primary" : "text-muted-foreground")} />
                  <span className="min-w-0 flex-1 truncate font-medium">{d.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{d._count.cards}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="sticky bottom-0 z-20 -mx-6 mt-6 border-t bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <span className="text-sm text-muted-foreground">
            {selected.size === 0
              ? "Chưa chọn Unit nào"
              : `Sẽ kiểm tra ${effectiveCount} từ ngẫu nhiên`}
          </span>
          <Button onClick={start} disabled={effectiveCount === 0 || cardsLoading}>
            <Play className="h-4 w-4" /> Bắt đầu
          </Button>
        </div>
      </div>
    </div>
  );
}
