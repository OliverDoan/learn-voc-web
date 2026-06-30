"use client";

import { useState } from "react";
import { Check, ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeckOption {
  id: string;
  name: string;
  count: number;
}

interface StoryDeckPickerProps {
  decks: readonly DeckOption[];
  /** ID các deck đang BỊ BỎ CHỌN (rỗng = chọn tất cả). */
  excluded: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

/**
 * Bộ chọn deck cho trang đọc truyện chêm: bật/tắt từng deck muốn đọc.
 * Dùng mô hình "loại trừ" — mặc định chọn hết, người dùng bỏ chọn deck không muốn.
 */
export function StoryDeckPicker({
  decks,
  excluded,
  onToggle,
  onSelectAll,
  onClear,
}: StoryDeckPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedCount = decks.filter((d) => !excluded.has(d.id)).length;

  return (
    <div className="mb-6">
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setOpen((v) => !v)}
        >
          <ListFilter className="h-4 w-4" />
          Chọn deck ({selectedCount}/{decks.length})
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </Button>
      </div>

      {open ? (
        <div className="mt-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Deck muốn đọc
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onSelectAll}>
                Chọn tất cả
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClear}>
                Bỏ chọn hết
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {decks.map((d) => {
              const selected = !excluded.has(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onToggle(d.id)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                    )}
                  >
                    {selected ? <Check className="h-3 w-3" /> : null}
                  </span>
                  {d.name}
                  <span className="opacity-60">({d.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
