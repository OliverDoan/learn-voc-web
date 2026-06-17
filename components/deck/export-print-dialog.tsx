"use client";

import { useMemo, useState } from "react";
import { Check, FileSpreadsheet, Loader2, Square, SquareCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeckWithCounts } from "@/lib/types";

interface ExportPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decks: DeckWithCounts[];
}

export function ExportPrintDialog({ open, onOpenChange, decks }: ExportPrintDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [downloading, setDownloading] = useState(false);

  // Mặc định chọn tất cả deck mỗi khi mở dialog
  const allIds = useMemo(() => decks.map((d) => d.id), [decks]);
  const [initializedFor, setInitializedFor] = useState<string>("");
  const signature = allIds.join(",");
  if (open && initializedFor !== signature) {
    setSelectedIds(new Set(allIds));
    setInitializedFor(signature);
  }

  const allSelected = decks.length > 0 && decks.every((d) => selectedIds.has(d.id));

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) {
      toast.error("Chọn ít nhất 1 deck");
      return;
    }
    setDownloading(true);
    try {
      const ids = Array.from(selectedIds).join(",");
      const res = await fetch(`/api/cards/export-print?deckIds=${encodeURIComponent(ids)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Lỗi xuất file (${res.status})`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="?([^"]+)"?/.exec(disposition);
      const filename = match?.[1] ?? "tu-vung-de-in.xlsx";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`Đã tải ${filename} (${selectedIds.size} deck)`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi xuất file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Xuất Excel để in</DialogTitle>
          <DialogDescription>
            Mỗi deck được chọn sẽ là một cột trong file Excel, mỗi ô là một từ vựng — tiện in ra
            giấy để ôn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            {allSelected ? (
              <SquareCheck className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {allSelected ? `Bỏ chọn tất cả` : `Chọn tất cả (${decks.length})`}
          </button>

          <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-1">
            {decks.map((deck) => {
              const checked = selectedIds.has(deck.id);
              return (
                <li key={deck.id}>
                  <button
                    type="button"
                    onClick={() => toggle(deck.id)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/40"
                    aria-pressed={checked}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input"
                      }`}
                    >
                      {checked ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm"
                      style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
                    >
                      {deck.icon ?? "📘"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{deck.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {deck._count.cards} từ
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>
            Đóng
          </Button>
          <Button onClick={handleExport} disabled={downloading || selectedIds.size === 0}>
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Xuất {selectedIds.size > 0 ? `${selectedIds.size} deck` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
