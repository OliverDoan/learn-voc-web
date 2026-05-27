"use client";

import { useState } from "react";
import { Volume2, X } from "lucide-react";
import { parseStory } from "@/lib/story-parser";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div className={cn("leading-loose whitespace-pre-wrap text-lg", className)}>
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
                "px-0.5 font-semibold transition-colors",
                hideWords
                  ? "rounded-md bg-primary/20 px-2 text-transparent underline decoration-primary decoration-wavy"
                  : "text-primary border-b border-dotted border-primary/70 hover:bg-primary/10",
              )}
              aria-label={`${tok.word} — ${tok.meaning}`}
            >
              {hideWords ? "___" : tok.word}
            </button>
            {showMeanings && !hideWords ? (
              <span className="ml-1 text-xs text-muted-foreground">({tok.meaning})</span>
            ) : null}
            {open ? (
              <span
                className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-normal rounded-md border bg-popover px-3 py-2 text-sm shadow-lg"
                style={{ minWidth: 200 }}
              >
                <button
                  type="button"
                  onClick={() => setOpened(null)}
                  className="absolute right-1 top-1 rounded p-0.5 hover:bg-muted"
                  aria-label="Đóng"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="pr-4 font-semibold">{tok.word}</div>
                <div className="text-muted-foreground">{tok.meaning}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(tok.word);
                  }}
                >
                  <Volume2 className="h-3 w-3" /> Phát âm
                </Button>
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
