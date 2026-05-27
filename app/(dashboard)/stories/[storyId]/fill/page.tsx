"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStory } from "@/hooks/use-stories";
import { parseStory, type StoryToken } from "@/lib/story-parser";
import { levenshtein, cn } from "@/lib/utils";

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
  const { data: story, isLoading } = useStory(storyId);

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

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!story) return <div className="p-6">Không tìm thấy truyện</div>;

  const allFilled = slots.every((s) => (answers[s.index] ?? "").trim().length > 0);
  const correctCount = slots.filter((s) => {
    const ans = (answers[s.index] ?? "").trim().toLowerCase();
    return levenshtein(ans, s.word.toLowerCase()) <= 1;
  }).length;

  const handleSubmit = () => {
    if (!allFilled) {
      toast.error("Hãy điền hết các ô trống");
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-24">
      <Link
        href={`/stories/${storyId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Về truyện
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Điền từ chêm</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Điền lại các từ tiếng Anh đã chêm vào nội dung truyện.
      </p>

      <article className="mb-6 rounded-xl border bg-card p-6 text-lg leading-loose whitespace-pre-wrap">
        {tokens.map((tok, i) => {
          if (tok.type === "text") return <span key={i}>{tok.text}</span>;
          const value = answers[i] ?? "";
          const correct =
            submitted && levenshtein(value.trim().toLowerCase(), tok.word.toLowerCase()) <= 1;
          const wrong = submitted && !correct;
          return (
            <span key={i} className="inline-flex flex-col">
              <input
                value={value}
                disabled={submitted}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder={tok.meaning}
                className={cn(
                  "mx-1 w-32 rounded-md border bg-background px-2 py-0.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring",
                  correct && "border-green-500 bg-green-500/10 text-green-500",
                  wrong && "border-red-500 bg-red-500/10",
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
          storyId={storyId}
        />
      ) : (
        <Button onClick={handleSubmit} className="w-full" size="lg">
          Kiểm tra
        </Button>
      )}
    </div>
  );
}

function ResultPanel({
  correct,
  total,
  onReset,
  storyId,
}: {
  correct: number;
  total: number;
  onReset: () => void;
  storyId: string;
}) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const passed = pct >= 70;
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
        {passed ? "Xuất sắc! Tiếp tục giữ phong độ 🔥" : "Cố lên, thử lại nhé 💪"}
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onReset}>
          Làm lại
        </Button>
        <Link href={`/stories/${storyId}`}>
          <Button>
            <Check className="h-4 w-4" /> Về truyện
          </Button>
        </Link>
      </div>
    </div>
  );
}
