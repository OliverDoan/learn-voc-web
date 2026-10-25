"use client";

import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";

interface WrongLanguageNoticeProps {
  /** Đường dẫn đúng của deck này */
  href: string;
  deckName?: string;
}

/**
 * Deck mở nhầm khu vực (deck tiếng Anh mở bằng URL /chinese/... hoặc ngược lại).
 * Không dùng 404 vì deck vẫn tồn tại — chỉ dẫn người dùng sang đúng trang.
 */
export function WrongLanguageNotice({
  href,
  deckName,
}: WrongLanguageNoticeProps) {
  return (
    <div className="container mx-auto max-w-lg p-6">
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card p-10 text-center">
        <TriangleAlert className="mb-4 h-8 w-8 text-amber-500" />
        <h2 className="mb-2 text-lg font-semibold">
          Deck này không thuộc mục đang mở
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {deckName ? `“${deckName}” ` : "Deck này "}
          nằm ở khu vực khác. Mở đúng trang để dùng phát âm và bài tập phù hợp.
        </p>
        <Link
          href={href}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Tới đúng trang deck <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
