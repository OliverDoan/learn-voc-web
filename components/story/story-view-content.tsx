"use client";

import { useMemo } from "react";
import { StoryRenderer } from "@/components/story/story-renderer";
import { StoryProse } from "@/components/story/story-prose";
import { toVietnamese } from "@/lib/story-parser";
import { highlightEnglish } from "@/lib/story-english";
import type { StoryViewMode } from "@/lib/story-view";

interface StoryViewContentProps {
  /** Chế độ đã qua `resolveStoryViewMode` (English chỉ khi có bản tiếng Anh). */
  mode: StoryViewMode;
  content: string;
  contentEn: string | null | undefined;
  showMeanings?: boolean;
  hideWords?: boolean;
  favoriteWords?: ReadonlySet<string>;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Nội dung truyện theo chế độ: chêm / full tiếng Việt / full tiếng Anh. Bản tiếng Anh
 * được tô sáng các từ vựng của truyện (bấm xem nghĩa như chêm).
 */
export function StoryViewContent({
  mode,
  content,
  contentEn,
  showMeanings,
  hideWords,
  favoriteWords,
  className,
  style,
}: StoryViewContentProps) {
  const enTokens = useMemo(
    () => (mode === "en" && contentEn ? highlightEnglish(contentEn, content) : null),
    [mode, contentEn, content],
  );

  if (enTokens) {
    return (
      <StoryRenderer
        content={content}
        tokens={enTokens}
        showMeanings={showMeanings}
        hideWords={hideWords}
        favoriteWords={favoriteWords}
        className={className}
        style={style}
      />
    );
  }
  if (mode === "vi") {
    return <StoryProse text={toVietnamese(content)} className={className} style={style} />;
  }
  return (
    <StoryRenderer
      content={content}
      showMeanings={showMeanings}
      hideWords={hideWords}
      favoriteWords={favoriteWords}
      className={className}
      style={style}
    />
  );
}
