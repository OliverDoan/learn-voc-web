"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHINESE_TTS_LANG } from "@/lib/chinese";
import type { ChineseReading, ReadingLine } from "@/lib/chinese-readings";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";

interface ReadingViewProps {
  reading: ChineseReading;
}

const READ_RATE = 0.85;

const playLine = (l: ReadingLine) => speak(l.tts ?? l.hanzi, CHINESE_TTS_LANG, READ_RATE);

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Bài đọc dạng hội thoại: Hán tự, pinyin và nghĩa (bật/tắt), mỗi câu có nút nghe. */
export function ReadingView({ reading }: ReadingViewProps) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ToggleChip active={showPinyin} onClick={() => setShowPinyin((v) => !v)}>
          Pinyin
        </ToggleChip>
        <ToggleChip active={showMeaning} onClick={() => setShowMeaning((v) => !v)}>
          Nghĩa tiếng Việt
        </ToggleChip>
      </div>

      <div className="space-y-6">
        {reading.sections.map((section, s) => (
          <section key={s} className="rounded-2xl border bg-card p-5">
            {section.title ? (
              <h2 lang="zh-CN" className="mb-1 text-center text-lg font-semibold">
                {section.title}
              </h2>
            ) : null}
            {section.note ? (
              <p className="mb-3 text-center text-sm italic text-muted-foreground">
                {section.note}
              </p>
            ) : null}

            <ol className="space-y-3">
              {section.lines.map((l, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    lang="zh-CN"
                    className="mt-1 w-14 shrink-0 text-right text-sm text-muted-foreground"
                  >
                    {l.speaker}：
                  </span>
                  <div className="min-w-0 flex-1">
                    <p lang="zh-CN" className="text-xl leading-snug">
                      {l.hanzi}
                    </p>
                    {showPinyin ? (
                      <p className="font-phonetic text-sm text-primary">{l.pinyin}</p>
                    ) : null}
                    {showMeaning ? (
                      <p className="text-sm text-muted-foreground">{l.vi}</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => playLine(l)}
                    aria-label={`Nghe: ${l.hanzi}`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
