"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Library, Play, Settings2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryRenderer } from "@/components/story/story-renderer";
import { StoryProse } from "@/components/story/story-prose";
import type { StoryViewMode } from "@/components/story/story-mode-toggle";
import { StoryImageFlashcard } from "@/components/story/story-image-flashcard";
import { StoryImageLightbox } from "@/components/story/story-image-lightbox";
import { StoryImageManager } from "@/components/story/story-image-manager";
import type { DeckOption } from "@/components/story/story-deck-picker";
import { ReadingSettingsPanel } from "@/components/story/reading-settings-panel";
import { AutoScrollControls } from "@/components/ui/auto-scroll-controls";
import { PageLoader } from "@/components/ui/page-loader";
import { useStories } from "@/hooks/use-stories";
import { useFavorites } from "@/hooks/use-cards";
import { useReadingRate } from "@/hooks/use-reading-rate";
import { countWordTokens, firstMeaning, parseStory, toVietnamese } from "@/lib/story-parser";
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
  const { data: favorites } = useFavorites();
  // Tập từ được đánh dấu sao (viết thường) để StoryRenderer tô màu khác.
  const favoriteWords = useMemo(
    () => new Set((favorites ?? []).map((c) => c.word.trim().toLowerCase())),
    [favorites],
  );
  const [showMeanings, setShowMeanings] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  // Chế độ hiển thị áp dụng cho toàn bộ truyện: chêm / full tiếng Việt / full tiếng Anh
  const [viewMode, setViewMode] = useState<StoryViewMode>("cham");
  // Chế độ chỉ xem ảnh: ẩn tiêu đề + từ chêm + văn bản, chỉ hiện ảnh truyện
  const [imageOnly, setImageOnly] = useState(false);
  // Index ảnh đang mở trong lightbox toàn màn hình (null = đóng), tính trên danh sách truyện có ảnh.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Mở dialog cập nhật ảnh hàng loạt cho các truyện đang hiển thị.
  const [imageManagerOpen, setImageManagerOpen] = useState(false);
  // Mở/đóng panel "Cài đặt đọc" (trượt từ phải)
  const [settingsOpen, setSettingsOpen] = useState(false);
  // index của truyện đang được đọc to (null = không đọc)
  const [readingIndex, setReadingIndex] = useState<number | null>(null);
  // Chế độ đọc: "mixed" (văn Việt + từ chêm tiếng Anh) | "vi" (toàn bộ tiếng Việt) | "en" (tiếng Anh) | null
  const [readMode, setReadMode] = useState<"mixed" | "vi" | "en" | null>(null);
  // Tự động phát: đọc hết 1 truyện thì tự sang truyện kế; tắt → dừng sau 1 truyện.
  const [autoPlay, setAutoPlay] = useState(true);
  // ID các deck BỊ BỎ CHỌN (rỗng = đọc tất cả). Mô hình loại trừ để mặc định là chọn hết.
  const [excludedDeckIds, setExcludedDeckIds] = useState<Set<string>>(new Set());
  // Lặp lại: đọc xong danh sách thì quay lại đầu, lặp đến khi dừng.
  const [loop, setLoop] = useState(false);
  // "Thẻ phiên đọc": mỗi lần bắt đầu đọc tăng 1; vòng lặp cũ tự thoát khi không còn khớp
  const genRef = useRef(0);
  const { rate, setRate } = useReadingRate();
  // Ref để vòng đọc đang chạy luôn thấy tốc độ / cờ lặp mới nhất khi người dùng đổi giữa chừng
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);
  // Đồng bộ cờ lặp vào ref để vòng đọc đang chạy thấy giá trị mới nhất.
  const loopRef = useRef(loop);
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);
  // Đồng bộ cờ tự động phát vào ref cho vòng đọc đang chạy.
  const autoPlayRef = useRef(autoPlay);
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  // Khôi phục lựa chọn deck + cờ lặp từ localStorage (chạy client-side, tránh lỗi SSR).
  useEffect(() => {
    try {
      const rawEx = localStorage.getItem("voca-stories-excluded");
      if (rawEx) {
        const ids = JSON.parse(rawEx);
        if (Array.isArray(ids)) setExcludedDeckIds(new Set(ids.filter((x) => typeof x === "string")));
      }
      setLoop(localStorage.getItem("voca-stories-loop") === "1");
      // Tự động phát mặc định BẬT (chỉ tắt nếu người dùng đã lưu "0").
      setAutoPlay(localStorage.getItem("voca-stories-autoplay") !== "0");
    } catch {
      // localStorage hỏng/không hợp lệ → giữ mặc định
    }
  }, []);

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

  // Danh sách deck (suy ra từ truyện đã tải), giữ thứ tự Unit như `sorted`.
  const decks = useMemo<DeckOption[]>(() => {
    const map = new Map<string, DeckOption>();
    for (const s of sorted) {
      const cur = map.get(s.deck.id);
      if (cur) cur.count += 1;
      else map.set(s.deck.id, { id: s.deck.id, name: s.deck.name, count: 1 });
    }
    return Array.from(map.values());
  }, [sorted]);

  // Truyện thực sự được hiển thị / đọc = đã sắp xếp, lọc theo deck đang chọn.
  const visible = useMemo(
    () => sorted.filter((s) => !excludedDeckIds.has(s.deck.id)),
    [sorted, excludedDeckIds],
  );

  const totalWords = useMemo(
    () => visible.reduce((sum, s) => sum + countWordTokens(s.content), 0),
    [visible],
  );

  // Danh sách truyện có ảnh — nguồn duy nhất cho chế độ chỉ xem ảnh + lightbox (index khớp nhau).
  const imageStories = useMemo(() => visible.filter((s) => Boolean(s.imageUrl)), [visible]);
  const hasImages = imageStories.length > 0;
  // Có ít nhất 1 truyện đang hiển thị kèm bản tiếng Anh → cho phép chế độ English.
  const enAvailable = useMemo(() => visible.some((s) => Boolean(s.contentEn)), [visible]);

  // Chế độ đọc suy ra từ ngôn ngữ hiển thị đang chọn (Chêm → song ngữ, TV → tiếng Việt, En → tiếng Anh).
  const readModeForView: "mixed" | "vi" | "en" =
    viewMode === "vi" ? "vi" : viewMode === "en" ? "en" : "mixed";

  const stopReading = () => {
    genRef.current += 1; // vô hiệu hoá vòng đọc hiện tại
    stopSpeaking();
    setReadingIndex(null);
    setReadMode(null);
  };

  // Đọc liền mạch từ truyện thứ `start` (index trong `visible`) đến hết. Theo `mode`:
  // - "mixed": văn tiếng Việt (vi-VN) + từ chêm đọc tiếng Anh (en-US)
  // - "vi": đọc toàn bộ tiếng Việt, từ chêm đọc nghĩa tiếng Việt (nghĩa đầu tiên)
  // - "en": đọc bản tiếng Anh của truyện (en-US)
  // Tắt "Tự động phát" → dừng sau 1 truyện. Bật "lặp lại" → quay vòng từ đầu.
  const readFrom = async (start: number, mode: "mixed" | "vi" | "en") => {
    stopSpeaking(); // ngắt mọi giọng đang phát trước khi bắt đầu phiên mới
    const gen = (genRef.current += 1);
    const alive = () => genRef.current === gen;
    setReadMode(mode);
    // Đóng băng danh sách của phiên đọc này để index ổn định suốt vòng lặp.
    const list = visible;
    if (list.length === 0) return;

    let first = true;
    do {
      for (let i = first ? start : 0; i < list.length; i++) {
        if (!alive()) return;
        setReadingIndex(i);
        document
          .getElementById(`story-${list[i].id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });

        // Đọc tên truyện trước cho dễ theo dõi
        await speakAsync(list[i].title, "vi-VN", rateRef.current);
        if (!alive()) return;

        if (mode === "en") {
          // Đọc bản tiếng Anh (nếu có)
          const en = list[i].contentEn?.trim();
          if (en && isSpeakable(en)) await speakAsync(en, "en-US", rateRef.current);
        } else {
          for (const tok of parseStory(list[i].content)) {
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
        }

        // Tắt tự động phát → dừng ngay sau truyện đầu tiên vừa đọc.
        if (!autoPlayRef.current) {
          if (alive()) {
            setReadingIndex(null);
            setReadMode(null);
          }
          return;
        }
      }
      first = false;
    } while (loopRef.current && alive());

    if (alive()) {
      setReadingIndex(null);
      setReadMode(null);
    }
  };

  const toggleReadAll = (mode: "mixed" | "vi" | "en") => {
    // Đang đọc đúng chế độ này → dừng; ngược lại bắt đầu (hoặc chuyển) chế độ.
    if (readingIndex !== null && readMode === mode) {
      stopReading();
      return;
    }
    void readFrom(0, mode);
  };

  // Đổi lựa chọn deck giữa chừng làm xáo trộn index → dừng đọc trước khi đổi.
  const persistExcluded = (next: Set<string>) => {
    try {
      localStorage.setItem("voca-stories-excluded", JSON.stringify(Array.from(next)));
    } catch {
      /* bỏ qua lỗi localStorage */
    }
  };

  const toggleDeck = (id: string) => {
    if (readingIndex !== null) stopReading();
    setExcludedDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistExcluded(next);
      return next;
    });
  };

  const selectAllDecks = () => {
    if (readingIndex !== null) stopReading();
    const next = new Set<string>();
    setExcludedDeckIds(next);
    persistExcluded(next);
  };

  const clearAllDecks = () => {
    if (readingIndex !== null) stopReading();
    const next = new Set(decks.map((d) => d.id));
    setExcludedDeckIds(next);
    persistExcluded(next);
  };

  const toggleLoop = () => {
    setLoop((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("voca-stories-loop", next ? "1" : "0");
      } catch {
        /* bỏ qua lỗi localStorage */
      }
      return next;
    });
  };

  const toggleAutoPlay = () => {
    setAutoPlay((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("voca-stories-autoplay", next ? "1" : "0");
      } catch {
        /* bỏ qua lỗi localStorage */
      }
      return next;
    });
  };

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-28">
      {/* Tiêu đề bên trái · nút hành động bên phải */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Library className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Tất cả truyện chêm</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Đọc liền mạch toàn bộ truyện của các deck
            {!isLoading && sorted.length > 0 ? (
              <span className="font-mono text-[13px] text-muted-foreground/80">
                {" · "}
                {visible.length} truyện · {totalWords} từ chêm
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="icon"
            className="rounded-full shadow-[0_8px_20px_rgba(23,61,201,.28)]"
            onClick={() => {
              if (imageOnly) return;
              toggleReadAll(readModeForView);
            }}
            disabled={isLoading || visible.length === 0 || imageOnly}
            aria-label={readingIndex !== null ? "Dừng đọc" : "Đọc liền mạch"}
            title={
              imageOnly
                ? "Tắt chế độ chỉ xem ảnh để đọc"
                : readingIndex !== null
                  ? "Dừng đọc"
                  : "Đọc liền mạch"
            }
          >
            {readingIndex !== null ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setSettingsOpen(true)}
            aria-label="Cài đặt đọc"
            title="Cài đặt đọc"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ReadingSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        decks={decks}
        excludedDeckIds={excludedDeckIds}
        onToggleDeck={toggleDeck}
        onSelectAllDecks={selectAllDecks}
        onClearDecks={clearAllDecks}
        autoPlay={autoPlay}
        onToggleAutoPlay={toggleAutoPlay}
        loop={loop}
        onToggleLoop={toggleLoop}
        rate={rate}
        onRate={setRate}
        viewMode={viewMode}
        onViewMode={setViewMode}
        enAvailable={enAvailable}
        showMeanings={showMeanings}
        onToggleShowMeanings={() => setShowMeanings((v) => !v)}
        focusMode={hideWords}
        onToggleFocus={() => setHideWords((v) => !v)}
        imageOnly={imageOnly}
        onToggleImageOnly={() => {
          // Dừng đọc khi chuyển sang chế độ chỉ xem ảnh
          if (!imageOnly && readingIndex !== null) stopReading();
          setImageOnly((v) => !v);
        }}
        hasImages={hasImages}
        onOpenLightbox={() => setLightboxIndex(0)}
        onOpenImageManager={() => setImageManagerOpen(true)}
      />

      {isLoading ? (
        <PageLoader className="min-h-[40vh]" />
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có truyện chêm nào. Hãy tạo truyện trong từng deck.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa chọn deck nào. Hãy chọn ít nhất một deck ở phần &ldquo;Chọn deck&rdquo; phía trên.
          </p>
        </div>
      ) : imageOnly && !hasImages ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có truyện nào kèm ảnh để xem.
          </p>
        </div>
      ) : imageOnly ? (
        // Chế độ chỉ xem ảnh: mỗi ảnh là một flashcard — nhấn để lật sang nội dung truyện.
        <div className="space-y-10">
          {imageStories.map((story, i) => (
            <StoryImageFlashcard
              key={story.id}
              story={story}
              favoriteWords={favoriteWords}
              onOpenFullscreen={() => setLightboxIndex(i)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {visible.map((story, i) => {
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
                    onClick={() => (reading ? stopReading() : void readFrom(i, readModeForView))}
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
                    className="mb-5 h-auto w-full rounded-xl object-contain shadow-md"
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

                {viewMode === "cham" ? (
                  <StoryRenderer
                    content={story.content}
                    showMeanings={showMeanings}
                    hideWords={hideWords}
                    favoriteWords={favoriteWords}
                  />
                ) : viewMode === "vi" ? (
                  <StoryProse text={toVietnamese(story.content)} />
                ) : story.contentEn ? (
                  <StoryProse text={story.contentEn} />
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Truyện này chưa có bản tiếng Anh.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && visible.length > 0 ? <AutoScrollControls /> : null}

      {/* Dialog cập nhật ảnh hàng loạt cho các truyện đang hiển thị */}
      {imageManagerOpen ? (
        <StoryImageManager stories={visible} onClose={() => setImageManagerOpen(false)} />
      ) : null}

      {/* Lightbox toàn màn hình: mũi tên chuyển ảnh, nhấn ảnh để lật sang nội dung */}
      {lightboxIndex !== null ? (
        <StoryImageLightbox
          stories={imageStories}
          index={lightboxIndex}
          onNavigate={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          favoriteWords={favoriteWords}
        />
      ) : null}
    </div>
  );
}
