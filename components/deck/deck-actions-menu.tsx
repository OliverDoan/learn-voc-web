"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Layers,
  Lock,
  Mic,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  SquareCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeckWithCounts } from "@/lib/types";

interface DeckActionsMenuProps {
  deckId: string;
  deck: DeckWithCounts;
  /** Đang gọi API đánh dấu học xong. */
  learnedPending: boolean;
  /** Đang ở chế độ chọn / sắp xếp thẻ. */
  selectMode: boolean;
  /** Có deck kế tiếp để nhảy sang không. */
  hasNextDeck: boolean;
  onToggleLearned: () => void;
  onToggleSelectMode: () => void;
  onAddCard: () => void;
  onExport: () => void;
  onImport: () => void;
  onEditDeck: () => void;
  onDeleteDeck: () => void;
  onNextDeck: () => void;
}

/**
 * Menu ⋮ gom mọi hành động của deck: học, bài tập, quản lý từ, sửa/xoá deck.
 * Tách khỏi trang chi tiết deck để trang chỉ còn lo bố cục và dữ liệu.
 */
export function DeckActionsMenu({
  deckId,
  deck,
  learnedPending,
  selectMode,
  hasNextDeck,
  onToggleLearned,
  onToggleSelectMode,
  onAddCard,
  onExport,
  onImport,
  onEditDeck,
  onDeleteDeck,
  onNextDeck,
}: DeckActionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setOpen((o) => !o)}
          aria-label="Thêm hành động"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {open ? (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-lg border bg-popover text-popover-foreground p-1.5 shadow-lg">
              {deck.locked ? (
                <div
                  className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground/60"
                  title="Hoàn thành deck trước để mở khóa"
                >
                  <Lock className="h-4 w-4" /> Bắt đầu ôn (đang khóa)
                </div>
              ) : (
                <Link
                  href={`/study/${deckId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Play className="h-4 w-4" /> Bắt đầu ôn
                </Link>
              )}
              <button
                type="button"
                disabled={
                  deck.locked ||
                  learnedPending ||
                  (!deck.learned && !deck.exercisesDone)
                }
                title={
                  deck.locked
                    ? "Hoàn thành các Unit trước để mở khóa"
                    : !deck.learned && !deck.exercisesDone
                      ? "Cần làm hết các dạng bài tập trước"
                      : undefined
                }
                onClick={() => {
                  setOpen(false);
                  onToggleLearned();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                {deck.learned ? (
                  <>
                    <SquareCheck className="h-4 w-4" /> Đã học xong
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Đánh dấu học xong
                  </>
                )}
              </button>

              <div className="my-1 h-px bg-border" />
              <Link
                href={`/flashcards/${deckId}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Layers className="h-4 w-4" /> Flashcard
              </Link>
              {deck.locked ? (
                <div
                  className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground/60"
                  title="Hoàn thành deck trước để mở khóa"
                >
                  <Lock className="h-4 w-4" /> Quiz (đang khóa)
                </div>
              ) : (
                <Link
                  href={`/quiz/${deckId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                >
                  <BookOpen className="h-4 w-4" /> Quiz
                </Link>
              )}
              <Link
                href={`/pronounce/${deckId}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Mic className="h-4 w-4" /> Phát âm
              </Link>

              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAddCard();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Plus className="h-4 w-4" /> Thêm từ
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onToggleSelectMode();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                {selectMode ? (
                  <>
                    <X className="h-4 w-4" /> Xong chọn / sắp xếp
                  </>
                ) : (
                  <>
                    <SquareCheck className="h-4 w-4" /> Chọn / Sắp xếp
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onExport();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Download className="h-4 w-4" /> Xuất
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onImport();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Upload className="h-4 w-4" /> Import
              </button>

              {hasNextDeck ? (
                <>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onNextDeck();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                  >
                    <ArrowRight className="h-4 w-4" /> Deck tiếp theo
                  </button>
                </>
              ) : null}
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEditDeck();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Pencil className="h-4 w-4" /> Sửa deck
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDeleteDeck();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Xoá deck
              </button>
            </div>
          </>
        ) : null}
      </div>
  );
}
