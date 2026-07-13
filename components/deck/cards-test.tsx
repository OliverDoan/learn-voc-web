"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WORD_FORM_ABBR, WORD_FORM_ORDER, type WordFormPOS } from "@/lib/word-forms";
import {
  addTestAttempt,
  clearTestHistory,
  loadTestHistory,
  type TestAttempt,
  type TestWrongItem,
} from "@/lib/test-history";
import { TestHistory } from "@/components/deck/test-history";
import type { Card } from "@/lib/types";

interface CardsTestProps {
  cards: Card[];
  deckId: string;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Tập từ loại đúng của thẻ (card.partOfSpeech có thể là "adjective / noun"…).
function parsePos(s: string | null): Set<WordFormPOS> {
  if (!s) return new Set();
  return new Set(
    s
      .toLowerCase()
      .split(/[/,]/)
      .map((x) => x.trim())
      .filter((x): x is WordFormPOS =>
        (WORD_FORM_ORDER as readonly string[]).includes(x),
      ),
  );
}

// Viết tắt (và tên đầy đủ) người dùng có thể gõ cho từng từ loại.
const POS_ALIASES: Record<string, WordFormPOS> = {
  n: "noun",
  noun: "noun",
  v: "verb",
  verb: "verb",
  a: "adjective",
  adj: "adjective",
  adjective: "adjective",
  adv: "adverb",
  adverb: "adverb",
};

/**
 * Tách phần đáp án "từ-từ_loại" mà người dùng gõ, vd:
 * - "middle-n"      → { word: "middle", pos: "noun", posToken: "n" }
 * - "well-known-adj"→ { word: "well-known", pos: "adjective", posToken: "adj" }
 * - "self-esteem"   → { word: "self-esteem", pos: null } (đuôi không phải từ loại)
 * Chỉ tách ở dấu gạch CUỐI và chỉ khi đuôi là một từ loại hợp lệ, nên từ có
 * gạch nối (self-esteem, well-being…) vẫn giữ nguyên.
 */
function parseAnswer(input: string): {
  word: string;
  pos: WordFormPOS | null;
  posToken: string;
} {
  const trimmed = input.trim();
  const dash = trimmed.lastIndexOf("-");
  if (dash > 0) {
    const token = trimmed.slice(dash + 1).trim().toLowerCase();
    const pos = POS_ALIASES[token];
    if (pos) {
      return { word: trimmed.slice(0, dash).trim(), pos, posToken: token };
    }
  }
  return { word: trimmed, pos: null, posToken: "" };
}

/**
 * Chế độ kiểm tra: hiện nghĩa tiếng Việt, người dùng gõ từ tiếng Anh,
 * bấm "Chấm điểm" để xem đúng bao nhiêu câu, sai câu nào (hiện đáp án đúng).
 */
export function CardsTest({ cards, deckId }: CardsTestProps) {
  // Mỗi ô là chuỗi "từ-từ_loại" (vd "middle-n"); từ loại nhập gộp vào cùng ô.
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState(false);
  const [history, setHistory] = useState<TestAttempt[]>([]);

  // Nạp lịch sử từ localStorage sau khi mount (tránh lệch hydration SSR).
  useEffect(() => {
    setHistory(loadTestHistory(deckId));
  }, [deckId]);

  // Tách từ + từ loại từ ô nhập của một thẻ.
  const parsedOf = (c: Card) => parseAnswer(answers[c.id] ?? "");
  const wordOk = (c: Card) => norm(parsedOf(c).word) === norm(c.word);
  const posOk = (c: Card) => {
    const set = parsePos(c.partOfSpeech);
    // Chưa có dữ liệu từ loại → không tính sai; ngược lại phải gõ đúng từ loại.
    if (set.size === 0) return true;
    const { pos } = parsedOf(c);
    return pos !== null && set.has(pos);
  };
  const rowOk = (c: Card) => wordOk(c) && posOk(c);
  // Từ loại đúng để hiện khi sai — dùng viết tắt (n / v / a / adv) cho gọn.
  const correctPosLabel = (c: Card) =>
    [...parsePos(c.partOfSpeech)].map((p) => WORD_FORM_ABBR[p]).join(" / ");

  const result = useMemo(() => {
    const correct = cards.filter((c) => rowOk(c)).length;
    const answered = cards.filter((c) => (answers[c.id] ?? "").trim() !== "").length;
    return { correct, answered, total: cards.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, answers]);

  const reset = () => {
    setAnswers({});
    setGraded(false);
  };

  // Chấm điểm: đánh dấu đã chấm và lưu các từ SAI vào lịch sử (nếu có).
  const handleGrade = () => {
    setGraded(true);
    const wrong: TestWrongItem[] = cards
      .filter((c) => !rowOk(c))
      .map((c) => {
        const parsed = parsedOf(c);
        return {
          cardId: c.id,
          meaning: c.meaning,
          word: c.word,
          // Hiện lại chính xác từ người dùng gõ (không có phần từ loại).
          yourAnswer: parsed.word,
          wordWrong: !wordOk(c),
          posWrong: !posOk(c),
          correctPos: correctPosLabel(c),
          yourPos: parsed.posToken,
        };
      });
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
              onClick={handleGrade}
              disabled={result.answered === 0}
            >
              <Check className="h-4 w-4" /> Chấm điểm
            </Button>
            <span className="text-xs text-muted-foreground">
              Đã nhập {result.answered}/{result.total} · gõ từ + từ loại (n/v/a/adj/adv)
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
                Từ tiếng Anh + từ loại
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
                      value={answers[card.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [card.id]: e.target.value }))
                      }
                      disabled={graded}
                      className="w-full min-w-[12rem] bg-transparent px-3 py-1.5 outline-none focus:bg-background focus:ring-1 focus:ring-inset focus:ring-primary disabled:opacity-100"
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
                        <span className="flex flex-col gap-0.5 text-destructive">
                          {!wordOk(card) ? (
                            <span className="inline-flex items-center gap-1">
                              <X className="h-4 w-4" /> {card.word}
                            </span>
                          ) : null}
                          {!posOk(card) ? (
                            <span className="text-xs">từ loại: {correctPosLabel(card)}</span>
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
