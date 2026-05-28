"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Home,
  Layers,
  Settings,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  mobile?: boolean;
}

const items: NavItem[] = [
  { href: "/", label: "Trang chủ", icon: Home, mobile: true },
  { href: "/decks", label: "Decks", icon: Layers, mobile: true },
  { href: "/ielts", label: "IELTS", icon: GraduationCap, mobile: true },
  { href: "/stats", label: "Thống kê", icon: BarChart3, mobile: true },
  { href: "/achievements", label: "Huy hiệu", icon: Trophy, mobile: false },
  { href: "/settings", label: "Cài đặt", icon: Settings, mobile: true },
];

const mobileItems = items.filter((i) => i.mobile);

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-card/40 p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">VocaLearn</span>
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <ThemeToggle compact className="w-full justify-around" />
      </div>
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

export function MobileThemeToggle() {
  return (
    <div className="md:hidden fixed top-3 right-3 z-30">
      <ThemeToggle compact />
    </div>
  );
}
