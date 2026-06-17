"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useImportDeck } from "@/hooks/use-decks";
import {
  deckNameFromFilename,
  detectFormatByName,
  parseDeckImport,
  type CardImport,
  type DeckMeta,
  type ImportError,
} from "@/lib/import-parser";

interface ImportDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParseState {
  filename: string;
  format: "csv" | "json";
  deck: DeckMeta;
  cards: CardImport[];
  errors: ImportError[];
}

const PREVIEW_LIMIT = 5;

export function ImportDeckDialog({ open, onOpenChange }: ImportDeckDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseState, setParseState] = useState<ParseState | null>(null);
  const [deckName, setDeckName] = useState("");
  const importMut = useImportDeck();

  const reset = () => {
    setParseState(null);
    setDeckName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (file: File) => {
    const format = detectFormatByName(file.name);
    if (!format) {
      toast.error("Chỉ hỗ trợ file .csv hoặc .json");
      return;
    }
    try {
      const text = await file.text();
      const fallbackName = deckNameFromFilename(file.name);
      const result = parseDeckImport(text, format, fallbackName);
      setParseState({ filename: file.name, format, ...result });
      setDeckName(result.deck.name);
      if (result.cards.length === 0 && result.errors.length > 0) {
        toast.error("File không có từ hợp lệ");
      } else if (result.errors.length > 0) {
        toast.warning(`Có ${result.errors.length} dòng bị bỏ qua`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không đọc được file");
    }
  };

  const handleImport = async () => {
    if (!parseState || parseState.cards.length === 0) return;
    const name = deckName.trim();
    if (!name) {
      toast.error("Tên deck không được trống");
      return;
    }
    try {
      const res = await importMut.mutateAsync({
        deck: { ...parseState.deck, name },
        cards: parseState.cards,
      });
      toast.success(`Đã tạo deck "${res.deckName}" với ${res.count} từ`);
      handleClose(false);
      router.push(`/decks/${res.deckId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi import");
    }
  };

  const isPending = importMut.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={() => handleClose(false)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import deck từ file</DialogTitle>
          <DialogDescription>
            Tạo một deck mới kèm toàn bộ từ vựng từ file CSV hoặc JSON. Tải file mẫu bên dưới để
            biết format chuẩn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Download className="h-4 w-4" />
              Tải file mẫu
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/deck-template.json" download>
                <Button type="button" variant="outline" size="sm">
                  <FileText className="h-4 w-4" />
                  Template JSON (đầy đủ)
                </Button>
              </a>
              <a href="/deck-template.csv" download>
                <Button type="button" variant="outline" size="sm">
                  <FileText className="h-4 w-4" />
                  Template CSV
                </Button>
              </a>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              JSON hỗ trợ đầy đủ: thông tin deck (name, description, color, icon) +{" "}
              <code className="rounded bg-muted px-1">rootWord</code>,{" "}
              <code className="rounded bg-muted px-1">wordForms</code>. CSV chỉ chứa danh sách từ —
              tên deck lấy từ tên file (sửa được bên dưới).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-deck-file">Chọn file (.csv hoặc .json)</Label>
            <input
              ref={fileInputRef}
              id="import-deck-file"
              type="file"
              accept=".csv,.json,text/csv,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {parseState ? (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{parseState.filename}</span>
                <div className="flex gap-2">
                  <Badge variant="success">{parseState.cards.length} hợp lệ</Badge>
                  {parseState.errors.length > 0 ? (
                    <Badge variant="warning">{parseState.errors.length} lỗi</Badge>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-deck-name">Tên deck</Label>
                <Input
                  id="import-deck-name"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Tên deck mới"
                  maxLength={80}
                />
              </div>

              {parseState.cards.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Xem trước {Math.min(parseState.cards.length, PREVIEW_LIMIT)} từ đầu:
                  </p>
                  <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                    {parseState.cards.slice(0, PREVIEW_LIMIT).map((card, idx) => (
                      <li key={idx} className="flex gap-2 border-b border-border/40 pb-1">
                        <span className="font-medium">{card.word}</span>
                        <span className="text-muted-foreground">— {card.meaning}</span>
                      </li>
                    ))}
                    {parseState.cards.length > PREVIEW_LIMIT ? (
                      <li className="text-xs text-muted-foreground">
                        ... và {parseState.cards.length - PREVIEW_LIMIT} từ khác
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {parseState.errors.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-destructive">Các lỗi bị bỏ qua:</p>
                  <ul className="max-h-32 space-y-0.5 overflow-y-auto text-xs text-destructive">
                    {parseState.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>• {err.message}</li>
                    ))}
                    {parseState.errors.length > 10 ? (
                      <li>... và {parseState.errors.length - 10} lỗi khác</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Huỷ
          </Button>
          <Button
            onClick={handleImport}
            disabled={isPending || !parseState || parseState.cards.length === 0}
          >
            <Upload className="h-4 w-4" />
            {isPending
              ? "Đang import..."
              : parseState
                ? `Tạo deck (${parseState.cards.length} từ)`
                : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
