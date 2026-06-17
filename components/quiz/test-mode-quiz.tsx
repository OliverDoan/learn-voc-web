"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CheckCircle2, Volume2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSubmitReview } from "@/hooks/use-study";
import { haptic } from "@/lib/haptic";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/types";

type QuizDirection = "word-to-meaning" | "meaning-to-word";

interface TestModeQuizProps {
  cards: Card[];
  allCards: Card[];
  deckId: string;
  direction: QuizDirection;
  reverseActive: boolean;
  onExit: () => void;
}

interface AnswerRecord {
  pickedId: string;
  correct: boolean;
}

// Trộn mảng — trả về bản sao, không mutate.
function shuffle<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function TestModeQuiz({
  cards,
  allCards,
  deckId,
  direction,
  reverseActive,
  onExit,
}: TestModeQuizProps) {
  const submit = useSubmitReview();

  // Đóng băng danh sách câu hỏi + đáp án khi vào phiên (tránh refetch xáo trộn giữa chừng).
  const [questions] = useState(() => cards);
  const [optionsByCard] = useState(() => {
    const map = new Map<string, Card[]>();
    for (const q of questions) {
      const distractors = shuffle(allCards.filter((c) => c.id !== q.id)).slice(0, 3);
      map.set(q.id, shuffle([q, ...distractors]));
    }
    return map;
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, AnswerRecord>>(() => new Map());
  const [done, setDone] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const answeredCount = answers.size;

  const handlePick = async (pickedId: string) => {
    if (!current || answers.has(current.id)) return;
    const correct = pickedId === current.id;
    haptic(correct ? "success" : "fail");

    const nextAnswers = new Map(answers);
    nextAnswers.set(current.id, { pickedId, correct });
    setAnswers(nextAnswers);

    try {
      await submit.mutateAsync({ cardId: current.id, rating: correct ? 3 : 1, timeTakenMs: 0 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi gửi review");
    }
    // Ở lại câu hiện tại — người dùng tự chọn câu khác trong lưới bên trái.
  };

  const correctCount = useMemo(
    () => Array.from(answers.values()).filter((a) => a.correct).length,
    [answers],
  );

  if (!current) return null;

  if (done) {
    const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold">Hoàn thành bài làm!</h2>
        <p className="mb-6 text-muted-foreground">
          Đúng {correctCount}/{total} ({pct}%)
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

  const answer = answers.get(current.id);
  const options = optionsByCard.get(current.id) ?? [];
  const promptText = direction === "word-to-meaning" ? current.word : current.meaning;
  const promptHint = direction === "word-to-meaning" ? current.phonetic : null;

  return (
    <div className="container mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Thoát
        </button>
        <div className="flex items-center gap-2 text-muted-foreground">
          {reverseActive ? (
            <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
              Việt → Anh
            </span>
          ) : null}
          <span>
            Đã làm {answeredCount} / {total}
          </span>
        </div>
      </div>
      <Progress value={answeredCount} max={total} />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Cột trái: lưới câu hỏi */}
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-60 lg:shrink-0 lg:self-start lg:overflow-y-auto">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Danh sách câu
          </h3>
          <div className="grid grid-cols-8 gap-2 sm:grid-cols-10 lg:grid-cols-5">
            {questions.map((q, i) => {
              const a = answers.get(q.id);
              const isCurrent = i === index;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Câu ${i + 1}`}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                    !a && "bg-card text-foreground hover:border-primary",
                    a?.correct && "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400",
                    a && !a.correct && "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400",
                    isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded border bg-card" /> Chưa làm
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded border border-green-500 bg-green-500/15" />{" "}
              Đúng
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded border border-red-500 bg-red-500/15" /> Sai
            </span>
          </div>

          {answeredCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setDone(true)}
            >
              Nộp bài & xem kết quả
            </Button>
          ) : null}
        </aside>

        {/* Cột phải: câu hỏi hiện tại */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Câu {index + 1}
          </div>
          <div className="mb-6 flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-md">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              {direction === "word-to-meaning" ? "Nghĩa của từ này?" : "Từ nào nghĩa là?"}
            </p>
            <p className="text-3xl font-bold">{promptText}</p>
            {promptHint ? (
              <p className="font-phonetic mt-1 text-sm text-muted-foreground">{promptHint}</p>
            ) : null}
            {direction === "word-to-meaning" ? (
              <Button
                variant="outline"
                size="icon"
                className="mt-3"
                onClick={() => speak(current.word)}
                aria-label="Phát âm"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {options.map((opt) => {
              const isCorrect = opt.id === current.id;
              const isPicked = opt.id === answer?.pickedId;
              const showResult = answer !== undefined;
              return (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                  disabled={showResult}
                  onClick={() => handlePick(opt.id)}
                  className={cn(
                    "relative rounded-lg border bg-card p-4 text-left text-sm transition-colors",
                    !showResult && "hover:border-primary",
                    showResult && isCorrect && "border-green-500 bg-green-500/10",
                    showResult && isPicked && !isCorrect && "border-red-500 bg-red-500/10",
                    showResult && !isCorrect && !isPicked && "opacity-50",
                  )}
                >
                  {direction === "word-to-meaning" ? opt.meaning : opt.word}
                  {showResult && isCorrect ? (
                    <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  ) : null}
                  {showResult && isPicked && !isCorrect ? (
                    <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
