"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flashcard } from "@/components/flashcard/flashcard";
import { useCards } from "@/hooks/use-cards";
import { useDeck, useRecordDeckActivity } from "@/hooks/use-decks";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

// Trộn mảng (Fisher-Yates), trả về mảng mới — không mutate input.
function shuffleArray<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function FlashcardsPage({ params }: PageProps) {
  const { deckId } = use(params);
  const searchParams = useSearchParams();
  const subsetIds = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return undefined;
    return new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }, [searchParams]);

  const { data: deck } = useDeck(deckId === "all" ? "" : deckId);
  const { data: allCards, isLoading } = useCards(
    deckId === "all" ? {} : { deckId },
  );

  // Lọc theo subset (nếu vào từ nút "chọn từ") + bỏ thẻ đã xoá.
  const baseCards = useMemo<Card[]>(() => {
    if (!allCards) return [];
    const live = allCards.filter((c) => !c.deletedAt);
    if (!subsetIds) return live;
    return live.filter((c) => subsetIds.has(c.id));
  }, [allCards, subsetIds]);

  const [order, setOrder] = useState<Card[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Theo dõi đã xem hết thẻ chưa để ghi nhận hoàn thành dạng "Lật thẻ" (không chấm điểm).
  const recordActivity = useRecordDeckActivity(deckId);
  const viewedRef = useRef<Set<number>>(new Set());
  const fcRecordedRef = useRef(false);

  // Khôi phục tuỳ chọn đã lưu.
  useEffect(() => {
    setReverse(localStorage.getItem("voca-fc-reverse") === "1");
    setAutoSpeak(localStorage.getItem("voca-fc-autospeak") !== "0");
  }, []);

  // Khởi tạo / cập nhật thứ tự thẻ khi data sẵn sàng.
  useEffect(() => {
    setOrder(shuffled ? shuffleArray(baseCards) : baseCards);
    setPos(0);
    setFlipped(false);
    viewedRef.current = new Set();
    fcRecordedRef.current = false;
  }, [baseCards, shuffled]);

  const total = order.length;
  const current = order[pos];

  // Đánh dấu vị trí đã xem; khi xem hết 1 lượt thì ghi nhận hoàn thành "Lật thẻ".
  useEffect(() => {
    if (total === 0) return;
    viewedRef.current.add(pos);
    if (viewedRef.current.size >= total && !fcRecordedRef.current && deckId !== "all") {
      fcRecordedRef.current = true;
      recordActivity.mutate({ activity: "flashcards", accuracy: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, total, deckId]);

  // Tự phát âm tiếng Anh khi sang thẻ mới (mặt từ).
  useEffect(() => {
    if (autoSpeak && current && !flipped && !reverse) {
      const t = setTimeout(() => speak(current.word), 200);
      return () => clearTimeout(t);
    }
  }, [current, flipped, reverse, autoSpeak]);

  const goNext = useCallback(() => {
    setFlipped(false);
    setPos((p) => (p + 1) % Math.max(total, 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setPos((p) => (p - 1 + total) % Math.max(total, 1));
  }, [total]);

  const toggleReverse = () => {
    setReverse((prev) => {
      const next = !prev;
      localStorage.setItem("voca-fc-reverse", next ? "1" : "0");
      return next;
    });
    setFlipped(false);
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      localStorage.setItem("voca-fc-autospeak", next ? "1" : "0");
      return next;
    });
  };

  const toggleShuffle = () => setShuffled((prev) => !prev);

  const restart = () => {
    setOrder(shuffled ? shuffleArray(baseCards) : baseCards);
    setPos(0);
    setFlipped(false);
  };

  // Phím tắt: ← → điều hướng, Space/Enter lật.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const backHref = deckId === "all" ? "/" : `/decks/${deckId}`;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (total === 0 || !current) {
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <h2 className="mb-2 text-2xl font-bold">Chưa có từ nào để lật</h2>
        <p className="mb-6 text-muted-foreground">
          Hãy thêm từ vào deck rồi quay lại học flashcard.
        </p>
        <Link href={backHref}>
          <Button variant="outline" className="rounded-full">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
      {/* Header */}
      <div className="mb-4 w-full">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <Link
            href={backHref}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Thoát
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant={shuffled ? "default" : "outline"}
              size="sm"
              onClick={toggleShuffle}
              title="Xáo trộn thứ tự thẻ"
            >
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Xáo trộn</span>
            </Button>
            <Button
              type="button"
              variant={reverse ? "default" : "outline"}
              size="sm"
              onClick={toggleReverse}
              title="Đảo chiều: nhìn nghĩa, nhớ từ"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">{reverse ? "Việt→Anh" : "Đảo chiều"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleAutoSpeak}
              title={autoSpeak ? "Tắt tự phát âm" : "Bật tự phát âm"}
              aria-label="Tự phát âm"
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pos + 1} max={total} />
          <span className="shrink-0 text-sm text-muted-foreground">
            {pos + 1} / {total}
          </span>
        </div>
        {deck?.name ? (
          <p className="mt-1 text-xs text-muted-foreground">{deck.name}</p>
        ) : null}
      </div>

      {/* Thẻ */}
      <div className="my-6 flex w-full justify-center">
        <Flashcard
          key={`${current.id}-${reverse ? "r" : "n"}`}
          card={current}
          flipped={flipped}
          reverse={reverse}
          onFlip={() => setFlipped((f) => !f)}
        />
      </div>

      {/* Điều hướng */}
      <div className="flex w-full max-w-xl items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full"
          onClick={goPrev}
          aria-label="Thẻ trước"
        >
          <ChevronLeft className="h-5 w-5" /> Trước
        </Button>

        <Button variant="ghost" size="sm" onClick={restart} title="Học lại từ đầu">
          <RotateCcw className="h-4 w-4" /> Lại
        </Button>

        <Button
          size="lg"
          className="rounded-full"
          onClick={goNext}
          aria-label="Thẻ tiếp theo"
        >
          Tiếp <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Mẹo: dùng phím ← → để chuyển thẻ, Space để lật
      </p>
    </div>
  );
}
