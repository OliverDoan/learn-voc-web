"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Blocks,
  BookMarked,
  BookOpen,
  BookText,
  Focus,
  GraduationCap,
  Home,
  Layers,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useProgress } from "@/hooks/use-progress";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  mobile?: boolean;
}

const items: NavItem[] = [
  { href: "/", label: "Trang chủ", icon: Home, mobile: true },
  { href: "/search", label: "Tra từ", icon: Search, mobile: false },
  { href: "/decks", label: "Decks", icon: Layers, mobile: true },
  { href: "/stories", label: "Truyện chêm", icon: BookMarked, mobile: false },
  { href: "/words", label: "Tất cả từ", icon: Library, mobile: false },
  { href: "/favorites", label: "Yêu thích", icon: Star, mobile: false },
  { href: "/ielts", label: "IELTS", icon: GraduationCap, mobile: true },
  { href: "/grammar", label: "Ngữ pháp", icon: BookText, mobile: true },
  { href: "/word-formation", label: "Cấu tạo từ", icon: Blocks, mobile: false },
  { href: "/focus", label: "Tập trung", icon: Focus, mobile: false },
  { href: "/trash", label: "Thùng rác", icon: Trash2, mobile: false },
  { href: "/settings", label: "Cài đặt", icon: Settings, mobile: true },
];

const mobileItems = items.filter((i) => i.mobile);

export function Nav() {
  const pathname = usePathname();
  const { data: progress } = useProgress();
  // Thu gọn sidebar — khởi tạo từ localStorage (chỉ icon khi thu gọn).
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("voc-sidebar-collapsed") === "1";
  });
  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("voc-sidebar-collapsed", next ? "1" : "0");
      } catch {
        /* bỏ qua */
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col border-r bg-card sticky top-0 h-screen overflow-y-auto transition-[width] duration-200",
        collapsed ? "w-[68px] p-2" : "w-56 p-4",
      )}
    >
      <div
        className={cn(
          "mb-7 flex items-center pt-1",
          collapsed ? "flex-col gap-2" : "justify-between px-2",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(23,61,201,.32)]">
            <BookOpen className="h-[18px] w-[18px]" />
          </span>
          {!collapsed ? (
            <span className="font-brand text-lg font-bold tracking-tight">VocaLearn</span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-[10px] text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        title={collapsed ? progress?.displayName?.trim() || "Hồ sơ của bạn" : undefined}
        className={cn(
          "mt-auto flex items-center rounded-[10px] border transition-colors",
          collapsed ? "justify-center p-1.5" : "gap-3 p-2.5",
          pathname.startsWith("/settings")
            ? "border-primary/40 bg-primary/5"
            : "border-transparent hover:bg-accent",
        )}
      >
        <Avatar
          src={progress?.avatarUrl}
          name={progress?.displayName ?? "Bạn"}
          className="h-9 w-9 shrink-0"
          size={14}
        />
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {progress?.displayName?.trim() || "Hồ sơ của bạn"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              🔥 {progress?.currentStreak ?? 0} ngày streak
            </p>
          </div>
        ) : null}
      </Link>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur">
      <ul className="grid grid-cols-5">
        {mobileItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
