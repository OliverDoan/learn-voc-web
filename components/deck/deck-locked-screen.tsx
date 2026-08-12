"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeckLockedScreenProps {
  /** Nơi quay lại (mặc định danh sách deck). */
  backHref?: string;
  backLabel?: string;
  /** Mô tả riêng cho từng trang (Học / Quiz / Lật thẻ...). */
  description?: string;
}

/**
 * Màn hình chặn khi deck đang khóa — dùng chung cho trang deck, học, quiz,
 * lật thẻ, phát âm... Không hiển thị bất kỳ nội dung nào của deck.
 */
export function DeckLockedScreen({
  backHref = "/decks",
  backLabel = "Quay lại",
  description = "Hãy hoàn thành (đánh dấu “đã học xong”) các Unit trước để mở khóa deck này.",
}: DeckLockedScreenProps) {
  return (
    <div className="container mx-auto max-w-xl p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Deck đang khóa</h2>
      <p className="mb-6 text-muted-foreground">{description}</p>
      <Link href={backHref}>
        <Button variant="outline" className="rounded-full">
          {backLabel}
        </Button>
      </Link>
    </div>
  );
}
