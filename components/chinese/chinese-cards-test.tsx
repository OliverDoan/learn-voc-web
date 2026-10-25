"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestHistory } from "@/components/deck/test-history";
import { isChineseAnswerCorrect } from "@/lib/chinese-answer";
import {
  addTestAttempt,
  clearTestHistory,
  loadTestHistory,
  type TestAttempt,
  type TestWrongItem,
} from "@/lib/test-history";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChineseCardsTestProps {
  cards: Card[];
  deckId: string;
}

/**
 * Kiểm tra Deck China: hiện nghĩa tiếng Việt, gõ Hán tự hoặc pinyin,
 * bấm "Chấm điểm" để xem đúng/sai (hiện đáp án đúng). Từ sai lưu vào lịch sử.
 */
export function ChineseCardsTest({ cards, deckId }: ChineseCardsTestProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState(false);
  // Đọc thẳng localStorage lúc khởi tạo được: component chỉ mount sau khi người dùng
  // bấm sang chế độ Kiểm tra (luôn ở client), nên không có lệch hydration.
  const [history, setHistory] = useState<TestAttempt[]>(() => loadTestHistory(deckId));

  const answerOf = (c: Card) => answers[c.id] ?? "";
  const rowOk = (c: Card) => isChineseAnswerCorrect(c, answerOf(c));

  const result = useMemo(() => {
    const correct = cards.filter((c) => isChineseAnswerCorrect(c, answers[c.id] ?? "")).length;
    const answered = cards.filter((c) => (answers[c.id] ?? "").trim() !== "").length;
    return { correct, answered, total: cards.length };
  }, [cards, answers]);

  const reset = () => {
    setAnswers({});
    setGraded(false);
  };

  const handleGrade = () => {
    setGraded(true);
    const wrong: TestWrongItem[] = cards
      .filter((c) => !rowOk(c))
      .map((c) => ({
        cardId: c.id,
        meaning: c.meaning,
        word: c.phonetic ? `${c.word} (${c.phonetic})` : c.word,
        yourAnswer: answerOf(c).trim(),
        wordWrong: true,
        // Deck China không chấm từ loại.
        posWrong: false,
        correctPos: "",
        yourPos: "",
      }));
    // Chỉ lưu khi có từ sai — đúng hết thì không ghi gì.
    if (wrong.length > 0) {
      setHistory(
        addTestAttempt(deckId, {
          at: Date.now(),
          total: result.total,
          correct: result.correct,
          wrong,
        }),
      );
    }
  };

  const handleClearHistory = () => {
    clearTestHistory(deckId);
    setHistory([]);
  };

  const percent = result.total ? Math.round((result.correct / result.total) * 100) : 0;

  return (
    <div className="pb-24">
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
              onClick={handleGrade}
              disabled={result.answered === 0}
            >
              <Check className="h-4 w-4" /> Chấm điểm
            </Button>
            <span className="text-xs text-muted-foreground">
              Đã nhập {result.answered}/{result.total} · gõ Hán tự hoặc pinyin (không cần dấu)
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
                Hán tự / pinyin
              </th>
              {graded ? (
                <th className="border-b px-3 py-2 text-left font-semibold">Kết quả</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {cards.map((card, i) => {
              const ok = rowOk(card);
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
                      value={answerOf(card)}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [card.id]: e.target.value }))
                      }
                      disabled={graded}
                      lang="zh-CN"
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
                        <span className="inline-flex items-center gap-1.5 text-destructive">
                          <X className="h-4 w-4" />
                          <span lang="zh-CN" className="font-medium">
                            {card.word}
                          </span>
                          {card.phonetic ? (
                            <span className="font-phonetic text-xs">{card.phonetic}</span>
                          ) : null}
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

      <TestHistory history={history} onClear={handleClearHistory} />
    </div>
  );
}
