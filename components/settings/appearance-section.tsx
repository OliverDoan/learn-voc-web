"use client";

import { Palette } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemePicker } from "@/components/focus/theme-picker";

/** Khối "Giao diện": chọn sáng/tối và màu chủ đề của toàn ứng dụng. */
export function AppearanceSection() {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Giao diện</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Chọn chế độ hiển thị: sáng, tối, hoặc theo hệ thống của thiết bị.
      </p>
      <ThemeToggle className="flex-wrap" />

      <div className="mt-6 border-t pt-5">
        <h3 className="mb-1 text-sm font-semibold">Màu chủ đề</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Áp dụng cho toàn bộ ứng dụng. Chọn &quot;Mặc định&quot; để theo chế độ sáng/tối.
        </p>
        <ThemePicker className="items-start" hideLabel />
      </div>
    </section>
  );
}
