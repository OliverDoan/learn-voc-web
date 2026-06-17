"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getWordFormTargets } from "@/lib/word-forms";
import { cn, levenshtein } from "@/lib/utils";
import type { Card } from "@/lib/types";

interface WordFormationQuizProps {
  question: Card;
  onAnswer: (correct: boolean, attempt: string) => void;
}

export function WordFormationQuiz({ question, onAnswer }: WordFormationQuizProps) {
  const targets = useMemo(() => getWordFormTargets(question), [question]);
  // Chọn ngẫu nhiên 1 dạng từ để hỏi, cố định trong suốt câu hỏi
  const [target] = useState(() => targets[Math.floor(Math.random() * targets.length)]);

  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  // Card không hợp lệ (quiz page đã lọc nên hiếm khi xảy ra)
  if (!target) return null;

  const answer = target.answer;
  const maxHints = Math.max(1, answer.length - 1);
  const tolerance = 1;

  const showHint = hintLevel > 0;
  const hintText = showHint
    ? answer
        .split("")
        .map((ch, i) => (i < hintLevel || ch === " " ? ch : "_"))
        .join("")
    : "";

  const revealHint = () => {
    if (submitted || hintLevel >= maxHints) return;
    setHintLevel((h) => h + 1);
  };

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    const distance = levenshtein(value.trim().toLowerCase(), answer.toLowerCase());
    const correct = distance <= tolerance;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct, value.trim());
  };

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 rounded-2xl border bg-card p-8 text-center shadow-md">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Biến đổi từ sang đúng dạng
        </p>
        <div className="flex items-center justify-center gap-3 text-2xl font-semibold">
          <span>{question.word}</span>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <Badge variant="secondary" className="text-sm">
            {target.label}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Nghĩa: <strong className="text-foreground">{question.meaning}</strong>
        </p>
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
        placeholder={`Gõ dạng ${target.label.toLowerCase()} rồi nhấn Enter...`}
        disabled={submitted}
        className={cn(
          "h-12 text-lg",
          submitted && isCorrect && "border-green-500 bg-green-500/10",
          submitted && !isCorrect && "border-red-500 bg-red-500/10",
        )}
        autoFocus
      />

      {submitted ? (
        <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm">
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
              <X className="h-4 w-4" /> Đáp án đúng: <strong>{answer}</strong>
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
            title={hintLevel >= maxHints ? "Đã dùng hết gợi ý" : `Hiện ${hintLevel + 1} ký tự đầu`}
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
