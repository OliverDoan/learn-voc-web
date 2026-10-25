"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestHistory } from "@/components/deck/test-history";
import { CHINESE_TTS_LANG } from "@/lib/chinese";
import { isChineseSentenceCorrect } from "@/lib/chinese-answer";
import type { ReadingItem } from "@/lib/chinese-readings";
import {
  addTestAttempt,
  clearTestHistory,
  loadTestHistory,
  type TestAttempt,
  type TestWrongItem,
} from "@/lib/test-history";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";

/** dictation = nghe chép chính tả; translate = hiện nghĩa Việt, gõ tiếng Trung. */
export type ReadingTestMode = "dictation" | "translate";

interface ReadingTestProps {
  items: ReadingItem[];
  mode: ReadingTestMode;
  /** Khoá lịch sử sai — tách theo deck và chế độ. */
  historyKey: string;
}

/** Đọc câu chậm hơn bình thường để nghe rõ từng chữ khi chép chính tả. */
const DICTATION_RATE = 0.75;

const playItem = (item: ReadingItem) =>
  speak(item.tts ?? item.hanzi, CHINESE_TTS_LANG, DICTATION_RATE);

/**
 * Kiểm tra bài đọc theo từng câu: nghe rồi chép, hoặc xem nghĩa Việt rồi viết tiếng Trung.
 * Gõ Hán tự hoặc pinyin; bấm "Chấm điểm" để xem đúng/sai, câu sai lưu vào lịch sử.
 */
export function ReadingTest({ items, mode, historyKey }: ReadingTestProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState(false);
  // Chỉ mount phía client (sau khi người dùng chọn chế độ) nên đọc localStorage ngay được.
  const [history, setHistory] = useState<TestAttempt[]>(() => loadTestHistory(historyKey));

  const answerOf = (item: ReadingItem) => answers[item.id] ?? "";
  const rowOk = (item: ReadingItem) => isChineseSentenceCorrect(item, answerOf(item));

  const result = useMemo(() => {
    const correct = items.filter((i) => isChineseSentenceCorrect(i, answers[i.id] ?? "")).length;
    const answered = items.filter((i) => (answers[i.id] ?? "").trim() !== "").length;
    return { correct, answered, total: items.length };
  }, [items, answers]);

  const reset = () => {
    setAnswers({});
    setGraded(false);
  };

  const handleGrade = () => {
    setGraded(true);
    const wrong: TestWrongItem[] = items
      .filter((i) => !rowOk(i))
      .map((i) => ({
        cardId: i.id,
        meaning: i.vi,
        word: `${i.hanzi} (${i.pinyin})`,
        yourAnswer: answerOf(i).trim(),
        wordWrong: true,
        posWrong: false,
        correctPos: "",
        yourPos: "",
      }));
    // Chỉ lưu khi có câu sai — đúng hết thì không ghi gì.
    if (wrong.length > 0) {
      setHistory(
        addTestAttempt(historyKey, {
          at: Date.now(),
          total: result.total,
          correct: result.correct,
          wrong,
        }),
      );
    }
  };

  const handleClearHistory = () => {
    clearTestHistory(historyKey);
    setHistory([]);
  };

  const percent = result.total ? Math.round((result.correct / result.total) * 100) : 0;
  const promptLabel = mode === "dictation" ? "Nghe" : "Nghĩa tiếng Việt";

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
              Đã nhập {result.answered}/{result.total} · gõ Hán tự hoặc pinyin (không cần dấu
              thanh, dấu câu)
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
                {promptLabel}
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
            {items.map((item, i) => {
              const ok = rowOk(item);
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-accent/40",
                    graded && (ok ? "bg-emerald-500/10" : "bg-destructive/10"),
                    !graded && "even:bg-muted/20",
                  )}
                >
                  <td className="border-b border-r px-2 py-1.5 text-center text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="border-b border-r px-3 py-1.5 align-top">
                    {mode === "dictation" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full"
                        onClick={() => playItem(item)}
                        aria-label={`Nghe câu ${i + 1}`}
                      >
                        <Volume2 className="h-4 w-4" /> Nghe
                      </Button>
                    ) : (
                      item.vi
                    )}
                  </td>
                  <td className="border-b border-r p-0 align-top">
                    <input
                      value={answerOf(item)}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      disabled={graded}
                      lang="zh-CN"
                      className="w-full min-w-[14rem] bg-transparent px-3 py-2 outline-none focus:bg-background focus:ring-1 focus:ring-inset focus:ring-primary disabled:opacity-100"
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
                          <span className="inline-flex items-center gap-1.5">
                            <X className="h-4 w-4 shrink-0" />
                            <span lang="zh-CN" className="font-medium">
                              {item.hanzi}
                            </span>
                          </span>
                          <span className="font-phonetic text-xs">{item.pinyin}</span>
                          {mode === "dictation" ? (
                            <span className="text-xs text-muted-foreground">{item.vi}</span>
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
