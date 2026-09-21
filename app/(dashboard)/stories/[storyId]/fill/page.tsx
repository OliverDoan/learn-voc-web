"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, Lightbulb, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRecordDeckActivity } from "@/hooks/use-decks";
import { useStory, isStoryLockedError } from "@/hooks/use-stories";
import { DeckLockedScreen } from "@/components/deck/deck-locked-screen";
import { EXERCISE_PASS_ACCURACY } from "@/lib/deck-activities";
import { parseStory, type StoryToken } from "@/lib/story-parser";
import { cn } from "@/lib/utils";
import { countFilled, fillSlotState, isFillAnswerCorrect } from "@/lib/story-fill";

interface PageProps {
  params: Promise<{ storyId: string }>;
}

interface Slot {
  index: number;
  word: string;
  meaning: string;
}

export default function FillBlankPage({ params }: PageProps) {
  const { storyId } = use(params);
  const searchParams = useSearchParams();
  const { data: story, isLoading, error } = useStory(storyId);
  const recordActivity = useRecordDeckActivity(story?.deckId ?? "");

  // Vào bài từ mục bài tập của deck (`?from=deck`) → làm xong quay lại deck để
  // làm dạng bài khác. Vào từ trang truyện thì vẫn quay về chính truyện đó.
  const fromDeck = searchParams.get("from") === "deck";

  const tokens: StoryToken[] = useMemo(
    () => (story ? parseStory(story.content) : []),
    [story],
  );

  const slots = useMemo<Slot[]>(
    () =>
      tokens
        .map((t, i) => (t.type === "word" ? { index: i, word: t.word, meaning: t.meaning } : null))
        .filter((x): x is Slot => x !== null),
    [tokens],
  );

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  /** Hiện nghĩa tiếng Việt trong ô trống làm gợi ý (tắt đi để tự thử thách). */
  const [showMeaning, setShowMeaning] = useState(true);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isStoryLockedError(error)) {
    return (
      <DeckLockedScreen
        backHref="/stories"
        backLabel="Về danh sách truyện"
        description="Truyện này thuộc Unit đang khóa. Hãy hoàn thành các Unit trước để mở khóa."
      />
    );
  }
  if (!story) return <div className="p-6">Không tìm thấy truyện</div>;

  const filledCount = countFilled(slots.map((s) => answers[s.index] ?? ""));
  const allFilled = filledCount === slots.length;
  const isSlotCorrect = (s: Slot) => isFillAnswerCorrect(answers[s.index] ?? "", s.word);
  const correctCount = slots.filter(isSlotCorrect).length;

  const handleSubmit = () => {
    if (!allFilled) {
      toast.error("Hãy điền hết các ô trống");
      return;
    }
    setSubmitted(true);

    // Ghi điểm vào tiến độ bài tập của deck (best accuracy + lịch sử lượt làm).
    // Từ sai → map sang ID thẻ tương ứng (nếu truyện có link thẻ) để ôn lại.
    const cardIdByWord = new Map(
      story.storyCards.map((sc) => [sc.card.word.trim().toLowerCase(), sc.cardId] as const),
    );
    const wrongCardIds = slots
      .filter((s) => !isSlotCorrect(s))
      .map((s) => cardIdByWord.get(s.word.trim().toLowerCase()))
      .filter((id): id is string => Boolean(id));
    const accuracy = slots.length === 0 ? 0 : Math.round((correctCount / slots.length) * 100);
    recordActivity.mutate(
      { activity: "story-fill", accuracy, wrongCardIds, total: slots.length },
      { onError: () => toast.error("Không ghi được điểm, thử lại sau") },
    );
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const backHref = fromDeck ? `/decks/${story.deckId}` : `/stories/${storyId}`;
  const backLabel = fromDeck ? "Quay lại deck" : "Về truyện";

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-24">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="mb-2 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">Điền từ chêm</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMeaning((prev) => !prev)}
          aria-pressed={showMeaning}
          aria-label={showMeaning ? "Ẩn nghĩa tiếng Việt" : "Hiện nghĩa tiếng Việt"}
          title={showMeaning ? "Ẩn nghĩa tiếng Việt" : "Hiện nghĩa tiếng Việt"}
          className={cn("shrink-0", showMeaning && "border-amber-500 text-amber-500")}
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Điền lại các từ tiếng Anh đã chêm vào nội dung truyện.
        {showMeaning ? "" : " (Đang ẩn nghĩa tiếng Việt)"}
      </p>

      <article className="mb-6 rounded-xl border bg-card p-6 text-lg leading-loose whitespace-pre-wrap">
        {tokens.map((tok, i) => {
          if (tok.type === "text") return <span key={i}>{tok.text}</span>;
          const value = answers[i] ?? "";
          const state = fillSlotState({ value, word: tok.word, submitted });
          const wrong = state === "wrong";
          return (
            <span key={i} className="inline-flex flex-col">
              <input
                value={value}
                disabled={submitted}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder={showMeaning ? tok.meaning : "?"}
                aria-label={`Ô trống${state === "empty" ? " (chưa điền)" : ""}`}
                className={cn(
                  "mx-1 w-32 rounded-md border px-2 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                  // Chưa nộp: nền vàng nhạt + viền đứt = còn trống, nền xanh = đã điền.
                  state === "empty" && "border-dashed border-amber-500/60 bg-amber-500/10",
                  state === "filled" && "border-primary/50 bg-primary/10",
                  state === "correct" && "border-green-500 bg-green-500/10 text-green-500",
                  state === "wrong" && "border-red-500 bg-red-500/10",
                )}
              />
              {wrong ? (
                <span className="ml-1 text-xs text-red-500">→ {tok.word}</span>
              ) : null}
            </span>
          );
        })}
      </article>

      {submitted ? (
        <ResultPanel
          correct={correctCount}
          total={slots.length}
          onReset={handleReset}
          doneHref={backHref}
          doneLabel={fromDeck ? "Về deck" : "Về truyện"}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Đã điền{" "}
            <strong className={cn(allFilled ? "text-primary" : "text-amber-500")}>
              {filledCount}/{slots.length}
            </strong>{" "}
            ô{allFilled ? "" : " — ô còn trống có nền vàng"}
          </p>
          <Button onClick={handleSubmit} className="w-full" size="lg">
            Kiểm tra
          </Button>
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  correct,
  total,
  onReset,
  doneHref,
  doneLabel,
}: {
  correct: number;
  total: number;
  onReset: () => void;
  doneHref: string;
  doneLabel: string;
}) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const passed = pct >= EXERCISE_PASS_ACCURACY;
  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      {passed ? (
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
      ) : (
        <X className="mx-auto mb-3 h-12 w-12 text-red-500" />
      )}
      <p className="mb-1 text-xl font-bold">
        {correct} / {total} đúng ({pct}%)
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        {passed
          ? "Xuất sắc! Điểm đã được tính vào tiến độ bài tập 🔥"
          : `Cần đạt ≥ ${EXERCISE_PASS_ACCURACY}% để tính hoàn thành dạng này, thử lại nhé 💪`}
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onReset}>
          Làm lại
        </Button>
        <Link href={doneHref}>
          <Button>
            <Check className="h-4 w-4" /> {doneLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
