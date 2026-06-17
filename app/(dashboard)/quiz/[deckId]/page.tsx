"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  Headphones,
  Keyboard,
  LayoutGrid,
  ListChecks,
  Loader2,
  PenLine,
  Puzzle,
  Repeat,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import { TypingQuiz } from "@/components/quiz/typing-quiz";
import { ListeningQuiz } from "@/components/quiz/listening-quiz";
import { GapFillQuiz } from "@/components/quiz/gap-fill-quiz";
import { WordFormationQuiz } from "@/components/quiz/word-formation-quiz";
import { MatchingGameLauncher } from "@/components/quiz/matching-game";
import { TestModeQuiz } from "@/components/quiz/test-mode-quiz";
import { useCards } from "@/hooks/use-cards";
import { useSubmitReview } from "@/hooks/use-study";
import { haptic } from "@/lib/haptic";
import { gapFillEligibleCards } from "@/lib/gap-fill";
import { wordFormEligibleCards } from "@/lib/word-forms";
import type { Card } from "@/lib/types";

type QuizMode =
  | "multiple-choice"
  | "typing"
  | "listening"
  | "gap-fill"
  | "word-formation"
  | "matching"
  | "test";
type QuizDirection = "word-to-meaning" | "meaning-to-word";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

const MODES: { id: QuizMode; label: string; icon: LucideIcon; desc: string; minCards: number }[] = [
  { id: "multiple-choice", label: "Trắc nghiệm", icon: ListChecks, desc: "Chọn đáp án đúng trong 4 lựa chọn", minCards: 4 },
  { id: "typing", label: "Gõ từ", icon: Keyboard, desc: "Gõ lại từ/nghĩa theo chiều đã chọn", minCards: 1 },
  { id: "listening", label: "Nghe", icon: Headphones, desc: "Nghe và gõ lại từ", minCards: 1 },
  { id: "gap-fill", label: "Điền từ vào câu", icon: PenLine, desc: "Điền từ còn thiếu vào câu ví dụ", minCards: 1 },
  { id: "word-formation", label: "Biến đổi từ", icon: Repeat, desc: "Biến đổi từ gốc sang đúng dạng từ loại", minCards: 1 },
  { id: "matching", label: "Ghép cặp", icon: Puzzle, desc: "Ghép 6 cặp từ ↔ nghĩa, tính thời gian", minCards: 6 },
  { id: "test", label: "Làm bài", icon: LayoutGrid, desc: "Lưới câu hỏi, nhảy tự do giữa các câu", minCards: 4 },
];

const REVERSE_MODES: QuizMode[] = ["multiple-choice", "typing", "test"];

export default function QuizPage({ params }: PageProps) {
  const { deckId } = use(params);
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [reverse, setReverse] = useState(false);

  const subsetIds = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return undefined;
    return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
  }, [searchParams]);
  const isSubset = !!subsetIds && subsetIds.size > 0;

  useEffect(() => {
    const stored = localStorage.getItem("voca-quiz-reverse");
    if (stored === "1") setReverse(true);
  }, []);

  const toggleReverse = () => {
    setReverse((prev) => {
      const next = !prev;
      localStorage.setItem("voca-quiz-reverse", next ? "1" : "0");
      return next;
    });
  };

  const { data: allCards, isLoading } = useCards({ deckId });

  const subsetCards = useMemo(() => {
    if (!allCards || !subsetIds) return allCards ?? [];
    return allCards.filter((c) => subsetIds.has(c.id));
  }, [allCards, subsetIds]);

  const sourceCards = isSubset ? subsetCards : allCards ?? [];

  // Pool đủ điều kiện cho các mode đặc thù (cần dữ liệu riêng)
  const gapFillPool = useMemo(() => gapFillEligibleCards(sourceCards), [sourceCards]);
  const wordFormPool = useMemo(() => wordFormEligibleCards(sourceCards), [sourceCards]);

  const poolForMode = (m: QuizMode): Card[] => {
    if (m === "gap-fill") return gapFillPool;
    if (m === "word-formation") return wordFormPool;
    return sourceCards;
  };

  const quizCards = useMemo(() => {
    if (!mode) return [];
    return [...poolForMode(mode)].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, sourceCards, gapFillPool, wordFormPool]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allCards || allCards.length < 1 || sourceCards.length < 1) {
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <p className="mb-4 text-muted-foreground">
          {isSubset
            ? "Không tìm thấy từ nào trong danh sách đã chọn."
            : "Cần ít nhất 1 từ trong deck để bắt đầu quiz."}
        </p>
        <Link href={`/decks/${deckId}`}>
          <Button variant="outline">Quay lại deck</Button>
        </Link>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <Link
          href={`/decks/${deckId}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        {isSubset ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Quiz tự chọn: <strong>{sourceCards.length}</strong> từ. Distractor (đáp án nhiễu) lấy từ toàn deck.
            </span>
          </div>
        ) : null}
        <div className="mb-2 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Chọn chế độ quiz</h1>
          <Button
            type="button"
            variant={reverse ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={toggleReverse}
            title="Đảo chiều: thấy nghĩa, đoán/chọn từ tiếng Anh"
          >
            <ArrowLeftRight className="h-4 w-4" />
            {reverse ? "Đảo: Việt → Anh" : "Chiều: Anh → Việt"}
          </Button>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Toàn bộ từ trong deck theo thứ tự ngẫu nhiên (ghép cặp tính theo lượt 6 cặp). Đảo chiều áp dụng cho Trắc nghiệm và Gõ từ.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((m) => {
            const available = poolForMode(m.id).length;
            const disabled = available < m.minCards;
            return (
              <button
                key={m.id}
                disabled={disabled}
                onClick={() => setMode(m.id)}
                className="flex min-h-[180px] flex-col rounded-2xl border-[1.5px] bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:shadow-none"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-[13px] bg-primary/[0.08] text-primary">
                  <m.icon className="h-6 w-6" />
                </span>
                <div className="text-[17px] font-bold tracking-tight">{m.label}</div>
                <div className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{m.desc}</div>
                {disabled ? (
                  <div className="mt-2 text-[10px] text-destructive">
                    {m.id === "gap-fill"
                      ? "Cần ≥1 từ có câu ví dụ chứa từ đó"
                      : m.id === "word-formation"
                        ? "Cần ≥1 từ có nhập các dạng word forms"
                        : `Cần ${m.minCards} từ, hiện có ${available}`}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const direction: QuizDirection =
    reverse && REVERSE_MODES.includes(mode) ? "meaning-to-word" : "word-to-meaning";

  if (mode === "test") {
    return (
      <TestModeQuiz
        cards={quizCards}
        allCards={sourceCards}
        deckId={deckId}
        direction={direction}
        reverseActive={reverse}
        onExit={() => setMode(null)}
      />
    );
  }

  return (
    <QuizRunner
      mode={mode}
      cards={quizCards}
      allCards={sourceCards}
      deckId={deckId}
      direction={direction}
      reverseActive={reverse && REVERSE_MODES.includes(mode)}
      onExit={() => setMode(null)}
    />
  );
}

interface QuizRunnerProps {
  mode: QuizMode;
  cards: Card[];
  allCards: Card[];
  deckId: string;
  direction: QuizDirection;
  reverseActive: boolean;
  onExit: () => void;
}

function QuizRunner({
  mode,
  cards,
  allCards,
  deckId,
  direction,
  reverseActive,
  onExit,
}: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const submit = useSubmitReview();

  // Đóng băng danh sách thẻ khi bắt đầu phiên quiz. Mỗi lần submit review sẽ
  // invalidate query ["cards"] khiến danh sách gốc bị refetch & xáo trộn lại;
  // nếu không snapshot, thẻ hiện tại sẽ bị thay giữa chừng (nhấn 1 lần qua 2 từ).
  const [frozenCards] = useState(() => cards);
  const [frozenAllCards] = useState(() => allCards);

  const total = frozenCards.length;
  const current = frozenCards[index];

  if (mode === "matching") {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
        <div className="mb-4 flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Thoát
          </button>
          <h2 className="text-sm font-semibold">🧩 Ghép cặp</h2>
        </div>
        <MatchingGameLauncher deckId={deckId} cards={frozenAllCards} />
      </div>
    );
  }

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = frozenAllCards
      .filter((c) => c.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [current, ...distractors];
  }, [current, frozenAllCards]);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!current) return;
    haptic(isCorrect ? "success" : "fail");
    const rating = isCorrect ? 3 : 1;
    try {
      await submit.mutateAsync({ cardId: current.id, rating, timeTakenMs: 0 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi gửi review");
    }
    if (isCorrect) setCorrect((c) => c + 1);
    setTimeout(() => {
      if (index + 1 >= total) setDone(true);
      else setIndex(index + 1);
    }, 900);
  };

  useEffect(() => {
    setDone(false);
    setIndex(0);
    setCorrect(0);
  }, [mode]);

  if (done) {
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    return (
      <div className="container mx-auto max-w-xl p-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold">Hoàn thành quiz!</h2>
        <p className="mb-6 text-muted-foreground">
          Đúng {correct}/{total} ({pct}%)
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onExit}>
            Chọn chế độ khác
          </Button>
          <Link href={`/decks/${deckId}`}>
            <Button>Về deck</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center p-6">
      <div className="mb-4 w-full">
        <div className="mb-2 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Thoát
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            {reverseActive ? (
              <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                Việt → Anh
              </span>
            ) : null}
            <span>
              {index + 1} / {total}
            </span>
          </div>
        </div>
        <Progress value={index + 1} max={total} />
      </div>

      <div className="my-6 flex w-full justify-center">
        {mode === "multiple-choice" ? (
          <MultipleChoice
            key={current.id}
            question={current}
            options={options}
            direction={direction}
            onAnswer={handleAnswer}
          />
        ) : mode === "typing" ? (
          <TypingQuiz
            key={current.id}
            question={current}
            direction={direction}
            onAnswer={(c) => handleAnswer(c)}
          />
        ) : mode === "gap-fill" ? (
          <GapFillQuiz key={current.id} question={current} onAnswer={(c) => handleAnswer(c)} />
        ) : mode === "word-formation" ? (
          <WordFormationQuiz
            key={current.id}
            question={current}
            onAnswer={(c) => handleAnswer(c)}
          />
        ) : (
          <ListeningQuiz key={current.id} question={current} onAnswer={handleAnswer} />
        )}
      </div>
    </div>
  );
}
