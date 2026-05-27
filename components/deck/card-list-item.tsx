"use client";

import { Pencil, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { speak } from "@/lib/tts";
import { parseTags } from "@/lib/utils";
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

interface CardListItemProps {
  card: Card;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardListItem({
  card,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}: CardListItemProps) {
  const tags = parseTags(card.tags);

  return (
    <li
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-accent/30"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(card.id)}
        className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        aria-label={`Chọn ${card.word}`}
      />
      <Button
        variant="ghost"
        size="icon"
        className="mt-0.5 shrink-0"
        onClick={() => speak(card.word)}
        aria-label="Phát âm"
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{card.word}</span>
          {card.phonetic ? (
            <span className="font-phonetic text-xs text-muted-foreground">
              {card.phonetic}
            </span>
          ) : null}
          {card.partOfSpeech ? (
            <Badge variant="outline" className="text-xs">
              {card.partOfSpeech}
            </Badge>
          ) : null}
          <Badge variant={stateColors[card.state] ?? "secondary"} className="text-xs">
            {stateLabels[card.state] ?? card.state}
          </Badge>
        </div>
        <p className="mt-1 text-sm">{card.meaning}</p>
        {card.example ? (
          <p className="mt-1 text-xs italic text-muted-foreground">
            &ldquo;{card.example}&rdquo;
          </p>
        ) : null}
        {tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(card)}
          aria-label="Sửa"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(card.id)}
          aria-label="Xoá"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </li>
  );
}
