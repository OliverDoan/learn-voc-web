"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface MultipleChoiceProps {
  question: Card;
  options: Card[];
  direction: "word-to-meaning" | "meaning-to-word";
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoice({ question, options, direction, onAnswer }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handlePick = (id: string) => {
    if (selected) return;
    setSelected(id);
    onAnswer(id === question.id);
  };

  const promptText = direction === "word-to-meaning" ? question.word : question.meaning;
  const promptHint = direction === "word-to-meaning" ? question.phonetic : null;

  const shuffled = useMemo(
    () => [...options].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  );

  return (
    <div className="w-full max-w-xl">
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
            onClick={() => speak(question.word)}
            aria-label="Phát âm"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {shuffled.map((opt) => {
          const isCorrect = opt.id === question.id;
          const isPicked = opt.id === selected;
          const showResult = selected !== null;
          return (
            <motion.button
              key={opt.id}
              whileHover={{ scale: showResult ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
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
  );
}
