"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BookText,
  Focus,
  GraduationCap,
  Home,
  Layers,
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
  { href: "/favorites", label: "Yêu thích", icon: Star, mobile: false },
  { href: "/ielts", label: "IELTS", icon: GraduationCap, mobile: true },
  { href: "/grammar", label: "Ngữ pháp", icon: BookText, mobile: true },
  { href: "/focus", label: "Tập trung", icon: Focus, mobile: false },
  { href: "/trash", label: "Thùng rác", icon: Trash2, mobile: false },
  { href: "/settings", label: "Cài đặt", icon: Settings, mobile: true },
];

const mobileItems = items.filter((i) => i.mobile);

export function Nav() {
  const pathname = usePathname();
  const { data: progress } = useProgress();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-card p-4 sticky top-0 h-screen overflow-y-auto">
      <Link href="/" className="mb-7 flex items-center gap-2.5 px-2 pt-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(23,61,201,.32)]">
          <BookOpen className="h-[18px] w-[18px]" />
        </span>
        <span className="font-brand text-lg font-bold tracking-tight">VocaLearn</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        className={cn(
          "mt-auto flex items-center gap-3 rounded-[10px] border p-2.5 transition-colors",
          pathname.startsWith("/settings")
            ? "border-primary/40 bg-primary/5"
            : "border-transparent hover:bg-accent",
        )}
      >
        <Avatar
          src={progress?.avatarUrl}
          name={progress?.displayName ?? "Bạn"}
          className="h-9 w-9"
          size={14}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {progress?.displayName?.trim() || "Hồ sơ của bạn"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            🔥 {progress?.currentStreak ?? 0} ngày streak
          </p>
        </div>
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
