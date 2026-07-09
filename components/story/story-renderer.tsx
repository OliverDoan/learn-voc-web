"use client";

import { useMemo, useState } from "react";
import { Volume2, X } from "lucide-react";
import { parseStory } from "@/lib/story-parser";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { useAllWords } from "@/hooks/use-cards";

interface StoryRendererProps {
  content: string;
  showMeanings?: boolean;
  hideWords?: boolean;
  /** Tập từ được đánh dấu sao (viết thường) — tô màu khác để nổi bật. */
  favoriteWords?: ReadonlySet<string>;
  className?: string;
}

export function StoryRenderer({
  content,
  showMeanings = false,
  hideWords = false,
  favoriteWords,
  className,
}: StoryRendererProps) {
  const tokens = parseStory(content);
  const [opened, setOpened] = useState<number | null>(null);
  // Hướng mở tooltip: mặc định lên trên, tự lật xuống dưới khi phía trên thiếu chỗ.
  const [below, setBelow] = useState(false);

  const toggleTooltip = (i: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (opened === i) {
      setOpened(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    // Cần ~140px phía trên cho tooltip; không đủ (gần đỉnh màn hình/khung) → mở xuống.
    setBelow(rect.top < 140);
    setOpened(i);
  };

  // Map từ (viết thường) → từ loại, lấy từ toàn bộ thẻ (query đã cache dùng chung).
  const { data: allWords } = useAllWords();
  const posMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of allWords ?? []) {
      const pos = c.partOfSpeech?.trim();
      if (pos) map.set(c.word.trim().toLowerCase(), pos);
    }
    return map;
  }, [allWords]);

  return (
    <div
      className={cn(
        "font-serif whitespace-pre-wrap text-[19px] leading-[2] text-[#252525] dark:text-foreground",
        className,
      )}
    >
      {tokens.map((tok, i) => {
        if (tok.type === "text") {
          return <span key={i}>{tok.text}</span>;
        }
        const open = opened === i;
        // Từ được đánh dấu sao → tô màu amber thay vì xanh để nổi bật.
        const fav = !!favoriteWords && favoriteWords.has(tok.word.trim().toLowerCase());
        return (
          <span key={i} className="relative inline-block align-baseline">
            <button
              type="button"
              onClick={(e) => toggleTooltip(i, e)}
              className={cn(
                "font-sans font-semibold transition-colors",
                hideWords
                  ? cn(
                      // leading-none + py nhỏ để ô ôm gọn chữ, không dính ô của dòng trên/dưới
                      "mx-1 inline-block rounded-md px-2.5 py-1 align-baseline leading-none text-transparent",
                      fav ? "bg-amber-400/25" : "bg-primary/15",
                    )
                  : cn(
                      "rounded-md px-1.5 text-[0.9em]",
                      fav ? "text-amber-600 dark:text-amber-400" : "text-primary",
                      fav
                        ? open
                          ? "bg-amber-400/25 [border-bottom:2px_solid_rgb(245,158,11)]"
                          : "bg-amber-400/15 [border-bottom:2px_solid_rgba(245,158,11,.5)]"
                        : open
                          ? "bg-primary/15 [border-bottom:2px_solid_var(--primary)]"
                          : "bg-primary/10 [border-bottom:2px_solid_rgba(23,61,201,.4)]",
                    ),
              )}
              aria-label={`${tok.word} — ${tok.meaning}${fav ? " (yêu thích)" : ""}`}
            >
              {hideWords ? "___" : tok.word}
            </button>
            {showMeanings && !hideWords ? (
              <span className="font-sans ml-1 text-xs text-muted-foreground">({tok.meaning})</span>
            ) : null}
            {open ? (
              <span
                className={cn(
                  "font-sans absolute left-1/2 z-20 -translate-x-1/2 whitespace-normal rounded-2xl px-4 py-3 text-left text-white shadow-[0_18px_40px_rgba(0,13,139,.4)]",
                  below ? "top-[calc(100%+12px)]" : "bottom-[calc(100%+12px)]",
                )}
                style={{ minWidth: 220, background: "#00004F" }}
              >
                <button
                  type="button"
                  onClick={() => setOpened(null)}
                  className="absolute right-2 top-2 rounded p-0.5 text-white/60 hover:bg-white/10"
                  aria-label="Đóng"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="flex items-center gap-2 pr-5">
                  <span className="text-base font-bold">{tok.word}</span>
                  {posMap.get(tok.word.trim().toLowerCase()) ? (
                    <span className="text-xs font-medium italic text-[#9cc2ff]">
                      {posMap.get(tok.word.trim().toLowerCase())}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(tok.word);
                    }}
                    className="ml-auto text-[#9cc2ff] hover:opacity-80"
                    aria-label="Phát âm"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </span>
                <span className="mt-1.5 block text-[15px] font-semibold text-[#dde6ff]">
                  {tok.meaning}
                </span>
                {/* mũi tên — chỉ xuống khi tooltip ở trên, chỉ lên khi ở dưới */}
                <span
                  className={cn(
                    "absolute left-1/2 h-0 w-0 -translate-x-1/2",
                    below ? "bottom-full" : "top-full",
                  )}
                  style={
                    below
                      ? {
                          borderLeft: "8px solid transparent",
                          borderRight: "8px solid transparent",
                          borderBottom: "9px solid #00004F",
                        }
                      : {
                          borderLeft: "8px solid transparent",
                          borderRight: "8px solid transparent",
                          borderTop: "9px solid #00004F",
                        }
                  }
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
