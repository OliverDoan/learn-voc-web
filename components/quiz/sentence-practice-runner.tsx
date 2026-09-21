"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SentencePracticeQuiz } from "@/components/quiz/sentence-practice-quiz";
import { PrevWrongBadge } from "@/components/quiz/prev-wrong-badge";
import { PrevWrongPanel } from "@/components/quiz/prev-wrong-panel";
import { usePracticeSentences } from "@/hooks/use-practice-sentences";
import { useRecordDeckActivity } from "@/hooks/use-decks";
import { useSubmitReview } from "@/hooks/use-study";
import { buildPracticeItems, seededShuffle } from "@/lib/practice-sentence";
import { haptic } from "@/lib/haptic";
import { playSound } from "@/lib/sound";

interface SentencePracticeRunnerProps {
  deckId: string;
  /** ID thẻ làm sai ở lần gần nhất của dạng này — để đánh dấu badge. */
  prevWrongIds: string[];
  onExit: () => void;
}

/**
 * Phiên "Luyện viết câu": chạy trên BỘ CÂU LUYỆN (nhiều câu mỗi từ) chứ không
 * phải trên từng thẻ, nên có runner riêng thay vì dùng QuizRunner của trang quiz.
 */
export function SentencePracticeRunner({
  deckId,
  prevWrongIds,
  onExit,
}: SentencePracticeRunnerProps) {
  const { data: cards, isLoading } = usePracticeSentences(deckId);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const submit = useSubmitReview();
  const recordActivity = useRecordDeckActivity(deckId);
  const recordedRef = useRef(false);
  const wrongIdsRef = useRef<Set<string>>(new Set());
  const [prevWrongSet] = useState(() => new Set(prevWrongIds));

  // Seed cố định cho cả phiên: submit review sẽ invalidate query khiến danh sách
  // được dựng lại, nhưng xáo theo seed nên thứ tự câu không đổi giữa chừng.
  const [seed] = useState(() => Math.random());
  const items = useMemo(
    () => seededShuffle(buildPracticeItems(cards ?? []), seed),
    [cards, seed],
  );
  const total = items.length;
  const current = items[index];
  // Mỗi thẻ có nhiều câu luyện — gom về 1 dòng/thẻ cho bảng "Lần trước bạn sai".
  const practiceCards = useMemo(() => {
    const byCard = new Map<string, { id: string; word: string; meaning: string }>();
    for (const item of items) {
      if (!byCard.has(item.cardId)) {
        byCard.set(item.cardId, { id: item.cardId, word: item.word, meaning: item.meaning });
      }
    }
    return [...byCard.values()];
  }, [items]);

  const goNext = () => {
    if (index + 1 >= total) setDone(true);
    else setIndex(index + 1);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (!current) return;
    haptic(isCorrect ? "success" : "fail");
    playSound(isCorrect ? "correct" : "wrong");
    try {
      await submit.mutateAsync({
        cardId: current.cardId,
        rating: isCorrect ? 3 : 1,
        timeTakenMs: 0,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi gửi review");
    }
    if (isCorrect) setCorrect((c) => c + 1);
    else wrongIdsRef.current.add(current.cardId);
    // Không tự nhảy câu: người học tự bấm "Câu tiếp theo" sau khi xem kết quả.
  };

  // Ghi nhận hoàn thành dạng bài khi kết thúc phiên — chỉ cho deck thật.
  useEffect(() => {
    if (done && !recordedRef.current && deckId !== "all" && total > 0) {
      recordedRef.current = true;
      recordActivity.mutate({
        activity: "sentence-practice",
        accuracy: Math.round((correct / total) * 100),
        wrongCardIds: Array.from(wrongIdsRef.current),
        total,
      });
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

  if (total === 0) {
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <p className="mb-4 text-muted-foreground">
          Deck này chưa có bộ câu luyện viết. Chạy <code>pnpm practice:load</code> để nạp
          câu từ <code>prisma/practice-data/</code>.
        </p>
        <Button variant="outline" onClick={onExit}>
          Chọn chế độ khác
        </Button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold">Hoàn thành bài luyện!</h2>
        <p className="mb-6 text-muted-foreground">
          Đúng {correct}/{total} ({pct}%)
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onExit}>
            Chọn chế độ khác
          </Button>
          <Link href={`/decks/${deckId}`}>
            <Button>Về deck</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
      <div className="mb-4 w-full">
        <div className="mb-2 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Thoát
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
              Việt → Anh
            </span>
            <span>
              {index + 1} / {total}
            </span>
          </div>
        </div>
        <Progress value={index + 1} max={total} />
      </div>

      <PrevWrongPanel
        wrongIds={prevWrongIds}
        cards={practiceCards}
        currentCardId={current.cardId}
        className="mb-3"
      />

      {prevWrongSet.has(current.cardId) ? (
        <div className="mb-1 flex w-full justify-center">
          <PrevWrongBadge show />
        </div>
      ) : null}

      <div className="my-6 flex w-full justify-center">
        <SentencePracticeQuiz
          key={current.id}
          item={current}
          onAnswer={(c) => handleAnswer(c)}
          onNext={goNext}
        />
      </div>
    </div>
  );
}
