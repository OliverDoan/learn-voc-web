"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Square,
  Target,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StoryViewContent } from "@/components/story/story-view-content";
import { StoryModeToggle } from "@/components/story/story-mode-toggle";
import { ReadingSpeedControl } from "@/components/story/reading-speed-control";
import { useStoryReader, type StoryReadMode } from "@/hooks/use-story-reader";
import {
  DEFAULT_STORY_VIEW_MODE,
  resolveStoryViewMode,
  type StoryViewMode,
} from "@/lib/story-view";
import type { StoryListItem } from "@/lib/types";

/** Cỡ chữ đọc truyện (px) — bước nhảy đủ rõ trên màn hình điện thoại. */
const FONT_SIZES = [15, 17, 19, 22, 25] as const;
const DEFAULT_FONT_INDEX = 1;
const FONT_STORAGE_KEY = "voca-story-reader-font";

/** Cỡ chữ đã lưu lần trước; localStorage hỏng/không hợp lệ → cỡ mặc định. */
function readSavedFontIndex(): number {
  try {
    const raw = localStorage.getItem(FONT_STORAGE_KEY);
    // Chưa lưu gì → raw là null; Number(null) ra 0 nên phải chặn trước khi ép kiểu.
    if (raw !== null && raw !== "") {
      const saved = Number(raw);
      if (Number.isInteger(saved) && saved >= 0 && saved < FONT_SIZES.length) return saved;
    }
  } catch {
    // localStorage bị chặn (chế độ riêng tư) → dùng mặc định
  }
  return DEFAULT_FONT_INDEX;
}

interface StoryFullscreenReaderProps {
  /** Danh sách truyện để lật qua lại (thường là truyện của một deck). */
  stories: readonly StoryListItem[];
  /** Index truyện đang đọc trong `stories`. */
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  favoriteWords?: ReadonlySet<string>;
  /** Chế độ hiển thị (dùng chung với nơi mở trình đọc); bỏ trống → tự quản, mặc định English. */
  viewMode?: StoryViewMode;
  onViewModeChange?: (mode: StoryViewMode) => void;
}

/**
 * Trình đọc truyện chêm TOÀN MÀN HÌNH — dành cho điện thoại: che hết thanh
 * điều hướng, chữ to, chỉ còn nội dung truyện.
 *
 * Esc hoặc nút X để đóng; ←/→ (hoặc nút dưới) để chuyển truyện. Cỡ chữ nhớ
 * trong localStorage cho lần đọc sau.
 */
export function StoryFullscreenReader({
  stories,
  index,
  onNavigate,
  onClose,
  favoriteWords,
  viewMode: viewModeProp,
  onViewModeChange,
}: StoryFullscreenReaderProps) {
  const [showMeanings, setShowMeanings] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  // Đọc cỡ chữ đã lưu ngay khi khởi tạo — component chỉ mount sau khi người dùng
  // bấm mở nên không có rủi ro lệch hydrate với bản render trên server.
  const [fontIndex, setFontIndex] = useState(readSavedFontIndex);
  const { readMode, toggleRead, stopReading, rate, setRate } = useStoryReader();

  const total = stories.length;
  const story = stories[index];
  const [localViewMode, setLocalViewMode] = useState<StoryViewMode>(DEFAULT_STORY_VIEW_MODE);
  const viewMode = viewModeProp ?? localViewMode;
  const mode = resolveStoryViewMode(viewMode, story?.contentEn);
  const readModeForView: StoryReadMode = mode === "cham" ? "mixed" : mode;
  const readText = mode === "en" ? (story?.contentEn ?? "") : (story?.content ?? "");
  const reading = readMode === readModeForView;

  const changeViewMode = (next: StoryViewMode) => {
    stopReading();
    setLocalViewMode(next);
    onViewModeChange?.(next);
  };

  const changeFont = (delta: number) => {
    setFontIndex((prev) => {
      const next = Math.min(FONT_SIZES.length - 1, Math.max(0, prev + delta));
      try {
        localStorage.setItem(FONT_STORAGE_KEY, String(next));
      } catch {
        // bỏ qua lỗi localStorage
      }
      return next;
    });
  };

  // Chuyển truyện: dừng giọng đang đọc để không đọc tiếp truyện cũ.
  const goto = (next: number) => {
    if (total === 0) return;
    stopReading();
    onNavigate((next + total) % total);
  };

  // Phím tắt: Esc đóng, ←/→ chuyển truyện.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goto(index - 1);
      else if (e.key === "ArrowRight") goto(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // goto ổn định theo index/total nên chỉ cần theo dõi 2 giá trị này
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, onClose]);

  // Khóa cuộn nền khi đang mở toàn màn hình.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!story) return null;

  const fontSize = FONT_SIZES[fontIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={`Đọc truyện: ${story.title}`}
    >
      {/* Thanh trên: đóng · tiêu đề · đọc to */}
      <header className="flex items-start gap-2 border-b px-3 py-2.5">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Đóng toàn màn hình"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="truncate font-semibold leading-tight">{story.title}</h2>
          <p className="font-mono mt-0.5 truncate text-[11px] uppercase tracking-wider text-muted-foreground">
            {story.deck.name}
            {total > 1 ? ` · Truyện ${index + 1}/${total}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleRead(readText, readModeForView)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
            reading
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          aria-label={reading ? "Dừng đọc" : "Đọc to"}
        >
          {reading ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Thanh công cụ: ngôn ngữ · nghĩa · ẩn từ (chỉ khi chêm) · cỡ chữ · tốc độ đọc */}
      <div className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
        <StoryModeToggle
          value={mode}
          onChange={changeViewMode}
          enAvailable={Boolean(story.contentEn?.trim())}
          className="[&>button]:px-2.5 [&>button]:py-0.5 [&>button]:text-xs"
        />
        {mode !== "vi" ? (
          <>
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
          </>
        ) : null}

        <div className="flex items-center gap-0.5 rounded-full border px-1">
          <button
            type="button"
            onClick={() => changeFont(-1)}
            disabled={fontIndex === 0}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            aria-label="Giảm cỡ chữ"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center font-mono text-[11px] text-muted-foreground">
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() => changeFont(1)}
            disabled={fontIndex === FONT_SIZES.length - 1}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            aria-label="Tăng cỡ chữ"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <ReadingSpeedControl rate={rate} onChange={setRate} />
      </div>

      {/* Nội dung truyện — vùng cuộn duy nhất */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-2xl px-5 py-6">
          {story.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={story.imageUrl}
              alt={story.title}
              className="mb-6 h-auto w-full rounded-xl object-contain"
            />
          ) : null}
          <StoryViewContent
            mode={mode}
            content={story.content}
            contentEn={story.contentEn}
            showMeanings={showMeanings}
            hideWords={hideWords}
            favoriteWords={favoriteWords}
            style={{ fontSize, lineHeight: 2 }}
          />
        </div>
      </div>

      {/* Thanh dưới: chuyển truyện (ẩn khi deck chỉ có 1 truyện) */}
      {total > 1 ? (
        <footer className="flex items-center justify-between gap-3 border-t px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => goto(index - 1)}>
            <ChevronLeft className="h-4 w-4" /> Trước
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            {index + 1} / {total}
          </span>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => goto(index + 1)}>
            Sau <ChevronRight className="h-4 w-4" />
          </Button>
        </footer>
      ) : null}
    </div>
  );
}
