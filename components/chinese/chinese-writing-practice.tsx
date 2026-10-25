"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HanziAudioButton } from "@/components/chinese/hanzi-audio-button";
import { HanziWritingPad } from "@/components/chinese/hanzi-writing-pad";
import { shuffle } from "@/lib/chinese";
import { TestHistory } from "@/components/deck/test-history";
import { writableChars, writingScore, type CharWritingResult } from "@/lib/chinese-writing";
import {
  addTestAttempt,
  clearTestHistory,
  loadTestHistory,
  type TestAttempt,
  type TestWrongItem,
} from "@/lib/test-history";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChineseWritingPracticeProps {
  cards: Card[];
  /** Khoá lịch sử sai (localStorage). */
  historyKey: string;
}

/** Kết quả từng chữ của một từ; `null` = bỏ qua (không tải được nét). */
type WordResults = Record<string, Array<CharWritingResult | null>>;

const totalMistakes = (results: Array<CharWritingResult | null> = []) =>
  results.reduce((sum, r) => sum + (r?.mistakes ?? 0), 0);

const written = (results: Array<CharWritingResult | null> = []) =>
  results.filter((r): r is CharWritingResult => r !== null);

/**
 * Luyện viết: hiện nghĩa + pinyin của từng từ, viết lần lượt từng chữ Hán bằng nét.
 * Hết lượt thì chấm điểm theo số nét sai và lưu các từ viết sai vào lịch sử.
 */
export function ChineseWritingPractice({ cards, historyKey }: ChineseWritingPracticeProps) {
  // Chỉ luyện những từ có chữ Hán để viết.
  const allWords = useMemo(() => cards.filter((c) => writableChars(c.word).length > 0), [cards]);

  // Mỗi lượt luyện trộn ngẫu nhiên thứ tự từ để không học vẹt theo thứ tự deck.
  const [words, setWords] = useState<Card[]>(() => shuffle(allWords));
  const [pos, setPos] = useState(0);
  const [charPos, setCharPos] = useState(0);
  const [results, setResults] = useState<WordResults>({});
  const [loadError, setLoadError] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [finished, setFinished] = useState(false);
  // Chỉ mount phía client (sau khi vào trang luyện viết) nên đọc localStorage ngay được.
  const [history, setHistory] = useState<TestAttempt[]>(() => loadTestHistory(historyKey));

  const current = words[pos];
  const chars = current ? writableChars(current.word) : [];
  const wordDone = current ? (results[current.id]?.length ?? 0) >= chars.length : false;

  const recordChar = (result: CharWritingResult | null) => {
    if (!current) return;
    setLoadError(false);
    setResults((prev) => ({ ...prev, [current.id]: [...(prev[current.id] ?? []), result] }));
    if (charPos + 1 < chars.length) setCharPos(charPos + 1);
  };

  const finish = () => {
    setFinished(true);
    const wrongWords = words.filter((w) => totalMistakes(results[w.id]) > 0);
    if (wrongWords.length === 0) return;
    const wrong: TestWrongItem[] = wrongWords.map((w) => ({
      cardId: w.id,
      meaning: w.meaning,
      word: w.phonetic ? `${w.word} (${w.phonetic})` : w.word,
      yourAnswer: `sai ${totalMistakes(results[w.id])} nét`,
      wordWrong: true,
      posWrong: false,
      correctPos: "",
      yourPos: "",
    }));
    setHistory(
      addTestAttempt(historyKey, {
        at: Date.now(),
        total: words.length,
        correct: words.length - wrongWords.length,
        wrong,
      }),
    );
  };

  const next = () => {
    if (pos + 1 >= words.length) {
      finish();
      return;
    }
    setPos(pos + 1);
    setCharPos(0);
  };

  const restart = (subset: Card[]) => {
    setWords(shuffle(subset));
    setPos(0);
    setCharPos(0);
    setResults({});
    setLoadError(false);
    setFinished(false);
  };

  const handleClearHistory = () => {
    clearTestHistory(historyKey);
    setHistory([]);
  };

  if (allWords.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        Deck này chưa có chữ Hán nào để luyện viết.
      </div>
    );
  }

  if (finished) {
    const score = writingScore(words.flatMap((w) => written(results[w.id])));
    const wrongWords = words.filter((w) => totalMistakes(results[w.id]) > 0);
    return (
      <div className="pb-24">
        <div className="mb-6 rounded-2xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Điểm luyện viết</p>
          <p className="text-5xl font-bold text-primary">{score}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {words.length - wrongWords.length}/{words.length} từ viết không sai nét nào
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button className="rounded-full" variant="outline" onClick={() => restart(allWords)}>
              <RotateCcw className="h-4 w-4" /> Làm lại
            </Button>
            {wrongWords.length > 0 ? (
              <Button className="rounded-full" onClick={() => restart(wrongWords)}>
                Luyện lại {wrongWords.length} từ sai
              </Button>
            ) : null}
          </div>
        </div>

        {wrongWords.length > 0 ? (
          <div className="flex flex-col gap-2">
            {wrongWords.map((w) => (
              <div key={w.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <span lang="zh-CN" className="text-2xl font-medium">
                  {w.word}
                </span>
                <span className="font-phonetic text-sm text-primary">{w.phonetic}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {w.meaning}
                </span>
                <span className="shrink-0 text-sm font-medium text-destructive">
                  sai {totalMistakes(results[w.id])} nét
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <TestHistory history={history} onClear={handleClearHistory} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24">
      <div className="mb-4 flex w-full max-w-xl items-center gap-3">
        <Progress value={((pos + 1) / words.length) * 100} className="flex-1" />
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {pos + 1}/{words.length}
        </span>
      </div>

      {current ? (
        <>
          <p className="text-center text-2xl font-semibold">{current.meaning}</p>
          <div className="mt-1 flex items-center gap-2">
            {current.phonetic ? (
              <span className="font-phonetic text-lg text-primary">{current.phonetic}</span>
            ) : null}
            <HanziAudioButton
              text={current.word}
              label={`Phát âm ${current.word}`}
              className="h-8 w-8"
            />
          </div>

          {/* Các ô chữ của từ: chữ đã viết hiện ra, ô đang viết được đánh dấu */}
          <div className="my-4 flex gap-2">
            {chars.map((ch, i) => {
              const r = results[current.id]?.[i];
              const done = i < (results[current.id]?.length ?? 0);
              return (
                <span
                  key={i}
                  lang="zh-CN"
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg border-2 text-2xl",
                    !done && i === charPos && "border-primary",
                    done && r && r.mistakes === 0 && "border-emerald-500 text-emerald-600",
                    done && (!r || r.mistakes > 0) && "border-amber-500 text-amber-600",
                  )}
                >
                  {done ? ch : "?"}
                </span>
              );
            })}
          </div>

          {wordDone ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm">
                {totalMistakes(results[current.id]) === 0 ? (
                  <span className="font-medium text-emerald-600">Chuẩn! Không sai nét nào.</span>
                ) : (
                  <span className="font-medium text-amber-600">
                    Sai {totalMistakes(results[current.id])} nét
                  </span>
                )}
              </p>
              <Button className="rounded-full" onClick={next}>
                {pos + 1 >= words.length ? "Xem kết quả" : "Từ tiếp theo"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              <p>
                Không tải được dữ liệu nét của chữ <span lang="zh-CN">{chars[charPos]}</span> (cần
                có mạng).
              </p>
              <Button variant="outline" className="rounded-full" onClick={() => recordChar(null)}>
                <SkipForward className="h-4 w-4" /> Bỏ qua chữ này
              </Button>
            </div>
          ) : (
            <HanziWritingPad
              key={`${current.id}-${charPos}`}
              char={chars[charPos]}
              showOutline={showOutline}
              onComplete={recordChar}
              onLoadError={() => setLoadError(true)}
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-4 rounded-full"
            onClick={() => setShowOutline((v) => !v)}
            aria-pressed={showOutline}
          >
            {showOutline ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showOutline ? "Ẩn nét mờ (viết từ trí nhớ)" : "Hiện nét mờ (tô theo)"}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            Viết đúng thứ tự và hướng nét · sai 3 lần một nét sẽ hiện gợi ý
          </p>
        </>
      ) : null}
    </div>
  );
}
