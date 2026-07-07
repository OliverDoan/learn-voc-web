"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Languages,
  Loader2,
  Repeat,
  Repeat2,
  Settings2,
  Square,
  Star,
  Tag,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, posToVietnamese } from "@/lib/utils";
import { speakAsync, stopSpeaking } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface ReadAllButtonProps {
  cards: Card[];
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const SPEEDS = [
  { label: "Chậm", value: 0.7 },
  { label: "Vừa", value: 0.95 },
  { label: "Nhanh", value: 1.2 },
] as const;

const LS = {
  rate: "voca-readall-rate",
  loop: "voca-readall-loop",
  favorite: "voca-readall-favorite",
  repeatWord: "voca-readall-repeat-word",
  englishOnly: "voca-readall-english-only",
  vietnameseFirst: "voca-readall-vietnamese-first",
  readPos: "voca-readall-read-pos",
};

/**
 * Phát lần lượt thẻ trong deck: đọc từ tiếng Anh → nghĩa tiếng Việt
 * (hoặc đảo lại: tiếng Việt → tiếng Anh nếu bật "Đọc tiếng Việt trước").
 * Tuỳ chọn: tốc độ đọc, lặp lại, chỉ đọc từ đánh dấu sao, chỉ đọc tiếng Anh.
 */
export function ReadAllButton({ cards }: ReadAllButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  const [rate, setRate] = useState(0.95);
  const [loop, setLoop] = useState(false);
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [repeatWord, setRepeatWord] = useState(false);
  const [englishOnly, setEnglishOnly] = useState(false);
  const [vietnameseFirst, setVietnameseFirst] = useState(false);
  const [readPos, setReadPos] = useState(false);

  // Refs để vòng lặp phát đọc thấy giá trị mới nhất khi đổi tuỳ chọn giữa chừng
  const cancelRef = useRef(false);
  const rateRef = useRef(rate);
  const loopRef = useRef(loop);
  const repeatWordRef = useRef(repeatWord);
  const englishOnlyRef = useRef(englishOnly);
  const vietnameseFirstRef = useRef(vietnameseFirst);
  const readPosRef = useRef(readPos);
  const panelRef = useRef<HTMLDivElement>(null);

  rateRef.current = rate;
  loopRef.current = loop;
  repeatWordRef.current = repeatWord;
  englishOnlyRef.current = englishOnly;
  vietnameseFirstRef.current = vietnameseFirst;
  readPosRef.current = readPos;

  // Khôi phục tuỳ chọn đã lưu
  useEffect(() => {
    const r = Number(localStorage.getItem(LS.rate));
    if (SPEEDS.some((s) => s.value === r)) setRate(r);
    setLoop(localStorage.getItem(LS.loop) === "1");
    setOnlyFavorite(localStorage.getItem(LS.favorite) === "1");
    setRepeatWord(localStorage.getItem(LS.repeatWord) === "1");
    setEnglishOnly(localStorage.getItem(LS.englishOnly) === "1");
    setVietnameseFirst(localStorage.getItem(LS.vietnameseFirst) === "1");
    setReadPos(localStorage.getItem(LS.readPos) === "1");
  }, []);

  // Cleanup khi rời trang
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      stopSpeaking();
    };
  }, []);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    if (!showOptions) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showOptions]);

  const setRatePersist = (v: number) => {
    setRate(v);
    localStorage.setItem(LS.rate, String(v));
  };
  const toggleLoop = () => {
    setLoop((p) => {
      localStorage.setItem(LS.loop, !p ? "1" : "0");
      return !p;
    });
  };
  const toggleFavorite = () => {
    setOnlyFavorite((p) => {
      localStorage.setItem(LS.favorite, !p ? "1" : "0");
      return !p;
    });
  };
  const toggleRepeatWord = () => {
    setRepeatWord((p) => {
      localStorage.setItem(LS.repeatWord, !p ? "1" : "0");
      return !p;
    });
  };
  const toggleEnglishOnly = () => {
    setEnglishOnly((p) => {
      localStorage.setItem(LS.englishOnly, !p ? "1" : "0");
      return !p;
    });
  };
  const toggleVietnameseFirst = () => {
    setVietnameseFirst((p) => {
      localStorage.setItem(LS.vietnameseFirst, !p ? "1" : "0");
      return !p;
    });
  };
  const toggleReadPos = () => {
    setReadPos((p) => {
      localStorage.setItem(LS.readPos, !p ? "1" : "0");
      return !p;
    });
  };

  const stop = () => {
    cancelRef.current = true;
    stopSpeaking();
    setPlaying(false);
  };

  const start = async () => {
    const playlist = onlyFavorite
      ? cards.filter((c) => c.favorite)
      : cards;

    if (playlist.length === 0) {
      toast.info(
        onlyFavorite ? "Chưa có từ nào được đánh dấu sao để đọc." : "Deck chưa có từ nào.",
      );
      return;
    }

    cancelRef.current = false;
    setShowOptions(false);
    setCount(playlist.length);
    setPlaying(true);

    do {
      for (let i = 0; i < playlist.length; i++) {
        if (cancelRef.current) break;
        setIndex(i);
        const card = playlist[i];

        // Đọc từ tiếng Anh (lặp 2 lần nếu bật)
        const speakEnglish = async () => {
          await speakAsync(card.word, "en-US", rateRef.current);
          if (cancelRef.current) return;
          if (repeatWordRef.current) {
            await delay(200);
            if (cancelRef.current) return;
            await speakAsync(card.word, "en-US", rateRef.current);
          }
        };

        // Đọc nghĩa tiếng Việt (kèm từ loại nếu bật, vd "danh từ, quả táo")
        const speakVietnamese = async () => {
          const posVi = readPosRef.current ? posToVietnamese(card.partOfSpeech) : "";
          const text = posVi ? `${posVi}, ${card.meaning}` : card.meaning;
          await speakAsync(text, "vi-VN", rateRef.current);
        };

        if (englishOnlyRef.current) {
          // Chỉ đọc tiếng Anh
          await speakEnglish();
          if (cancelRef.current) break;
          await delay(250);
        } else if (vietnameseFirstRef.current) {
          // Đọc tiếng Việt trước → tiếng Anh
          await speakVietnamese();
          if (cancelRef.current) break;
          await delay(250);
          await speakEnglish();
          if (cancelRef.current) break;
          await delay(450);
        } else {
          // Mặc định: tiếng Anh trước → tiếng Việt
          await speakEnglish();
          if (cancelRef.current) break;
          await delay(250);
          await speakVietnamese();
          if (cancelRef.current) break;
          await delay(450);
        }
      }
    } while (!cancelRef.current && loopRef.current);

    if (!cancelRef.current) setPlaying(false);
  };

  if (cards.length === 0) return null;

  return (
    <div ref={panelRef} className="relative flex items-center gap-1">
      {playing ? (
        <Button
          variant="default"
          className="rounded-full shadow-[0_8px_20px_rgba(23,61,201,.28)]"
          onClick={stop}
          title="Dừng đọc"
        >
          <Square className="h-4 w-4 fill-current" />
          <span className="tabular-nums">
            {index + 1}/{count}
          </span>
          {loop ? <Repeat className="h-3.5 w-3.5" /> : null}
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        </Button>
      ) : (
        <Button
          variant="outline"
          className="rounded-full"
          onClick={start}
          title="Đọc toàn bộ từ trong deck"
        >
          <Volume2 className="h-4 w-4" />
          Đọc tất cả
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setShowOptions((s) => !s)}
        aria-label="Tuỳ chọn đọc"
        title="Tuỳ chọn đọc"
      >
        <Settings2 className="h-4 w-4" />
      </Button>

      {showOptions ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border bg-popover p-3 shadow-lg">
          <div className="mb-1.5 text-xs font-semibold text-muted-foreground">Tốc độ đọc</div>
          <div className="flex gap-1.5">
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setRatePersist(s.value)}
                className={cn(
                  "flex-1 rounded-full border px-2 py-1.5 text-xs font-medium transition-colors",
                  rate === s.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleLoop}
            className="mt-3 flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-accent"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                loop ? "border-primary bg-primary text-primary-foreground" : "border-input",
              )}
            >
              {loop ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <span>Lặp lại</span>
          </button>

          <button
            type="button"
            onClick={toggleFavorite}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-accent"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                onlyFavorite
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input",
              )}
            >
              {onlyFavorite ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <Star className="h-4 w-4 text-muted-foreground" />
            <span>Chỉ đọc từ đánh dấu sao</span>
          </button>

          <div className="my-2 h-px bg-border" />

          <button
            type="button"
            onClick={toggleRepeatWord}
            className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-accent"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                repeatWord
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input",
              )}
            >
              {repeatWord ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <Repeat2 className="h-4 w-4 text-muted-foreground" />
            <span>Đọc mỗi từ 2 lần</span>
          </button>

          <button
            type="button"
            onClick={toggleEnglishOnly}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-accent"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                englishOnly
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input",
              )}
            >
              {englishOnly ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <Languages className="h-4 w-4 text-muted-foreground" />
            <span>Chỉ đọc tiếng Anh</span>
          </button>

          <button
            type="button"
            onClick={toggleVietnameseFirst}
            disabled={englishOnly}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                vietnameseFirst && !englishOnly
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input",
              )}
            >
              {vietnameseFirst && !englishOnly ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <span>Đọc tiếng Việt trước</span>
          </button>

          <button
            type="button"
            onClick={toggleReadPos}
            disabled={englishOnly}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                readPos && !englishOnly
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input",
              )}
            >
              {readPos && !englishOnly ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span>Đọc kèm từ loại</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
