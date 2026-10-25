"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HanziAudioButton } from "@/components/chinese/hanzi-audio-button";
import {
  CHINESE_QUIZ_PROMPTS,
  buildChineseQuiz,
  type ChineseQuizQuestion,
} from "@/lib/chinese";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/types";

interface ChineseQuizRunnerProps {
  cards: readonly Card[];
  /** Đường dẫn quay lại deck khi làm xong */
  backHref: string;
}

/**
 * Bài trắc nghiệm tiếng Trung: xoay vòng 3 dạng hỏi (Hán → nghĩa, nghĩa → Hán,
 * Hán → pinyin). Trả lời sai thì dừng lại để đọc đáp án, tự bấm "Câu tiếp theo".
 * Kết quả chỉ hiển thị tại chỗ — không ghi vào SRS/thống kê của phần tiếng Anh.
 */
export function ChineseQuizRunner({ cards, backHref }: ChineseQuizRunnerProps) {
  const [round, setRound] = useState(0);
  // Khoá ổn định theo NỘI DUNG thẻ: TanStack Query refetch tạo mảng mới mỗi lần,
  // nếu phụ thuộc identity của mảng thì bộ câu hỏi sẽ bị trộn lại giữa chừng.
  const cardsKey = cards.map((c) => c.id).join(",");
  const questions = useMemo<ChineseQuizQuestion[]>(
    () => buildChineseQuiz(cards),
    // `round` đổi = bấm "Làm lại" → trộn lại bộ câu hỏi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardsKey, round],
  );

  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[pos];
  const finished = pos >= questions.length;

  const handlePick = (option: string) => {
    if (picked !== null || !question) return;
    setPicked(option);
    if (option === question.answer) setCorrectCount((n) => n + 1);
  };

  const handleNext = () => {
    setPicked(null);
    setPos((p) => p + 1);
  };

  const handleRestart = () => {
    setPos(0);
    setPicked(null);
    setCorrectCount(0);
    setRound((r) => r + 1);
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        Deck này chưa đủ dữ liệu để tạo câu hỏi.
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-10 text-center">
        <p className="text-5xl font-bold">{accuracy}%</p>
        <p className="text-sm text-muted-foreground">
          Đúng {correctCount}/{questions.length} câu
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button onClick={handleRestart} className="rounded-full">
            <RotateCcw className="h-4 w-4" /> Làm lại
          </Button>
          <Link
            href={backHref}
            className="inline-flex h-9 items-center justify-center rounded-full border border-input bg-card px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            Về deck
          </Link>
        </div>
      </div>
    );
  }

  const answered = picked !== null;

  return (
    <div className="w-full max-w-xl">
      <div className="mb-4 flex items-center gap-3">
        <Progress value={(pos / questions.length) * 100} className="flex-1" />
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {pos + 1}/{questions.length}
        </span>
      </div>

      <div className="mb-6 flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-md">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          {CHINESE_QUIZ_PROMPTS[question.mode]}
        </p>
        <p
          lang={question.mode === "meaning-to-hanzi" ? undefined : "zh-CN"}
          className={cn(
            "font-semibold",
            question.mode === "meaning-to-hanzi"
              ? "text-2xl"
              : "text-6xl leading-none",
          )}
        >
          {question.prompt}
        </p>
        {question.promptPinyin ? (
          <p className="font-phonetic mt-2 text-sm text-muted-foreground">
            {question.promptPinyin}
          </p>
        ) : null}
        {question.speakText ? (
          <HanziAudioButton text={question.speakText} className="mt-3" />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {question.options.map((option) => {
          const isCorrect = option === question.answer;
          const isPicked = option === picked;
          return (
            <motion.button
              key={option}
              type="button"
              whileHover={{ scale: answered ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={answered}
              onClick={() => handlePick(option)}
              className={cn(
                "relative rounded-lg border bg-card p-4 text-left transition-colors",
                question.mode === "meaning-to-hanzi" ? "text-2xl" : "text-sm",
                !answered && "hover:border-primary",
                answered && isCorrect && "border-green-500 bg-green-500/10",
                answered &&
                  isPicked &&
                  !isCorrect &&
                  "border-red-500 bg-red-500/10",
                answered && !isCorrect && !isPicked && "opacity-50",
              )}
            >
              <span
                lang={
                  question.mode === "meaning-to-hanzi" ? "zh-CN" : undefined
                }
              >
                {option}
              </span>
              {answered && isCorrect ? (
                <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              ) : null}
              {answered && isPicked && !isCorrect ? (
                <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {answered ? (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext} className="rounded-full">
            {pos + 1 === questions.length ? "Xem kết quả" : "Câu tiếp theo"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
