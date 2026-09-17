"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Expand,
  Eye,
  EyeOff,
  Plus,
  Square,
  Target,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { StoryRenderer } from "@/components/story/story-renderer";
import { StoryFullscreenReader } from "@/components/story/story-fullscreen-reader";
import { ReadingSpeedControl } from "@/components/story/reading-speed-control";
import { useStories } from "@/hooks/use-stories";
import { useFavorites } from "@/hooks/use-cards";
import { useStoryReader } from "@/hooks/use-story-reader";

interface DeckStoryPanelProps {
  deckId: string;
  /** Gọn: chỉ giữ chức năng đọc, ẩn các nút "Nghĩa" và "Ẩn từ chêm". */
  compact?: boolean;
}

/**
 * Panel truyện chêm hiển thị ngay trong cột phải của trang deck:
 * ảnh nhỏ phía trên, nút đọc (Anh / Việt), nội dung có highlight từ chêm,
 * và nút chuyển giữa các truyện của deck.
 */
export function DeckStoryPanel({ deckId, compact = false }: DeckStoryPanelProps) {
  const { data: stories, isLoading } = useStories(deckId);
  const { data: favorites } = useFavorites();
  const { readMode, toggleRead, stopReading, rate, setRate } = useStoryReader();

  // Truyện đang xem trong panel (index trong danh sách của deck).
  const [index, setIndex] = useState(0);
  const [showMeanings, setShowMeanings] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  // Mở trình đọc toàn màn hình (tiện cho điện thoại).
  const [fullscreen, setFullscreen] = useState(false);

  const favoriteWords = useMemo(
    () => new Set((favorites ?? []).map((c) => c.word.trim().toLowerCase())),
    [favorites],
  );

  const total = stories?.length ?? 0;
  // Kẹp index trong khoảng hợp lệ khi danh sách đổi.
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const story = stories?.[safeIndex];

  const goPrev = () => {
    stopReading();
    setIndex((i) => (i - 1 + total) % total);
  };
  const goNext = () => {
    stopReading();
    setIndex((i) => (i + 1) % total);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border border-dashed py-8">
        <BookOpenText className="h-5 w-5 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  // Chưa có truyện: ô mời tạo.
  if (!story) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpenText className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">Chưa có truyện chêm</p>
          <p className="text-sm text-muted-foreground">Học từ qua ngữ cảnh với truyện chêm.</p>
        </div>
        <Link href={`/decks/${deckId}/stories/new`}>
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tạo truyện
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Ảnh phía trên — hiện đầy đủ theo tỉ lệ gốc, không cắt */}
      {story.imageUrl ? (
        <ImageLightbox
          src={story.imageUrl}
          alt={story.title}
          className="w-full shrink-0 rounded-none border-b"
          imgClassName="h-auto w-full object-contain"
        />
      ) : null}

      {/* Tiêu đề (nhấn để mở trang đọc đầy đủ) + nút đọc to + chuyển truyện */}
      <div className={cn("flex items-start justify-between gap-2 px-4 pt-3", compact && "pb-3")}>
        <Link href={`/stories/${story.id}`} className="group min-w-0" title="Mở trang đọc đầy đủ">
          <h3 className="truncate font-semibold leading-tight group-hover:text-primary group-hover:underline">
            {story.title}
          </h3>
          {total > 1 ? (
            <p className="font-mono mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              Truyện {safeIndex + 1}/{total}
            </p>
          ) : null}
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              stopReading();
              setFullscreen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Đọc toàn màn hình"
            title="Đọc toàn màn hình"
          >
            <Expand className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleRead(story.content, "mixed")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              readMode === "mixed"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-label={readMode === "mixed" ? "Dừng đọc" : "Đọc to"}
            title={readMode === "mixed" ? "Dừng" : "Đọc to"}
          >
            {readMode === "mixed" ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Truyện trước"
                title="Truyện trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Truyện sau"
                title="Truyện sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Thanh điều khiển phụ — chỉ ở chế độ đầy đủ (không phải trong deck) */}
      {!compact ? (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3 pt-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-2.5 text-xs"
            onClick={() => setShowMeanings((v) => !v)}
          >
            {showMeanings ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showMeanings ? "Ẩn nghĩa" : "Nghĩa"}
          </Button>
          <Button
            variant={hideWords ? "default" : "outline"}
            size="sm"
            className="h-7 rounded-full px-2.5 text-xs"
            onClick={() => setHideWords((v) => !v)}
          >
            <Target className="h-3.5 w-3.5" />
            {hideWords ? "Hiện" : "Ẩn từ"}
          </Button>
          <ReadingSpeedControl rate={rate} onChange={setRate} />
        </div>
      ) : null}

      {/* Nội dung truyện — cuộn riêng khi dài */}
      <div className="flex-1 overflow-y-auto border-t px-4 py-4">
        <StoryRenderer
          content={story.content}
          showMeanings={showMeanings}
          hideWords={hideWords}
          favoriteWords={favoriteWords}
          className="text-[15px] leading-8"
        />
      </div>

      {fullscreen ? (
        <StoryFullscreenReader
          stories={stories ?? []}
          index={safeIndex}
          onNavigate={setIndex}
          onClose={() => setFullscreen(false)}
          favoriteWords={favoriteWords}
        />
      ) : null}
    </div>
  );
}
