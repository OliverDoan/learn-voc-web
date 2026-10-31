"use client";

import Link from "next/link";
import { BookText, CircleAlert, GraduationCap, History, Plus, type LucideIcon } from "lucide-react";
import { useSettingsDialog } from "@/components/settings/settings-dialog";

interface PanelItem {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

// Màu icon giống các add-on bên phải Gmail (Calendar / Keep / Tasks / Contacts).
const PANEL_ITEMS: readonly PanelItem[] = [
  { href: "/grammar", label: "Ngữ pháp", icon: BookText, color: "#1a73e8" },
  { href: "/ielts", label: "IELTS", icon: GraduationCap, color: "#fbbc04" },
  { href: "/history", label: "Lịch sử", icon: History, color: "#1a73e8" },
  { href: "/mistakes", label: "Xem lỗi sai", icon: CircleAlert, color: "#ea4335" },
];

/** Thanh add-on hẹp bên phải. */
export function SidePanel() {
  const settings = useSettingsDialog();

  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-2 pt-2">
      {PANEL_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          title={item.label}
          aria-label={item.label}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-foreground/[.08]"
        >
          <item.icon className="h-5 w-5" style={{ color: item.color }} />
        </Link>
      ))}
      <div className="my-2 h-px w-5 bg-border" />
      <button
        type="button"
        title="Tuỳ chỉnh thanh bên"
        aria-label="Tuỳ chỉnh thanh bên"
        onClick={() => settings?.openSettings("sidebar")}
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/[.08]"
      >
        <Plus className="h-5 w-5" />
      </button>
    </aside>
  );
}
