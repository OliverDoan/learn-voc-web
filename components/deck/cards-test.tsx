"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/types";

interface CardsTestProps {
  cards: Card[];
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Chế độ kiểm tra: hiện nghĩa tiếng Việt, người dùng gõ từ tiếng Anh,
 * bấm "Chấm điểm" để xem đúng bao nhiêu câu, sai câu nào (hiện đáp án đúng).
 */
export function CardsTest({ cards }: CardsTestProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState(false);

  const result = useMemo(() => {
    const correct = cards.filter((c) => norm(answers[c.id] ?? "") === norm(c.word)).length;
    const answered = cards.filter((c) => (answers[c.id] ?? "").trim() !== "").length;
    return { correct, answered, total: cards.length };
  }, [cards, answers]);

  const isCorrect = (c: Card) => norm(answers[c.id] ?? "") === norm(c.word);

  const reset = () => {
    setAnswers({});
    setGraded(false);
  };

  const percent = result.total ? Math.round((result.correct / result.total) * 100) : 0;

  return (
    <div className="pb-24">
      {/* Thanh công cụ + điểm số */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {graded ? (
          <>
            <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-semibold">
              <span className="text-primary">
                Đúng {result.correct}/{result.total}
              </span>
              <span className="text-muted-foreground">· {percent}%</span>
            </div>
            <Button size="sm" variant="outline" className="rounded-full" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Làm lại
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setGraded(true)}
              disabled={result.answered === 0}
            >
              <Check className="h-4 w-4" /> Chấm điểm
            </Button>
            <span className="text-xs text-muted-foreground">
              Đã nhập {result.answered}/{result.total} · gõ từ tiếng Anh theo nghĩa
            </span>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
            <tr>
              <th className="w-12 border-b border-r px-2 py-2 text-center font-semibold text-muted-foreground">
                #
              </th>
              <th className="border-b border-r px-3 py-2 text-left font-semibold">
                Nghĩa tiếng Việt
              </th>
              <th className="border-b border-r px-3 py-2 text-left font-semibold">
                Từ tiếng Anh (đáp án của bạn)
              </th>
              {graded ? (
                <th className="border-b px-3 py-2 text-left font-semibold">Kết quả</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {cards.map((card, i) => {
              const ok = isCorrect(card);
              return (
                <tr
                  key={card.id}
                  className={cn(
                    "hover:bg-accent/40",
                    graded && (ok ? "bg-emerald-500/10" : "bg-destructive/10"),
                    !graded && "even:bg-muted/20",
                  )}
                >
                  <td className="border-b border-r px-2 py-1.5 text-center text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="border-b border-r px-3 py-1.5 align-top">{card.meaning}</td>
                  <td className="border-b border-r p-0 align-top">
                    <input
                      value={answers[card.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [card.id]: e.target.value }))
                      }
                      disabled={graded}
                      className="w-full min-w-[10rem] bg-transparent px-3 py-1.5 outline-none focus:bg-background focus:ring-1 focus:ring-inset focus:ring-primary disabled:opacity-100"
                      placeholder="…"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                  </td>
                  {graded ? (
                    <td className="border-b px-3 py-1.5 align-top">
                      {ok ? (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                          <Check className="h-4 w-4" /> Đúng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <X className="h-4 w-4" /> {card.word}
                        </span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
