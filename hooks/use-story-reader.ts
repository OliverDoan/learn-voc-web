"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { firstMeaning, parseStory } from "@/lib/story-parser";
import { isSpeakable, speakAsync, stopSpeaking } from "@/lib/tts";
import { useReadingRate } from "@/hooks/use-reading-rate";

/** "mixed" = văn tiếng Việt + từ chêm đọc tiếng Anh; "vi" = đọc toàn bộ bằng tiếng Việt. */
export type StoryReadMode = "mixed" | "vi";

export interface StoryReader {
  /** Chế độ đang đọc, null = đang im lặng. */
  readMode: StoryReadMode | null;
  /** Bật chế độ này, hoặc dừng nếu đang đọc đúng chế độ đó. */
  toggleRead: (content: string, mode: StoryReadMode) => void;
  stopReading: () => void;
  rate: number;
  setRate: (rate: number) => void;
}

/**
 * Đọc to một truyện chêm bằng Web Speech API.
 *
 * Dùng "generation counter": mỗi lần bắt đầu/dừng tăng 1, vòng đọc cũ thấy số
 * khác thì tự thoát — tránh hai truyện đọc chồng lên nhau khi người dùng bấm
 * liên tục hoặc chuyển truyện giữa chừng. Tốc độ đọc giữ trong ref để vòng
 * đang chạy luôn thấy giá trị mới nhất.
 */
export function useStoryReader(): StoryReader {
  const [readMode, setReadMode] = useState<StoryReadMode | null>(null);
  const genRef = useRef(0);
  const { rate, setRate } = useReadingRate();
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const stopReading = useCallback(() => {
    genRef.current += 1;
    stopSpeaking();
    setReadMode(null);
  }, []);

  // Dừng phát âm khi component dùng hook bị gỡ (không đụng state vì đang unmount).
  useEffect(
    () => () => {
      genRef.current += 1;
      stopSpeaking();
    },
    [],
  );

  const toggleRead = useCallback(
    (content: string, mode: StoryReadMode) => {
      if (readMode === mode) {
        stopReading();
        return;
      }
      const gen = (genRef.current += 1);
      const alive = () => genRef.current === gen;
      stopSpeaking();
      setReadMode(mode);

      void (async () => {
        for (const tok of parseStory(content)) {
          if (!alive()) return;
          if (tok.type === "text") {
            const text = tok.text.trim();
            if (isSpeakable(text)) await speakAsync(text, "vi-VN", rateRef.current);
          } else if (mode === "vi") {
            await speakAsync(firstMeaning(tok.meaning), "vi-VN", rateRef.current);
          } else {
            await speakAsync(tok.word, "en-US", rateRef.current);
          }
        }
        if (alive()) setReadMode(null);
      })();
    },
    [readMode, stopReading],
  );

  return { readMode, toggleRead, stopReading, rate, setRate };
}
