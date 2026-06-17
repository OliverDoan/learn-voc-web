"use client";

import { useState } from "react";
import { Volume2, X } from "lucide-react";
import { parseStory } from "@/lib/story-parser";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";

interface StoryRendererProps {
  content: string;
  showMeanings?: boolean;
  hideWords?: boolean;
  className?: string;
}

export function StoryRenderer({
  content,
  showMeanings = false,
  hideWords = false,
  className,
}: StoryRendererProps) {
  const tokens = parseStory(content);
  const [opened, setOpened] = useState<number | null>(null);

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
        return (
          <span key={i} className="relative inline-block align-baseline">
            <button
              type="button"
              onClick={() => setOpened(open ? null : i)}
              className={cn(
                "font-sans font-semibold transition-colors",
                hideWords
                  ? "mx-0.5 rounded-md bg-primary/15 px-2 text-transparent underline decoration-primary decoration-wavy"
                  : cn(
                      "rounded-md px-1.5 text-[0.9em] text-primary",
                      open
                        ? "bg-primary/15 [border-bottom:2px_solid_var(--primary)]"
                        : "bg-primary/10 [border-bottom:2px_solid_rgba(23,61,201,.4)]",
                    ),
              )}
              aria-label={`${tok.word} — ${tok.meaning}`}
            >
              {hideWords ? "___" : tok.word}
            </button>
            {showMeanings && !hideWords ? (
              <span className="font-sans ml-1 text-xs text-muted-foreground">({tok.meaning})</span>
            ) : null}
            {open ? (
              <span
                className="font-sans absolute bottom-[calc(100%+12px)] left-1/2 z-10 -translate-x-1/2 whitespace-normal rounded-2xl px-4 py-3 text-left text-white shadow-[0_18px_40px_rgba(0,13,139,.4)]"
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
                {/* arrow */}
                <span
                  className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2"
                  style={{
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "9px solid #00004F",
                  }}
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
