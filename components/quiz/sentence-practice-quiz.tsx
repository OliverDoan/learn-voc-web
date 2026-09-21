"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Lightbulb, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { diffSentence, gradeSentence, sentenceHint } from "@/lib/sentence-writing";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import type { PracticeItem } from "@/lib/practice-sentence";

interface SentencePracticeQuizProps {
  item: PracticeItem;
  onAnswer: (correct: boolean, attempt: string) => void;
  /**
   * Có hàm này thì bài KHÔNG tự nhảy câu: người học xem kết quả đúng/sai và câu
   * đáp án bao lâu tuỳ ý, rồi tự bấm "Câu tiếp theo" (hoặc nhấn Enter).
   */
  onNext?: () => void;
}

/** Số cấp gợi ý: 1 = từ khoá + từ ôn tập, 2 = khung chữ cái đầu mỗi từ. */
const MAX_HINTS = 2;

/**
 * Bài luyện viết câu: hiện câu tiếng Việt, người dùng gõ lại câu tiếng Anh.
 * Khác "Viết lại câu" ở chỗ dùng bộ câu luyện riêng (nhiều câu mỗi từ),
 * mỗi câu đều chêm từ đã học ở các Unit cũ.
 */
export function SentencePracticeQuiz({ item, onAnswer, onNext }: SentencePracticeQuizProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [grade, setGrade] = useState<"correct" | "close" | "wrong">("wrong");
  const [hintLevel, setHintLevel] = useState(0);
  // Chặn chuyển câu hai lần (bấm nút trong lúc phím Enter cũng đang được xử lý).
  const nextFiredRef = useRef(false);

  const goNext = useCallback(() => {
    if (!onNext || nextFiredRef.current) return;
    nextFiredRef.current = true;
    onNext();
  }, [onNext]);

  // Đã nộp rồi thì Enter = sang câu tiếp theo. Listener chỉ gắn sau khi render
  // nên chính phím Enter dùng để nộp không kích hoạt nhầm.
  useEffect(() => {
    if (!submitted || !onNext) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitted, onNext, goNext]);

  const isCorrect = grade === "correct" || grade === "close";
  const diff = submitted && !isCorrect ? diffSentence(value, item.answer) : [];

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    const result = gradeSentence(value, item.answer);
    setGrade(result);
    setSubmitted(true);
    onAnswer(result !== "wrong", value.trim());
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 rounded-2xl border bg-card p-8 shadow-md">
        <p className="mb-3 text-center text-xs uppercase tracking-wider text-muted-foreground">
          Viết câu sau bằng tiếng Anh
        </p>
        <p className="text-center text-xl font-medium leading-relaxed">{item.prompt}</p>

        {hintLevel >= 1 ? (
          <div className="mt-4 space-y-1.5 text-center text-sm text-muted-foreground">
            <p>
              Từ khoá: <strong className="text-foreground">{item.word}</strong>
              <span className="ml-2 italic">({item.meaning})</span>
            </p>
            {item.reviewWords.length > 0 ? (
              <p className="flex flex-wrap items-center justify-center gap-1.5">
                <span>Từ ôn lại:</span>
                {item.reviewWords.map((w) => (
                  <Badge key={w} variant="secondary" className="text-[10px]">
                    {w}
                  </Badge>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}

        {hintLevel >= 2 ? (
          <p className="font-phonetic mt-3 text-center text-lg tracking-widest text-primary">
            {sentenceHint(item.answer, hintLevel)}
          </p>
        ) : null}
      </div>

      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          // Enter để nộp, Shift+Enter để xuống dòng.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Gõ câu tiếng Anh rồi nhấn Enter..."
        disabled={submitted}
        rows={3}
        className={cn(
          "min-h-[96px] text-lg leading-relaxed",
          submitted && isCorrect && "border-green-500 bg-green-500/10",
          submitted && !isCorrect && "border-red-500 bg-red-500/10",
        )}
        autoFocus
      />

      {submitted ? (
        <div className="mt-3 space-y-3 rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex items-start justify-between gap-2">
            {grade === "correct" ? (
              <span className="flex items-center gap-2 text-green-500">
                <Check className="h-4 w-4 shrink-0" /> Chính xác!
                {hintLevel > 0 ? (
                  <Badge variant="warning" className="ml-1 text-[10px]">
                    có gợi ý
                  </Badge>
                ) : null}
              </span>
            ) : grade === "close" ? (
              <span className="flex items-center gap-2 text-green-500">
                <Check className="h-4 w-4 shrink-0" /> Gần đúng — chỉ sai chính tả nhỏ.
              </span>
            ) : (
              <span className="flex items-center gap-2 text-red-500">
                <X className="h-4 w-4 shrink-0" /> Chưa đúng
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => speak(item.answer)}
              aria-label="Nghe câu đúng"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
              Câu đúng
            </p>
            <p className="text-base font-medium">{item.answer}</p>
          </div>

          {diff.length > 0 ? (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                So với câu bạn gõ
              </p>
              <p className="flex flex-wrap gap-x-1.5 gap-y-1 text-base leading-relaxed">
                {diff.map((part, i) => (
                  <span
                    key={`${part.type}-${i}-${part.text}`}
                    className={cn(
                      part.type === "missing" &&
                        "rounded bg-green-500/15 px-1 font-semibold text-green-500",
                      part.type === "extra" &&
                        "rounded bg-red-500/15 px-1 text-red-500 line-through",
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
              <p className="mt-1 text-[11px] text-muted-foreground">
                <span className="text-green-500">Xanh</span> = từ còn thiếu,{" "}
                <span className="text-red-500">đỏ gạch</span> = từ gõ thừa/sai.
              </p>
            </div>
          ) : null}

          {onNext ? (
            <Button className="w-full" onClick={goNext}>
              Câu tiếp theo
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setHintLevel((h) => Math.min(MAX_HINTS, h + 1))}
            disabled={hintLevel >= MAX_HINTS}
            title={
              hintLevel >= MAX_HINTS
                ? "Đã dùng hết gợi ý"
                : hintLevel === 0
                  ? "Hiện từ khoá và từ ôn lại của câu"
                  : "Hiện chữ cái đầu mỗi từ"
            }
          >
            <Lightbulb className="h-4 w-4" />
            Gợi ý {hintLevel > 0 ? `(${hintLevel}/${MAX_HINTS})` : ""}
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            Kiểm tra
          </Button>
        </div>
      )}
    </div>
  );
}
