"use client";

import { useState } from "react";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
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

interface ExportCardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  deckName: string;
  cardCount: number;
}

type ExportFormat = "csv" | "json";

export function ExportCardsDialog({
  open,
  onOpenChange,
  deckId,
  deckName,
  cardCount,
}: ExportCardsDialogProps) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (cardCount === 0) {
      toast.error("Deck không có từ nào để xuất");
      return;
    }
    setDownloading(format);
    try {
      const res = await fetch(`/api/cards/export?deckId=${encodeURIComponent(deckId)}&format=${format}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Lỗi xuất file (${res.status})`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="?([^"]+)"?/.exec(disposition);
      const filename = match?.[1] ?? `deck.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`Đã tải ${filename}`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi xuất file");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xuất từ vựng — {deckName}</DialogTitle>
          <DialogDescription>
            Tải toàn bộ {cardCount} từ ra file. JSON giữ đầy đủ thông tin, CSV tương thích Anki / Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={downloading !== null}
            onClick={() => handleExport("json")}
            className="flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              {downloading === "json" ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <FileJson className="h-5 w-5 text-primary" />
              )}
              <span className="font-semibold">JSON</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Giữ nguyên cấu trúc deck + cards. Re-import lại không mất dữ liệu.
            </p>
          </button>

          <button
            type="button"
            disabled={downloading !== null}
            onClick={() => handleExport("csv")}
            className="flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              {downloading === "csv" ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              <span className="font-semibold">CSV</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mở được bằng Excel / Google Sheets. Tags ngăn cách bằng dấu chấm phẩy.
            </p>
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading !== null}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExportButton({
  deckId,
  deckName,
  cardCount,
}: {
  deckId: string;
  deckName: string;
  cardCount: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4" /> Xuất
      </Button>
      <ExportCardsDialog
        open={open}
        onOpenChange={setOpen}
        deckId={deckId}
        deckName={deckName}
        cardCount={cardCount}
      />
    </>
  );
}
