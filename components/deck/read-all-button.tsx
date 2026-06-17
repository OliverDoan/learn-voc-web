"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Languages,
  Loader2,
  Repeat,
  Repeat2,
  Settings2,
  Square,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  unlearned: "voca-readall-unlearned",
  repeatWord: "voca-readall-repeat-word",
  englishOnly: "voca-readall-english-only",
};

/**
 * Phát lần lượt thẻ trong deck: đọc từ tiếng Anh → nghĩa tiếng Việt.
 * Tuỳ chọn: tốc độ đọc, lặp lại, chỉ đọc từ chưa thuộc.
 */
export function ReadAllButton({ cards }: ReadAllButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  const [rate, setRate] = useState(0.95);
  const [loop, setLoop] = useState(false);
  const [onlyUnlearned, setOnlyUnlearned] = useState(false);
  const [repeatWord, setRepeatWord] = useState(false);
  const [englishOnly, setEnglishOnly] = useState(false);

  // Refs để vòng lặp phát đọc thấy giá trị mới nhất khi đổi tuỳ chọn giữa chừng
  const cancelRef = useRef(false);
  const rateRef = useRef(rate);
  const loopRef = useRef(loop);
  const repeatWordRef = useRef(repeatWord);
  const englishOnlyRef = useRef(englishOnly);
  const panelRef = useRef<HTMLDivElement>(null);

  rateRef.current = rate;
  loopRef.current = loop;
  repeatWordRef.current = repeatWord;
  englishOnlyRef.current = englishOnly;

  // Khôi phục tuỳ chọn đã lưu
  useEffect(() => {
    const r = Number(localStorage.getItem(LS.rate));
    if (SPEEDS.some((s) => s.value === r)) setRate(r);
    setLoop(localStorage.getItem(LS.loop) === "1");
    setOnlyUnlearned(localStorage.getItem(LS.unlearned) === "1");
    setRepeatWord(localStorage.getItem(LS.repeatWord) === "1");
    setEnglishOnly(localStorage.getItem(LS.englishOnly) === "1");
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
  const toggleUnlearned = () => {
    setOnlyUnlearned((p) => {
      localStorage.setItem(LS.unlearned, !p ? "1" : "0");
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

  const stop = () => {
    cancelRef.current = true;
    stopSpeaking();
    setPlaying(false);
  };

  const start = async () => {
    const playlist = onlyUnlearned
      ? cards.filter((c) => c.state !== "MATURE")
      : cards;

    if (playlist.length === 0) {
      toast.info(
        onlyUnlearned ? "Không còn từ nào chưa thuộc để đọc." : "Deck chưa có từ nào.",
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
        await speakAsync(card.word, "en-US", rateRef.current);
        if (cancelRef.current) break;
        if (repeatWordRef.current) {
          await delay(200);
          if (cancelRef.current) break;
          await speakAsync(card.word, "en-US", rateRef.current);
          if (cancelRef.current) break;
        }
        await delay(250);
        if (cancelRef.current) break;

        // Đọc nghĩa tiếng Việt (bỏ qua nếu chỉ đọc tiếng Anh)
        if (!englishOnlyRef.current) {
          await speakAsync(card.meaning, "vi-VN", rateRef.current);
          if (cancelRef.current) break;
          await delay(450);
        } else {
          await delay(250);
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
            onClick={toggleUnlearned}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-accent"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                onlyUnlearned
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input",
              )}
            >
              {onlyUnlearned ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span>Chỉ đọc từ chưa thuộc</span>
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
        </div>
      ) : null}
    </div>
  );
}
