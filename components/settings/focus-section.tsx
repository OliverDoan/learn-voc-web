"use client";

import Link from "next/link";
import { Focus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FocusSectionProps {
  /** Gọi khi bấm mở chế độ tập trung (dùng để đóng popup cài đặt trước khi rời trang). */
  onNavigate?: () => void;
}

/** Khối "Chế độ tập trung": lối tắt sang màn hình Pomodoro toàn cảnh. */
export function FocusSection({ onNavigate }: FocusSectionProps) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Focus className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Chế độ tập trung</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Màn hình toàn cảnh với đồng hồ thời gian thực hoặc bộ đếm Pomodoro để tập trung
        học. Nhấn Esc để thoát.
      </p>
      <Link href="/focus" onClick={onNavigate}>
        <Button>
          <Focus className="h-4 w-4" /> Mở chế độ tập trung
        </Button>
      </Link>
    </section>
  );
}
