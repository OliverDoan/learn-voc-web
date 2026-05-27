"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useBulkCards } from "@/hooks/use-cards";
import { useDecks } from "@/hooks/use-decks";

interface MoveCardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardIds: string[];
  currentDeckId: string;
  onDone: () => void;
}

export function MoveCardsDialog({
  open,
  onOpenChange,
  cardIds,
  currentDeckId,
  onDone,
}: MoveCardsDialogProps) {
  const { data: decks } = useDecks();
  const [targetDeckId, setTargetDeckId] = useState<string>("");
  const bulkMut = useBulkCards();

  const targets = decks?.filter((d) => d.id !== currentDeckId) ?? [];

  const handleMove = async () => {
    if (!targetDeckId) {
      toast.error("Chưa chọn deck đích");
      return;
    }
    try {
      const res = await bulkMut.mutateAsync({
        action: "move",
        ids: cardIds,
        targetDeckId,
      });
      toast.success(`Đã chuyển ${res.count} từ`);
      onDone();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi chuyển");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Chuyển {cardIds.length} từ sang deck khác</DialogTitle>
          <DialogDescription>Chọn deck đích để chuyển các từ đã chọn.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Deck đích</Label>
          {targets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bạn chưa có deck khác. Tạo thêm deck để dùng chức năng này.
            </p>
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto">
              {targets.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setTargetDeckId(d.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    targetDeckId === d.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-md text-base"
                    style={{ backgroundColor: `${d.color}20`, color: d.color }}
                  >
                    {d.icon ?? "📘"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {d._count.cards} từ
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            onClick={handleMove}
            disabled={!targetDeckId || bulkMut.isPending || targets.length === 0}
          >
            {bulkMut.isPending ? "Đang chuyển..." : "Chuyển"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
