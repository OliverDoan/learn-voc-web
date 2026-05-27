"use client";

import { useState } from "react";
import { Check, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, levenshtein } from "@/lib/utils";
import type { Card } from "@/lib/types";

type QuizDirection = "word-to-meaning" | "meaning-to-word";

interface TypingQuizProps {
  question: Card;
  direction?: QuizDirection;
  onAnswer: (correct: boolean, attempt: string) => void;
}

export function TypingQuiz({
  question,
  direction = "meaning-to-word",
  onAnswer,
}: TypingQuizProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const isReverse = direction === "word-to-meaning";
  const promptText = isReverse ? question.word : question.meaning;
  const target = isReverse ? question.meaning : question.word;
  const promptLabel = isReverse ? "Gõ nghĩa tiếng Việt" : "Gõ từ tiếng Anh";
  const placeholder = isReverse
    ? "Gõ nghĩa tiếng Việt rồi nhấn Enter..."
    : "Gõ từ rồi nhấn Enter...";

  const maxHints = Math.max(1, target.length - 1);
  const tolerance = isReverse ? Math.max(2, Math.floor(target.length * 0.25)) : 2;

  const showHint = hintLevel > 0;
  const hintText = showHint
    ? target
        .split("")
        .map((ch, i) => (i < hintLevel || ch === " " ? ch : "_"))
        .join("")
    : "";

  const revealHint = () => {
    if (submitted) return;
    if (hintLevel >= maxHints) return;
    setHintLevel((h) => h + 1);
  };

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    const distance = levenshtein(value.trim().toLowerCase(), target.toLowerCase());
    const correct = distance <= tolerance;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct, value.trim());
  };

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 rounded-2xl border bg-card p-8 text-center shadow-md">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          {promptLabel}
        </p>
        <p className="text-2xl font-semibold">{promptText}</p>
        {isReverse && question.phonetic ? (
          <p className="font-phonetic mt-1 text-sm text-muted-foreground">
            {question.phonetic}
          </p>
        ) : null}
        {showHint ? (
          <p className="font-phonetic mt-3 text-xl tracking-[0.3em] text-primary">
            {hintText}
          </p>
        ) : null}
      </div>

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder={placeholder}
        disabled={submitted}
        className={cn(
          "h-12 text-lg",
          submitted && isCorrect && "border-green-500 bg-green-500/10",
          submitted && !isCorrect && "border-red-500 bg-red-500/10",
        )}
        autoFocus
      />

      {submitted ? (
        <div className="mt-3 flex items-center justify-between rounded-md border bg-muted/30 p-3 text-sm">
          {isCorrect ? (
            <span className="flex items-center gap-2 text-green-500">
              <Check className="h-4 w-4" /> Chính xác!
              {showHint ? (
                <Badge variant="warning" className="ml-1 text-[10px]">
                  có gợi ý
                </Badge>
              ) : null}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-red-500">
              <X className="h-4 w-4" /> Đáp án đúng: <strong>{target}</strong>
            </span>
          )}
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={revealHint}
            disabled={hintLevel >= maxHints}
            title={
              hintLevel >= maxHints
                ? "Đã dùng hết gợi ý"
                : `Hiện ${hintLevel + 1} ký tự đầu`
            }
          >
            <Lightbulb className="h-4 w-4" />
            Gợi ý {hintLevel > 0 ? `(${hintLevel}/${maxHints})` : ""}
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            Kiểm tra
          </Button>
        </div>
      )}
    </div>
  );
}
