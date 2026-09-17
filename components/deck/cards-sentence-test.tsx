"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildSentenceTestRows,
  gradeSentenceTest,
  isSentenceTestPass,
  sentenceTestScore,
  type SentenceTestAnswers,
} from "@/lib/sentence-test";
import { diffSentence } from "@/lib/sentence-writing";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface CardsSentenceTestProps {
  cards: Card[];
}

/** Chiều cao tối thiểu của ô gõ câu (px) — tương đương 2 dòng. */
const MIN_INPUT_HEIGHT = 64;

/** Giãn ô nhập theo nội dung để câu dài không bị cuộn trong khung nhỏ. */
function autoGrow(el: HTMLTextAreaElement | null): void {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.max(MIN_INPUT_HEIGHT, el.scrollHeight)}px`;
}

/**
 * Dạng kiểm tra "Viết câu": hiện câu ví dụ đã dịch sang tiếng Việt,
 * người dùng gõ lại câu tiếng Anh gốc ngay bên dưới, bấm "Chấm điểm"
 * để xem đúng/sai kèm so sánh từng từ với đáp án.
 */
export function CardsSentenceTest({ cards }: CardsSentenceTestProps) {
  const rows = useMemo(() => buildSentenceTestRows(cards), [cards]);
  const [answers, setAnswers] = useState<SentenceTestAnswers>({});
  const [graded, setGraded] = useState(false);

  const result = useMemo(
    () => (graded ? gradeSentenceTest(rows, answers) : {}),
    [graded, rows, answers],
  );
  const score = useMemo(() => sentenceTestScore(rows, answers), [rows, answers]);

  const reset = () => {
    setAnswers({});
    setGraded(false);
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Deck này chưa có từ nào kèm câu ví dụ đã dịch sang tiếng Việt. Hãy thêm câu ví dụ
        và bản dịch cho thẻ để làm bài viết câu.
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Thanh công cụ + điểm số */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {graded ? (
          <>
            <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-semibold">
              <span className="text-primary">
                Đúng {score.correct}/{score.total}
              </span>
              <span className="text-muted-foreground">· {score.percent}%</span>
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
              disabled={score.answered === 0}
            >
              <Check className="h-4 w-4" /> Chấm điểm
            </Button>
            <span className="text-xs text-muted-foreground">
              Đã nhập {score.answered}/{score.total} · gõ câu tiếng Anh, sai chính tả nhẹ
              vẫn tính đúng
            </span>
          </>
        )}
      </div>

      <ol className="space-y-3">
        {rows.map((row, i) => {
          const grade = result[row.cardId];
          const ok = graded && isSentenceTestPass(grade);
          const diff =
            graded && !ok ? diffSentence(answers[row.cardId] ?? "", row.answer) : [];
          return (
            <li
              key={row.cardId}
              className={cn(
                "rounded-xl border bg-card p-4",
                graded &&
                  (ok
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-destructive/40 bg-destructive/5"),
              )}
            >
              {/* Đề bài: câu tiếng Việt + từ vựng của thẻ */}
              <div className="mb-2 flex items-baseline gap-2">
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <p className="leading-relaxed">
                  {row.prompt}
                  <span className="ml-1.5 text-xs text-muted-foreground">({row.word})</span>
                </p>
              </div>

              {/* Ô gõ câu tiếng Anh — rộng hết khối, tự giãn theo nội dung */}
              <textarea
                ref={autoGrow}
                value={answers[row.cardId] ?? ""}
                onChange={(e) => {
                  autoGrow(e.currentTarget);
                  setAnswers((prev) => ({ ...prev, [row.cardId]: e.target.value }));
                }}
                disabled={graded}
                rows={2}
                style={{ minHeight: MIN_INPUT_HEIGHT }}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-base leading-relaxed outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-100"
                placeholder="Gõ câu tiếng Anh…"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              {graded ? (
                <div className="mt-2 text-sm">
                  {ok ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      {grade === "close" ? "Gần đúng — chỉ sai chính tả nhỏ" : "Đúng"}
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5 text-destructive">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="font-medium">{row.answer}</span>
                        <button
                          type="button"
                          onClick={() => speak(row.answer)}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label="Nghe câu đúng"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      {diff.length > 0 ? (
                        <p className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-xs leading-relaxed text-muted-foreground">
                          {diff.map((part, idx) => (
                            <span
                              key={`${part.type}-${idx}-${part.text}`}
                              className={cn(
                                part.type === "missing" &&
                                  "rounded bg-emerald-500/15 px-1 font-semibold text-emerald-600 dark:text-emerald-400",
                                part.type === "extra" &&
                                  "rounded bg-destructive/15 px-1 text-destructive line-through",
                              )}
                              title={
                                part.type === "missing"
                                  ? "Thiếu từ này"
                                  : part.type === "extra"
                                    ? "Từ thừa"
                                    : undefined
                              }
                            >
                              {part.text}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {graded ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          <span className="text-emerald-600 dark:text-emerald-400">Xanh</span> = từ còn
          thiếu, <span className="text-destructive">đỏ gạch</span> = từ gõ thừa/sai.
        </p>
      ) : null}
    </div>
  );
}
