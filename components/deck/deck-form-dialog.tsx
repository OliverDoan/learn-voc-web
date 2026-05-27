"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { DECK_COLORS } from "@/lib/constants";
import { useCreateDeck, useUpdateDeck } from "@/hooks/use-decks";
import type { Deck } from "@/lib/types";

interface DeckFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck?: Pick<Deck, "id" | "name" | "description" | "color" | "icon">;
}

const ICON_OPTIONS = ["📘", "📚", "🌍", "💼", "🎓", "🍔", "🎬", "🎮", "💪", "🏥"];

export function DeckFormDialog({ open, onOpenChange, deck }: DeckFormDialogProps) {
  const isEdit = !!deck;
  const [name, setName] = useState(deck?.name ?? "");
  const [description, setDescription] = useState(deck?.description ?? "");
  const [color, setColor] = useState<string>(deck?.color ?? DECK_COLORS[0]);
  const [icon, setIcon] = useState<string>(deck?.icon ?? ICON_OPTIONS[0]);

  const createMut = useCreateDeck();
  const updateMut = useUpdateDeck(deck?.id ?? "");

  useEffect(() => {
    if (open) {
      setName(deck?.name ?? "");
      setDescription(deck?.description ?? "");
      setColor(deck?.color ?? DECK_COLORS[0]);
      setIcon(deck?.icon ?? ICON_OPTIONS[0]);
    }
  }, [open, deck]);

  const isPending = createMut.isPending || updateMut.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Tên deck không được trống");
      return;
    }
    try {
      if (isEdit && deck) {
        await updateMut.mutateAsync({ name: name.trim(), description, color, icon });
        toast.success("Cập nhật deck thành công");
      } else {
        await createMut.mutateAsync({ name: name.trim(), description, color, icon });
        toast.success("Đã tạo deck mới");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi không xác định");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa deck" : "Tạo deck mới"}</DialogTitle>
          <DialogDescription>
            Nhóm các từ vựng theo chủ đề (vd: Business, IELTS, Daily life)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deck-name">Tên deck</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: IELTS 6.5"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deck-desc">Mô tả (tuỳ chọn)</Label>
            <Textarea
              id="deck-desc"
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Màu</Label>
            <div className="flex flex-wrap gap-2">
              {DECK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-background transition-all ${
                    color === c ? "ring-2 ring-foreground scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Màu ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Biểu tượng</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`h-10 w-10 rounded-md border text-xl transition-all ${
                    icon === emoji ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Đang lưu..." : isEdit ? "Lưu" : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
