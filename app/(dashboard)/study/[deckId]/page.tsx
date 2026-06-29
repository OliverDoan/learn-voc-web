"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, CheckCircle2, Loader2, Lock, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flashcard } from "@/components/flashcard/flashcard";
import { RatingButtons } from "@/components/flashcard/rating-buttons";
import { useDeck, useRecordDeckActivity } from "@/hooks/use-decks";
import { useStudyQueue, useSubmitReview } from "@/hooks/use-study";
import { previewIntervals } from "@/lib/srs";
import { speak } from "@/lib/tts";
import type { Rating } from "@/lib/constants";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function StudyPage({ params }: PageProps) {
  const { deckId } = use(params);
  const searchParams = useSearchParams();
  const subsetIds = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return undefined;
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [searchParams]);
  const isSubset = !!subsetIds && subsetIds.length > 0;
  // deckId ảo "all" (ôn liên deck) → thoát về dashboard
  const backHref = deckId === "all" ? "/" : `/decks/${deckId}`;

  const { data: queue, isLoading, refetch } = useStudyQueue(deckId, subsetIds);
  // Bỏ qua kiểm tra khóa với ôn liên deck ("all") hoặc ôn tập tập con tự chọn.
  const { data: deck } = useDeck(deckId === "all" || isSubset ? undefined : deckId);
  const submit = useSubmitReview();
  const recordActivity = useRecordDeckActivity(deckId);
  const recordedRef = useRef(false);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [reverse, setReverse] = useState(false);

  const total = queue?.length ?? 0;
  const current = queue?.[index];

  useEffect(() => {
    const stored = localStorage.getItem("voca-study-reverse");
    if (stored === "1") setReverse(true);
  }, []);

  useEffect(() => {
    setStartedAt(Date.now());
  }, [index]);

  useEffect(() => {
    if (current && !flipped && !reverse) {
      const t = setTimeout(() => speak(current.word), 200);
      return () => clearTimeout(t);
    }
  }, [current, flipped, reverse]);

  const toggleReverse = () => {
    setReverse((prev) => {
      const next = !prev;
      localStorage.setItem("voca-study-reverse", next ? "1" : "0");
      return next;
    });
    setFlipped(false);
  };

  const intervals = useMemo(() => {
    if (!current) return null;
    return previewIntervals({
      easeFactor: current.easeFactor,
      interval: current.interval,
      repetitions: current.repetitions,
    });
  }, [current]);

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!current) return;
      const timeTakenMs = Date.now() - startedAt;
      try {
        await submit.mutateAsync({ cardId: current.id, rating, timeTakenMs });
        if (rating >= 3) setCorrect((c) => c + 1);

        if (index + 1 >= total) {
          setDone(true);
          toast.success("Hoàn thành phiên học! 🎉");
        } else {
          setIndex(index + 1);
          setFlipped(false);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Lỗi gửi review");
      }
    },
    [current, index, total, startedAt, submit],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        handleRate(parseInt(e.key, 10) as Rating);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, handleRate, done]);

  // Ghi nhận hoàn thành dạng "Học (SRS)" (kèm độ chính xác) khi xong phiên — chỉ cho deck thật.
  useEffect(() => {
    if (done && !recordedRef.current && deckId !== "all" && total > 0) {
      recordedRef.current = true;
      recordActivity.mutate({ activity: "study", accuracy: Math.round((correct / total) * 100) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, deckId, total, correct]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (deck?.locked) {
    return <LockedScreen backHref={backHref} />;
  }

  if (!queue || queue.length === 0) {
    return <EmptyQueue backHref={backHref} />;
  }

  if (done) {
    return (
      <SessionDone
        backHref={backHref}
        total={total}
        correct={correct}
        onAgain={() => {
          setIndex(0);
          setFlipped(false);
          setCorrect(0);
          setDone(false);
          recordedRef.current = false;
          refetch();
        }}
      />
    );
  }

  if (!current || !intervals) return null;

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
      {isSubset ? (
        <div className="mb-4 flex w-full items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>
            Đang ôn <strong>{total}</strong> từ tự chọn (bỏ qua lịch SRS). Kết quả vẫn cập nhật vào SRS.
          </span>
        </div>
      ) : null}
      <div className="mb-4 w-full">
        <div className="mb-2 flex items-center justify-between text-sm">
          <Link
            href={backHref}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Thoát
          </Link>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={reverse ? "default" : "outline"}
              size="sm"
              onClick={toggleReverse}
              title="Đảo chiều: nhìn nghĩa, nhớ từ"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {reverse ? "Đảo: Việt→Anh" : "Đảo chiều"}
            </Button>
            <span className="text-muted-foreground">
              {index + 1} / {total}
            </span>
          </div>
        </div>
        <Progress value={index + 1} max={total} />
      </div>

      <div className="my-6 flex w-full justify-center">
        <Flashcard
          key={`${current.id}-${reverse ? "r" : "n"}`}
          card={current}
          flipped={flipped}
          reverse={reverse}
          onFlip={() => setFlipped((f) => !f)}
        />
      </div>

      <div className="mt-2 flex w-full justify-center">
        {flipped ? (
          <RatingButtons
            intervals={intervals}
            onRate={handleRate}
            disabled={submit.isPending}
          />
        ) : (
          <Button
            onClick={() => setFlipped(true)}
            size="lg"
            className="rounded-full px-8 shadow-[0_8px_20px_rgba(23,61,201,.28)]"
          >
            Hiện đáp án (Space)
          </Button>
        )}
      </div>
    </div>
  );
}

function LockedScreen({ backHref }: { backHref: string }) {
  return (
    <div className="container mx-auto max-w-xl p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Deck đang khóa</h2>
      <p className="mb-6 text-muted-foreground">
        Hãy hoàn thành (đánh dấu &ldquo;đã học xong&rdquo;) các Unit trước để mở khóa deck này.
      </p>
      <Link href={backHref}>
        <Button variant="outline" className="rounded-full">Quay lại</Button>
      </Link>
    </div>
  );
}

function EmptyQueue({ backHref }: { backHref: string }) {
  return (
    <div className="container mx-auto max-w-xl p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PartyPopper className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Không có từ nào cần ôn!</h2>
      <p className="mb-6 text-muted-foreground">
        Bạn đã ôn hết các từ đến hạn. Hãy thêm từ mới hoặc quay lại sau.
      </p>
      <Link href={backHref}>
        <Button variant="outline" className="rounded-full">Quay lại</Button>
      </Link>
    </div>
  );
}

function SessionDone({
  backHref,
  total,
  correct,
  onAgain,
}: {
  backHref: string;
  total: number;
  correct: number;
  onAgain: () => void;
}) {
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <div className="container mx-auto max-w-xl p-6 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
      <h2 className="mb-2 text-2xl font-bold">Hoàn thành phiên học!</h2>
      <p className="mb-6 text-muted-foreground">Cố lên, mỗi ngày một chút thôi.</p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat label="Đã ôn" value={total.toString()} />
        <Stat label="Đúng" value={`${accuracy}%`} />
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={onAgain} variant="outline" className="rounded-full">
          Tải thêm từ
        </Button>
        <Link href={backHref}>
          <Button className="rounded-full">Xong</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
