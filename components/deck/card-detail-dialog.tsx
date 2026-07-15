"use client";

import { useEffect } from "react";
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Sprout,
  Trash2,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, displayRootWord, parseTags, posBadgeClass } from "@/lib/utils";
import { DialectBadge } from "@/components/deck/dialect-badge";
import {
  parseWordForms,
  parseWordFormMeanings,
  WORD_FORM_ABBR,
  WORD_FORM_ORDER,
} from "@/lib/word-forms";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

interface CardDetailDialogProps<T extends Card = Card> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: T;
  /** Danh sách thẻ để điều hướng qua nút mũi tên / phím ← →. */
  cards?: T[];
  /** Gọi khi bấm sang thẻ trước/tiếp theo. */
  onNavigate?: (card: T) => void;
  onEdit?: (card: T) => void;
  onDelete?: (card: T) => void;
}

export function CardDetailDialog<T extends Card = Card>({
  open,
  onOpenChange,
  card,
  cards,
  onNavigate,
  onEdit,
  onDelete,
}: CardDetailDialogProps<T>) {
  // Xác định vị trí thẻ hiện tại trong danh sách để tính prev/next.
  const index =
    card && cards ? cards.findIndex((c) => c.id === card.id) : -1;
  const canNavigate = !!onNavigate && index >= 0 && (cards?.length ?? 0) > 1;
  const prevCard = canNavigate && index > 0 ? cards![index - 1] : undefined;
  const nextCard =
    canNavigate && index < cards!.length - 1 ? cards![index + 1] : undefined;

  // Điều hướng bằng phím mũi tên trái/phải khi dialog đang mở.
  useEffect(() => {
    if (!open || !canNavigate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevCard) onNavigate!(prevCard);
      else if (e.key === "ArrowRight" && nextCard) onNavigate!(nextCard);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, canNavigate, prevCard, nextCard, onNavigate]);

  if (!card) return null;

  const tags = parseTags(card.tags);
  const synonyms = parseTags(card.synonyms);
  const antonyms = parseTags(card.antonyms);
  const root = displayRootWord(card.word, card.rootWord);
  const forms = parseWordForms(card.wordForms);
  const formMeanings = parseWordFormMeanings(card.wordFormMeanings);
  const formRows = WORD_FORM_ORDER.filter((pos) => forms[pos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {canNavigate ? (
        <>
          <button
            type="button"
            onClick={() => prevCard && onNavigate!(prevCard)}
            disabled={!prevCard}
            aria-label="Từ trước"
            title="Từ trước (←)"
            className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-card/90 text-foreground shadow-md backdrop-blur transition hover:bg-accent disabled:pointer-events-none disabled:opacity-30 sm:left-auto sm:right-full sm:mr-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => nextCard && onNavigate!(nextCard)}
            disabled={!nextCard}
            aria-label="Từ tiếp theo"
            title="Từ tiếp theo (→)"
            className="absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-card/90 text-foreground shadow-md backdrop-blur transition hover:bg-accent disabled:pointer-events-none disabled:opacity-30 sm:right-auto sm:left-full sm:ml-3"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-bold">{card.word}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => speak(card.word)}
              aria-label="Phát âm"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            {card.phonetic ? (
              <span className="font-phonetic text-sm font-normal text-muted-foreground">
                {card.phonetic}
              </span>
            ) : null}
            {card.partOfSpeech ? (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                  posBadgeClass(card.partOfSpeech),
                )}
              >
                {card.partOfSpeech}
              </span>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-lg font-medium">{card.meaning}</p>

          <DialectBadge dialect={card.dialect} variantWord={card.variantWord} variant="full" />

          {root ? (
            <div className="inline-flex flex-wrap items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
              <Sprout className="h-3.5 w-3.5 shrink-0" />
              <span className="text-muted-foreground">Từ gốc:</span>
              <span>{root}</span>
              {card.rootWordMeaning ? (
                <span className="font-normal text-muted-foreground">— {card.rootWordMeaning}</span>
              ) : null}
            </div>
          ) : null}

          {card.example ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm italic">&ldquo;{card.example}&rdquo;</p>
              {card.exampleTranslation ? (
                <p className="mt-1 text-sm text-muted-foreground">{card.exampleTranslation}</p>
              ) : null}
            </div>
          ) : null}

          {synonyms.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">≈ Đồng nghĩa:</span>
              <span className="text-muted-foreground">{synonyms.join(", ")}</span>
            </div>
          ) : null}

          {antonyms.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="font-medium text-rose-600 dark:text-rose-400">↔ Trái nghĩa:</span>
              <span className="text-muted-foreground">{antonyms.join(", ")}</span>
            </div>
          ) : null}

          {/* Bảng các dạng từ (word formation) */}
          {formRows.length > 0 ? (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Blocks className="h-3.5 w-3.5" /> Các dạng từ
              </p>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {formRows.map((pos) => {
                      const value = forms[pos] as string;
                      const meaning = formMeanings[pos];
                      const isCurrent = value.toLowerCase() === card.word.trim().toLowerCase();
                      return (
                        <tr
                          key={pos}
                          className={`border-b last:border-b-0 ${isCurrent ? "bg-primary/5" : ""}`}
                        >
                          <td className="px-3 py-2 align-top">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={isCurrent ? "font-semibold text-primary" : "font-medium"}>
                                {value}
                              </span>
                              <span className="text-muted-foreground">
                                ({WORD_FORM_ABBR[pos]})
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top text-muted-foreground">
                            {meaning ?? ""}
                          </td>
                          <td className="w-10 px-2 py-2 align-top text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => speak(value)}
                              aria-label={`Phát âm ${value}`}
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {card.note ? (
            <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              {card.note}
            </div>
          ) : null}

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        {onEdit || onDelete ? (
          <DialogFooter>
            {onDelete ? (
              <Button
                variant="outline"
                onClick={() => onDelete(card)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Xoá
              </Button>
            ) : null}
            {onEdit ? (
              <Button onClick={() => onEdit(card)}>
                <Pencil className="h-4 w-4" /> Sửa
              </Button>
            ) : null}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
