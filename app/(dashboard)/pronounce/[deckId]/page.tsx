"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Mic,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCards } from "@/hooks/use-cards";
import { useDeck, useRecordDeckActivity } from "@/hooks/use-decks";
import { PrevWrongBadge } from "@/components/quiz/prev-wrong-badge";
import { useSpeechRecognition, type SpeechResult } from "@/hooks/use-speech-recognition";
import { matchPronunciation } from "@/lib/speech-recognition";
import {
  getPronounceDifficulty,
  thresholdForDifficulty,
} from "@/lib/pronounce-settings";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

type Attempt = "idle" | "correct" | "incorrect";

export default function PronouncePage({ params }: PageProps) {
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
  const { data: allCards, isLoading } = useCards(deckId === "all" ? {} : { deckId });

  const cards = useMemo<Card[]>(() => {
    if (!allCards) return [];
    const live = allCards.filter((c) => !c.deletedAt);
    if (!subsetIds) return live;
    return live.filter((c) => subsetIds.has(c.id));
  }, [allCards, subsetIds]);

  const [pos, setPos] = useState(0);
  const [attempt, setAttempt] = useState<Attempt>("idle");
  const [heard, setHeard] = useState("");
  // Lưu kết quả đúng/sai theo cardId để tính điểm tổng kết.
  const [scores, setScores] = useState<Record<string, boolean>>({});
  // Ngưỡng chấm theo độ khó người dùng chọn trong Cài đặt (đọc sau khi mount).
  const [threshold, setThreshold] = useState<number>(() =>
    thresholdForDifficulty("normal"),
  );
  const recordActivity = useRecordDeckActivity(deckId);
  const recordedRef = useRef(false);
  // Tập thẻ sai của lần gần nhất (từ deck) để đánh dấu "lần trước bạn sai từ này".
  // Dữ liệu ổn định suốt phiên (chỉ đổi sau khi nộp, lúc đó đã ở màn kết quả).
  const prevWrongSet = useMemo(
    () => new Set(deck?.exercises?.find((e) => e.key === "pronounce")?.wrongCardIds ?? []),
    [deck],
  );

  useEffect(() => {
    setThreshold(thresholdForDifficulty(getPronounceDifficulty()));
  }, []);

  const total = cards.length;
  const current = cards[pos];

  const handleResult = useCallback(
    (result: SpeechResult) => {
      if (!current) return;
      setHeard(result.transcript);
      const { matched } = matchPronunciation(
        current.word,
        result.alternatives,
        threshold,
      );
      setAttempt(matched ? "correct" : "incorrect");
      const correct = matched;
      setScores((prev) => {
        // Chỉ ghi nhận lần đúng đầu tiên; không hạ điểm nếu thử lại sai.
        if (prev[current.id]) return prev;
        return { ...prev, [current.id]: correct };
      });
    },
    [current, threshold],
  );

  const { supported, listening, interim, error, start, stop } = useSpeechRecognition({
    lang: "en-US",
    onResult: handleResult,
  });

  const resetAttempt = useCallback(() => {
    setAttempt("idle");
    setHeard("");
  }, []);

  const goNext = useCallback(() => {
    stop();
    resetAttempt();
    setPos((p) => p + 1);
  }, [stop, resetAttempt]);

  const restart = useCallback(() => {
    stop();
    resetAttempt();
    setScores({});
    setPos(0);
    recordedRef.current = false;
  }, [stop, resetAttempt]);

  const retry = useCallback(() => {
    resetAttempt();
    start();
  }, [resetAttempt, start]);

  // Phím tắt: M để thu âm, → để qua từ kế.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (listening) stop();
        else {
          resetAttempt();
          start();
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listening, stop, start, resetAttempt, goNext]);

  const backHref = deckId === "all" ? "/" : `/decks/${deckId}`;
  const correctCount = useMemo(
    () => Object.values(scores).filter(Boolean).length,
    [scores],
  );

  // Ghi nhận hoàn thành dạng "Phát âm" (kèm độ chính xác) khi xem kết quả — chỉ cho deck thật.
  const finished = total > 0 && pos >= total;
  useEffect(() => {
    if (finished && !recordedRef.current && deckId !== "all") {
      recordedRef.current = true;
      // Câu sai = thẻ đã thử nhưng kết quả false (thẻ bỏ qua không tính là sai).
      const wrongCardIds = Object.entries(scores)
        .filter(([, ok]) => !ok)
        .map(([id]) => id);
      recordActivity.mutate({
        activity: "pronounce",
        accuracy: Math.round((correctCount / total) * 100),
        wrongCardIds,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, deckId, correctCount, total]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <h2 className="mb-2 text-2xl font-bold">Chưa có từ nào để luyện</h2>
        <p className="mb-6 text-muted-foreground">
          Hãy thêm từ vào deck rồi quay lại luyện phát âm.
        </p>
        <Link href={backHref}>
          <Button variant="outline" className="rounded-full">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <h2 className="mb-2 text-2xl font-bold">Trình duyệt chưa hỗ trợ</h2>
        <p className="mb-6 text-muted-foreground">
          Tính năng nhận dạng giọng nói cần Chrome hoặc Edge trên máy tính. Safari và
          Firefox hỗ trợ hạn chế.
        </p>
        <Link href={backHref}>
          <Button variant="outline" className="rounded-full">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  // Màn hình tổng kết khi đã đi hết danh sách từ.
  if (pos >= total) {
    const percent = Math.round((correctCount / total) * 100);
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <h2 className="mb-2 text-3xl font-bold">Hoàn thành! 🎉</h2>
        <p className="mb-1 text-muted-foreground">
          Bạn phát âm đúng <strong className="text-primary">{correctCount}</strong> / {total} từ
        </p>
        <p className="mb-6 text-5xl font-bold text-primary">{percent}%</p>
        <div className="flex justify-center gap-3">
          <Button onClick={restart} className="rounded-full">
            <RotateCcw className="h-4 w-4" /> Luyện lại
          </Button>
          <Link href={backHref}>
            <Button variant="outline" className="rounded-full">
              Quay lại deck
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
      {/* Header */}
      <div className="mb-6 w-full">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <Link
            href={backHref}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Thoát
          </Link>
          <span className="text-muted-foreground">
            Đúng {correctCount} / {total}
          </span>
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

      {/* Thẻ từ cần phát âm */}
      <div
        className="flex w-full max-w-xl flex-col items-center rounded-2xl p-10 text-center shadow-[0_24px_64px_rgba(0,13,139,.24)]"
        style={{ background: "#00004F", color: "#eaf0ff" }}
      >
        <div className="eyebrow !text-[#7eb0ff]">Đọc to từ này</div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {current.word}
          </span>
          <button
            type="button"
            onClick={() => speak(current.word)}
            aria-label="Nghe phát âm mẫu"
            className="text-[#7eb0ff] transition-opacity hover:opacity-80"
          >
            <Volume2 className="h-6 w-6" />
          </button>
        </div>
        {current.phonetic || current.partOfSpeech ? (
          <div className="font-phonetic mt-2 text-sm text-white/55">
            {current.phonetic ? current.phonetic : ""}
            {current.phonetic && current.partOfSpeech ? " · " : ""}
            {current.partOfSpeech ?? ""}
          </div>
        ) : null}
        <p className="mt-3 text-sm text-white/55">{current.meaning}</p>

        {prevWrongSet.has(current.id) ? (
          <PrevWrongBadge show className="mt-3" />
        ) : null}

        {/* Khu vực phản hồi */}
        <div className="mt-6 min-h-[64px] w-full">
          {attempt === "correct" ? (
            <div className="flex flex-col items-center gap-1 text-emerald-300">
              <Check className="h-8 w-8" />
              <span className="font-semibold">Chính xác!</span>
            </div>
          ) : attempt === "incorrect" ? (
            <div className="flex flex-col items-center gap-1 text-rose-300">
              <X className="h-8 w-8" />
              <span className="font-semibold">Chưa đúng</span>
              {heard ? (
                <span className="text-sm text-white/55">
                  Nghe được: “{heard}”
                </span>
              ) : null}
            </div>
          ) : listening ? (
            <div className="flex flex-col items-center gap-1 text-[#7eb0ff]">
              <span className="flex items-center gap-2 font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7eb0ff] opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#7eb0ff]" />
                </span>
                Đang nghe...
              </span>
              {interim ? (
                <span className="text-sm text-white/55">“{interim}”</span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-white/40">Nhấn nút micro rồi đọc to từ trên</p>
          )}
        </div>
      </div>

      {error ? (
        <p className="mt-4 max-w-xl text-center text-sm text-destructive">{error}</p>
      ) : null}

      {/* Điều khiển */}
      <div className="mt-8 flex w-full max-w-xl flex-col items-center gap-4">
        {attempt === "idle" ? (
          <Button
            size="lg"
            className="h-16 w-16 rounded-full"
            onClick={listening ? stop : start}
            aria-label={listening ? "Dừng thu âm" : "Bắt đầu thu âm"}
          >
            <Mic className="h-7 w-7" />
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="rounded-full" onClick={retry}>
              <RotateCcw className="h-5 w-5" /> Thử lại
            </Button>
            <Button size="lg" className="rounded-full" onClick={goNext}>
              {pos + 1 >= total ? "Xem kết quả" : "Từ tiếp"}
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={goNext}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Bỏ qua từ này
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Mẹo: nhấn phím <kbd>M</kbd> để thu âm, <kbd>→</kbd> để qua từ kế
      </p>
    </div>
  );
}
