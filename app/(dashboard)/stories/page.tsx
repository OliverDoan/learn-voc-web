"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Eye,
  EyeOff,
  Library,
  Play,
  Square,
  Target,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryRenderer } from "@/components/story/story-renderer";
import { ReadingSpeedControl } from "@/components/story/reading-speed-control";
import { useStories } from "@/hooks/use-stories";
import { useReadingRate } from "@/hooks/use-reading-rate";
import { countWordTokens, parseStory } from "@/lib/story-parser";
import { isSpeakable, speakAsync, stopSpeaking } from "@/lib/tts";
import { cn } from "@/lib/utils";
import type { StoryListItem } from "@/lib/types";

// Lấy số thứ tự Unit từ tên deck ("Unit 10: ..." → 10) để sắp xếp theo mạch.
function unitOrder(name: string): number {
  const match = name.match(/unit\s*(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export default function AllStoriesPage() {
  const { data: stories, isLoading } = useStories();
  const [showMeanings, setShowMeanings] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  // index của truyện đang được đọc to (null = không đọc)
  const [readingIndex, setReadingIndex] = useState<number | null>(null);
  // "Thẻ phiên đọc": mỗi lần bắt đầu đọc tăng 1; vòng lặp cũ tự thoát khi không còn khớp
  const genRef = useRef(0);
  const { rate, setRate } = useReadingRate();
  // Ref để vòng đọc đang chạy luôn thấy tốc độ mới nhất khi người dùng đổi giữa chừng
  const rateRef = useRef(rate);
  rateRef.current = rate;

  // Dừng đọc khi rời trang
  useEffect(
    () => () => {
      genRef.current += 1;
      stopSpeaking();
    },
    [],
  );

  // Sắp xếp theo số Unit, rồi theo thời gian tạo cho ổn định
  const sorted = useMemo<StoryListItem[]>(() => {
    if (!stories) return [];
    return [...stories].sort((a, b) => {
      const diff = unitOrder(a.deck.name) - unitOrder(b.deck.name);
      if (diff !== 0) return diff;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [stories]);

  const totalWords = useMemo(
    () => sorted.reduce((sum, s) => sum + countWordTokens(s.content), 0),
    [sorted],
  );

  const stopReading = () => {
    genRef.current += 1; // vô hiệu hoá vòng đọc hiện tại
    stopSpeaking();
    setReadingIndex(null);
  };

  // Đọc liền mạch từ truyện thứ `start` đến hết: văn tiếng Việt (vi-VN) + từ chêm (en-US)
  const readFrom = async (start: number) => {
    stopSpeaking(); // ngắt mọi giọng đang phát trước khi bắt đầu phiên mới
    const gen = (genRef.current += 1);
    const alive = () => genRef.current === gen;

    for (let i = start; i < sorted.length; i++) {
      if (!alive()) return;
      setReadingIndex(i);
      document
        .getElementById(`story-${sorted[i].id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });

      // Đọc tên truyện trước cho dễ theo dõi
      await speakAsync(sorted[i].title, "vi-VN", rateRef.current);
      if (!alive()) return;

      for (const tok of parseStory(sorted[i].content)) {
        if (!alive()) return;
        if (tok.type === "text") {
          const text = tok.text.trim();
          if (isSpeakable(text)) await speakAsync(text, "vi-VN", rateRef.current);
        } else {
          await speakAsync(tok.word, "en-US", rateRef.current);
        }
      }
    }
    if (alive()) setReadingIndex(null);
  };

  const handleToggleReadAll = () => {
    if (readingIndex !== null) {
      stopReading();
      return;
    }
    void readFrom(0);
  };

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-28">
      <div className="mb-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Library className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Tất cả truyện chêm</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đọc liền mạch toàn bộ truyện của các deck trong một lần
        </p>
        {!isLoading && sorted.length > 0 ? (
          <div className="font-mono mt-2 text-[13px] uppercase tracking-wider text-muted-foreground">
            {sorted.length} truyện · {totalWords} từ chêm
          </div>
        ) : null}
      </div>

      {/* Thanh điều khiển dính ở đầu trang */}
      <div className="sticky top-2 z-20 mb-6 flex flex-wrap justify-center gap-2 rounded-full border bg-card/95 p-2 shadow-sm backdrop-blur">
        <Button
          variant={readingIndex !== null ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={handleToggleReadAll}
          disabled={isLoading || sorted.length === 0}
        >
          {readingIndex !== null ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          {readingIndex !== null ? "Dừng" : "Đọc to toàn bộ"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setShowMeanings((v) => !v)}
        >
          {showMeanings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showMeanings ? "Ẩn nghĩa" : "Hiện nghĩa"}
        </Button>
        <Button
          variant={hideWords ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setHideWords((v) => !v)}
        >
          <Target className="h-4 w-4" />
          {hideWords ? "Hiện từ" : "Ẩn từ chêm"}
        </Button>
        <ReadingSpeedControl rate={rate} onChange={setRate} />
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Đang tải...</p>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có truyện chêm nào. Hãy tạo truyện trong từng deck.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {sorted.map((story, i) => {
            const reading = readingIndex === i;
            return (
              <article
                key={story.id}
                id={`story-${story.id}`}
                className={cn(
                  "scroll-mt-24 rounded-2xl border bg-card p-6 shadow-[0_24px_64px_rgba(0,13,139,.08)] transition-shadow md:px-10",
                  reading && "ring-2 ring-primary",
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/decks/${story.deck.id}`}
                    className="truncate text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    {story.deck.name}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    aria-label={reading ? "Dừng đọc" : "Đọc từ truyện này"}
                    onClick={() => (reading ? stopReading() : void readFrom(i))}
                  >
                    {reading ? (
                      <Square className="h-4 w-4 fill-current text-primary" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {story.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="mb-5 max-h-[300px] w-full rounded-xl object-cover shadow-md"
                  />
                ) : null}

                <div className="mb-4 text-center">
                  <Link href={`/stories/${story.id}`}>
                    <h2 className="text-2xl font-bold tracking-tight hover:text-primary">
                      {story.title}
                    </h2>
                  </Link>
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {story._count.storyCards} từ
                  </Badge>
                </div>

                <StoryRenderer
                  content={story.content}
                  showMeanings={showMeanings}
                  hideWords={hideWords}
                />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
