"use client";

import { useEffect, useState } from "react";
import { Check, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { levenshtein, cn } from "@/lib/utils";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

const MAX_REPLAYS = 3;

interface ListeningQuizProps {
  question: Card;
  onAnswer: (correct: boolean) => void;
}

export function ListeningQuiz({ question, onAnswer }: ListeningQuizProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [replays, setReplays] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      speak(question.word);
      setReplays(1);
    }, 250);
    return () => clearTimeout(t);
  }, [question.word]);

  const handleReplay = () => {
    if (replays >= MAX_REPLAYS) return;
    speak(question.word);
    setReplays(replays + 1);
  };

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    const distance = levenshtein(value.trim().toLowerCase(), question.word.toLowerCase());
    const correct = distance <= 1;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-md">
        <p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Nghe và gõ lại</p>
        <Button
          size="lg"
          variant="outline"
          onClick={handleReplay}
          disabled={replays >= MAX_REPLAYS || submitted}
          className="gap-2"
        >
          <Volume2 className="h-5 w-5" />
          Nghe lại ({MAX_REPLAYS - replays} lần)
        </Button>
      </div>

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={submitted}
        placeholder="Gõ từ vừa nghe..."
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
              <Check className="h-4 w-4" /> Đúng! Đáp án: <strong>{question.word}</strong>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-red-500">
              <X className="h-4 w-4" /> Đáp án đúng: <strong>{question.word}</strong>
            </span>
          )}
        </div>
      ) : (
        <Button className="mt-3 w-full" onClick={handleSubmit}>
          Kiểm tra
        </Button>
      )}
    </div>
  );
}
