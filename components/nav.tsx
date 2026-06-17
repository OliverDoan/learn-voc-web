"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Home,
  Layers,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  mobile?: boolean;
}

const items: NavItem[] = [
  { href: "/", label: "Trang chủ", icon: Home, mobile: true },
  { href: "/decks", label: "Decks", icon: Layers, mobile: true },
  { href: "/favorites", label: "Yêu thích", icon: Star, mobile: false },
  { href: "/ielts", label: "IELTS", icon: GraduationCap, mobile: true },
  { href: "/trash", label: "Thùng rác", icon: Trash2, mobile: false },
  { href: "/settings", label: "Cài đặt", icon: Settings, mobile: true },
];

const mobileItems = items.filter((i) => i.mobile);

export function Nav() {
  const pathname = usePathname();

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
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur">
      <ul className="grid grid-cols-4">
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
