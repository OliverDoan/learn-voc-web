"use client";

import { Blocks, Pencil, Sprout, Trash2, Volume2 } from "lucide-react";
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
import { parseWordForms, WORD_FORM_LABEL, WORD_FORM_ORDER } from "@/lib/word-forms";
import { speak } from "@/lib/tts";
import type { Card } from "@/lib/types";

const stateColors: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  NEW: "secondary",
  LEARNING: "warning",
  REVIEW: "default",
  MATURE: "success",
  SUSPENDED: "outline",
};

const stateLabels: Record<string, string> = {
  NEW: "Mới",
  LEARNING: "Đang học",
  REVIEW: "Ôn tập",
  MATURE: "Thuộc",
  SUSPENDED: "Tạm dừng",
};

interface CardDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: Card;
  onEdit?: (card: Card) => void;
  onDelete?: (card: Card) => void;
}

export function CardDetailDialog({
  open,
  onOpenChange,
  card,
  onEdit,
  onDelete,
}: CardDetailDialogProps) {
  if (!card) return null;

  const tags = parseTags(card.tags);
  const synonyms = parseTags(card.synonyms);
  const antonyms = parseTags(card.antonyms);
  const root = displayRootWord(card.word, card.rootWord);
  const forms = parseWordForms(card.wordForms);
  const formRows = WORD_FORM_ORDER.filter((pos) => forms[pos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
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
            <Badge variant={stateColors[card.state] ?? "secondary"} className="text-xs">
              {stateLabels[card.state] ?? card.state}
            </Badge>
          </div>

          <p className="text-lg font-medium">{card.meaning}</p>

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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse overflow-hidden rounded-lg border text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      {formRows.map((pos) => (
                        <th
                          key={pos}
                          className="border-r px-3 py-2 text-center font-medium text-muted-foreground last:border-r-0"
                        >
                          {WORD_FORM_LABEL[pos]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      {formRows.map((pos) => {
                        const value = forms[pos] as string;
                        const isCurrent = value.toLowerCase() === card.word.trim().toLowerCase();
                        return (
                          <td
                            key={pos}
                            className={`border-r px-3 py-2 text-center align-top last:border-r-0 ${
                              isCurrent ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={isCurrent ? "font-semibold text-primary" : "font-medium"}>
                                {value}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => speak(value)}
                                aria-label={`Phát âm ${value}`}
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            {isCurrent ? (
                              <Badge variant="secondary" className="mt-1 text-[10px]">
                                từ hiện tại
                              </Badge>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
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
