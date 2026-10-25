"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useToggleFavorite } from "@/hooks/use-cards";

interface FavoriteToggleButtonProps {
  cardId: string;
  favorite: boolean;
}

/** Nút ngôi sao thêm/bỏ thẻ khỏi danh sách Yêu thích. */
export function FavoriteToggleButton({ cardId, favorite }: FavoriteToggleButtonProps) {
  const toggle = useToggleFavorite();
  const label = favorite ? "Bỏ yêu thích" : "Thêm vào yêu thích";

  const onClick = async (e: React.MouseEvent) => {
    // Nút có thể nằm trong vùng bấm-để-lật thẻ.
    e.stopPropagation();
    try {
      await toggle.mutateAsync({ cardId, favorite: !favorite });
      toast.success(favorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật yêu thích");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={toggle.isPending}
      title={label}
      aria-label={label}
      aria-pressed={favorite}
    >
      <Star className={`h-4 w-4 ${favorite ? "fill-amber-400 text-amber-400" : ""}`} />
    </Button>
  );
}
