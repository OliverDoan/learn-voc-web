"use client";

import { useMemo, useState } from "react";
import { Check, Lightbulb, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buildGapFill, GAP_PLACEHOLDER } from "@/lib/gap-fill";
import { speak } from "@/lib/tts";
import { cn, levenshtein } from "@/lib/utils";
import type { Card } from "@/lib/types";

interface GapFillQuizProps {
  question: Card;
  onAnswer: (correct: boolean, attempt: string) => void;
}

export function GapFillQuiz({ question, onAnswer }: GapFillQuizProps) {
  const gap = useMemo(() => buildGapFill(question), [question]);
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  // Card không hợp lệ (không có ví dụ chứa từ) — quiz page đã lọc nên hiếm khi xảy ra
  if (!gap) return null;

  const target = gap.answer;
  const maxHints = Math.max(1, target.length - 1);
  // Kiểm tra chính tả: phải gõ ĐÚNG HOÀN TOÀN (không tha sai ký tự nào).
  const tolerance = 0;

  const showHint = hintLevel > 0;
  const hintText = showHint
    ? target
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
    const distance = levenshtein(value.trim().toLowerCase(), target.toLowerCase());
    const correct = distance <= tolerance;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct, value.trim());
  };

  // Tách câu quanh chỗ trống để highlight ô cần điền
  const [before, after] = gap.masked.split(GAP_PLACEHOLDER);

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 rounded-2xl border bg-card p-8 shadow-md">
        <p className="mb-3 text-center text-xs uppercase tracking-wider text-muted-foreground">
          Điền từ còn thiếu vào câu
        </p>
        <p className="text-center text-xl leading-relaxed">
          {before}
          <span className="mx-1 inline-block min-w-[3rem] border-b-2 border-dashed border-primary px-1 text-center font-semibold text-primary">
            {submitted ? target : "?"}
          </span>
          {after}
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Nghĩa từ cần điền: <strong className="text-foreground">{question.meaning}</strong>
          {question.partOfSpeech ? (
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {question.partOfSpeech}
            </Badge>
          ) : null}
        </p>
        {gap.translation ? (
          <p className="mt-1 text-center text-xs italic text-muted-foreground">
            {gap.translation}
          </p>
        ) : null}
        {showHint ? (
          <p className="font-phonetic mt-3 text-center text-xl tracking-[0.3em] text-primary">
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
        placeholder="Gõ từ còn thiếu rồi nhấn Enter..."
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => speak(target)}
            aria-label="Phát âm"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
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
