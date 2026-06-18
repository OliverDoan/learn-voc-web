"use client";

import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isFillCorrect, type GrammarExercise } from "@/lib/grammar";

interface GrammarPracticeProps {
  exercises: GrammarExercise[];
  onFinish?: (percent: number) => void;
}

export function GrammarPractice({ exercises, onFinish }: GrammarPracticeProps) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Chủ đề này chưa có bài tập.</p>
    );
  }

  const total = exercises.length;
  const current = exercises[index];

  const reset = () => {
    setIndex(0);
    setAnswered(false);
    setSelected(null);
    setInput("");
    setCorrectCount(0);
    setDone(false);
  };

  const isCurrentCorrect = (): boolean => {
    if (current.type === "mc") return selected === current.answer;
    return isFillCorrect(current, input);
  };

  const handleCheck = () => {
    if (answered) return;
    if (current.type === "mc" && selected === null) return;
    if (current.type === "fill" && input.trim() === "") return;
    setAnswered(true);
    if (isCurrentCorrect()) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      const percent = Math.round((correctCount / total) * 100);
      setDone(true);
      onFinish?.(percent);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setSelected(null);
    setInput("");
  };

  if (done) {
    const percent = Math.round((correctCount / total) * 100);
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Kết quả luyện tập</p>
        <p className="my-2 text-4xl font-bold text-primary">{percent}%</p>
        <p className="text-sm text-muted-foreground">
          Đúng {correctCount}/{total} câu
        </p>
        <Button onClick={reset} className="mt-4">
          <RotateCcw className="h-4 w-4" /> Làm lại
        </Button>
      </div>
    );
  }

  const correct = isCurrentCorrect();

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Câu {index + 1}/{total}
        </span>
        <span>
          Đúng: <strong className="text-primary">{correctCount}</strong>
        </span>
      </div>

      <p className="mb-4 text-base font-medium">{current.prompt}</p>

      {current.type === "mc" ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {current.options.map((opt) => {
            const isPicked = selected === opt;
            const isAnswer = opt === current.answer;
            const showState = answered && (isAnswer || isPicked);
            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => setSelected(opt)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                  !answered && isPicked && "border-primary bg-primary/10",
                  !answered && !isPicked && "hover:border-primary/40",
                  showState && isAnswer && "border-emerald-500 bg-emerald-500/10",
                  showState && !isAnswer && isPicked && "border-rose-500 bg-rose-500/10",
                  answered && !showState && "opacity-60",
                )}
              >
                <span>{opt}</span>
                {showState && isAnswer ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : showState && isPicked ? (
                  <X className="h-4 w-4 text-rose-600" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (answered ? handleNext() : handleCheck());
          }}
          disabled={answered}
          placeholder="Nhập đáp án..."
          className={cn(
            answered && correct && "border-emerald-500",
            answered && !correct && "border-rose-500",
          )}
          autoFocus
        />
      )}

      {answered ? (
        <div
          className={cn(
            "mt-4 rounded-lg p-3 text-sm",
            correct ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
          )}
        >
          <p className="font-semibold">
            {correct ? "Chính xác!" : `Chưa đúng. Đáp án: ${current.answer}`}
          </p>
          <p className="mt-1 text-muted-foreground">{current.explanation}</p>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        {answered ? (
          <Button onClick={handleNext}>
            {index + 1 >= total ? "Xem kết quả" : "Câu tiếp theo"}
          </Button>
        ) : (
          <Button
            onClick={handleCheck}
            disabled={current.type === "mc" ? selected === null : input.trim() === ""}
          >
            Kiểm tra
          </Button>
        )}
      </div>
    </div>
  );
}
