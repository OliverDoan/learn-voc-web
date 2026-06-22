"use client";

import { LayoutGrid, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CardStateFilter = "ALL" | "NEW" | "LEARNING" | "REVIEW" | "MATURE" | "SUSPENDED";

const STATE_OPTIONS: { value: CardStateFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "NEW", label: "Mới" },
  { value: "LEARNING", label: "Đang học" },
  { value: "REVIEW", label: "Ôn tập" },
  { value: "MATURE", label: "Thuộc" },
  { value: "SUSPENDED", label: "Tạm dừng" },
];

interface CardsFilterBarProps {
  state: CardStateFilter;
  onStateChange: (state: CardStateFilter) => void;
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  favoriteOnly: boolean;
  onToggleFavoriteOnly: () => void;
  groupByTag: boolean;
  onToggleGroupByTag: () => void;
  matchCount: number;
  totalCount: number;
}

export function CardsFilterBar({
  state,
  onStateChange,
  availableTags,
  selectedTags,
  onToggleTag,
  onClearTags,
  favoriteOnly,
  onToggleFavoriteOnly,
  groupByTag,
  onToggleGroupByTag,
  matchCount,
  totalCount,
}: CardsFilterBarProps) {
  const hasTagFilter = selectedTags.length > 0;
  const isFiltering = state !== "ALL" || hasTagFilter || favoriteOnly;

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {STATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onStateChange(opt.value)}
            className={cn(
              "rounded-md border px-3 py-1 text-xs transition-colors",
              state === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onToggleFavoriteOnly}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs transition-colors",
            favoriteOnly
              ? "border-amber-400 bg-amber-400/10 text-amber-500"
              : "border-border text-muted-foreground hover:border-amber-400/40 hover:text-foreground",
          )}
          aria-pressed={favoriteOnly}
        >
          <Star className={cn("h-3 w-3", favoriteOnly && "fill-current")} />
          Yêu thích
        </button>
        {availableTags.length > 0 ? (
          <button
            type="button"
            onClick={onToggleGroupByTag}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs transition-colors",
              groupByTag
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            aria-pressed={groupByTag}
          >
            <LayoutGrid className="h-3 w-3" />
            Nhóm theo chủ đề
          </button>
        ) : null}
        {isFiltering ? (
          <span className="ml-auto text-xs text-muted-foreground">
            {matchCount} / {totalCount} từ
          </span>
        ) : null}
      </div>

      {availableTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Tags
          </span>
          {availableTags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {tag}
              </button>
            );
          })}
          {hasTagFilter ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={onClearTags}
            >
              <X className="h-3 w-3" /> Xoá lọc tag
            </Button>
          ) : null}
        </div>
      ) : null}

      {hasTagFilter ? (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              #{tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
