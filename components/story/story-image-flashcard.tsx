"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Image as ImageIcon, Maximize2 } from "lucide-react";
import { StoryRenderer } from "@/components/story/story-renderer";
import type { StoryListItem } from "@/lib/types";

interface StoryImageFlashcardProps {
  story: StoryListItem;
  favoriteWords?: ReadonlySet<string>;
  /** Mở lightbox toàn màn hình tại truyện này. */
  onOpenFullscreen: () => void;
}

/**
 * Thẻ ảnh truyện chêm dạng flashcard (chế độ "chỉ xem ảnh"):
 * - Mặt trước: ảnh truyện → nhấn để lật sang nội dung.
 * - Mặt sau: tiêu đề + nội dung truyện chêm, nhấn nền để lật lại ảnh.
 * - Nút phóng to góc phải mở lightbox toàn màn hình.
 */
export function StoryImageFlashcard({
  story,
  favoriteWords,
  onOpenFullscreen,
}: StoryImageFlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  if (!story.imageUrl) return null;

  return (
    <div className="perspective">
      <motion.div
        className="preserve-3d relative w-full cursor-pointer select-none"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        aria-label={flipped ? "Nhấn để xem lại ảnh" : "Nhấn để xem nội dung truyện"}
      >
        {/* Mặt trước: ảnh (quyết định chiều cao của thẻ) */}
        <div className="backface-hidden relative overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(0,13,139,.08)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.imageUrl} alt={story.title} className="h-auto w-full object-contain" />
          <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-4rem)] items-center gap-1 truncate rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <BookOpen className="h-3 w-3 shrink-0" />
            {story.deck.name}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullscreen();
            }}
            className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            aria-label="Xem toàn màn hình"
            title="Xem toàn màn hình"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Mặt sau: nội dung truyện, cùng kích thước với ảnh, cuộn được nếu dài */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_24px_64px_rgba(0,13,139,.08)]">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
            <Link
              href={`/stories/${story.id}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate text-sm font-bold hover:text-primary"
              title="Mở trang truyện"
            >
              {story.title}
            </Link>
            <span
              className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
              title="Nhấn nền thẻ để xem lại ảnh"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Nhấn để lật lại
            </span>
          </div>
          {/* Chặn click lan ra thẻ để bấm vào từ chêm không làm lật thẻ */}
          <div
            className="flex-1 overflow-y-auto px-5 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <StoryRenderer
              content={story.content}
              favoriteWords={favoriteWords}
              className="text-[16px] leading-[1.9]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
