"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { StoryRenderer } from "@/components/story/story-renderer";
import type { StoryListItem } from "@/lib/types";

interface StoryImageLightboxProps {
  /** Danh sách truyện CÓ ẢNH (đã lọc sẵn). */
  stories: readonly StoryListItem[];
  /** Index truyện đang xem trong `stories`. */
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  favoriteWords?: ReadonlySet<string>;
}

/**
 * Lightbox xem ảnh truyện chêm toàn màn hình:
 * - Mũi tên trái/phải (hoặc phím ←/→) để chuyển ảnh.
 * - Nhấn vào ảnh để lật sang nội dung truyện; Esc hoặc nút X để đóng.
 */
export function StoryImageLightbox({
  stories,
  index,
  onNavigate,
  onClose,
  favoriteWords,
}: StoryImageLightboxProps) {
  const [flipped, setFlipped] = useState(false);
  const story = stories[index];
  const total = stories.length;

  const goto = useCallback(
    (next: number) => {
      if (next < 0 || next >= total) return;
      setFlipped(false); // sang ảnh mới luôn bắt đầu ở mặt ảnh
      onNavigate(next);
    },
    [total, onNavigate],
  );

  // Phím tắt: Esc đóng, ←/→ chuyển ảnh, Space/Enter lật.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goto(index - 1);
      else if (e.key === "ArrowRight") goto(index + 1);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goto, onClose]);

  // Khóa cuộn nền khi lightbox mở.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh truyện: ${story.title}`}
    >
      {/* Thanh trên: tên deck + đếm + đóng */}
      <div className="flex items-center justify-between gap-3 p-4">
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate">{story.deck.name}</span>
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-xs text-white/70">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Đóng (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Vùng giữa: thẻ lật ảnh ↔ nội dung */}
      <div className="perspective relative flex min-h-0 flex-1 items-center justify-center px-14 pb-6 sm:px-20">
        <motion.div
          className="preserve-3d relative h-full w-full max-w-4xl cursor-pointer select-none"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
          onClick={() => setFlipped((f) => !f)}
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Nhấn để xem lại ảnh" : "Nhấn để xem nội dung truyện"}
        >
          {/* Mặt ảnh */}
          <div className="backface-hidden absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.imageUrl ?? ""}
              alt={story.title}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          </div>

          {/* Mặt nội dung */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex items-center justify-center">
            <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
              <div className="border-b px-6 py-3">
                <Link
                  href={`/stories/${story.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-lg font-bold hover:text-primary"
                  title="Mở trang truyện"
                >
                  {story.title}
                </Link>
              </div>
              <div
                className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
                onClick={(e) => e.stopPropagation()}
              >
                <StoryRenderer content={story.content} favoriteWords={favoriteWords} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mũi tên trái/phải */}
        {index > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goto(index - 1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25 sm:left-5"
            aria-label="Ảnh trước (←)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : null}
        {index < total - 1 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goto(index + 1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25 sm:right-5"
            aria-label="Ảnh tiếp theo (→)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        ) : null}
      </div>

      <p className="pb-4 text-center text-xs text-white/50">
        Nhấn vào ảnh để lật sang nội dung · ←/→ chuyển ảnh · Esc để đóng
      </p>
    </div>
  );
}
