"use client";

import { SettingsPanel } from "@/components/settings/settings-panel";

/**
 * Trang cài đặt (truy cập trực tiếp qua URL). Lối vào chính trong app là popup
 * `SettingsDialog`; trang này dùng lại đúng panel đó nên chỉ cần khai báo bố cục.
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-5xl p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-muted-foreground">
          Tuỳ chỉnh mục tiêu học và các thông số cá nhân.
        </p>
      </header>
      <SettingsPanel className="min-h-[70vh] overflow-hidden rounded-2xl border bg-card" />
    </div>
  );
}
