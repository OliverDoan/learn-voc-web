"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, ClipboardCheck, Layers, Mail, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDueCount } from "@/hooks/use-due-count";

interface RailItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const RAIL_ITEMS: readonly RailItem[] = [
  { href: "/inbox", label: "Thư", icon: Mail },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/stories", label: "Truyện", icon: BookMarked },
  { href: "/exam", label: "Kiểm tra", icon: ClipboardCheck },
];

/** Hiển thị số đếm kiểu Gmail: quá 99 thì "99+". */
function badgeText(n: number): string {
  return n > 99 ? "99+" : String(n);
}

/** Cột icon hẹp ngoài cùng bên trái (Mail / Chat / Meet của Gmail). */
export function AppRail() {
  const pathname = usePathname();
  const { total } = useDueCount();

  return (
    <nav className="flex w-[68px] shrink-0 flex-col items-center gap-3 pt-2">
      {RAIL_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const showBadge = item.href === "/inbox" && total > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className="group flex flex-col items-center gap-1 text-xs font-medium"
          >
            <span
              className={cn(
                "relative flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                active ? "bg-mail-active" : "group-hover:bg-foreground/[.08]",
              )}
            >
              <item.icon className="h-5 w-5" />
              {showBadge ? (
                <span className="absolute -top-1.5 left-7 rounded-full bg-[#b3261e] px-1.5 text-[11px] font-medium leading-[18px] text-white">
                  {badgeText(total)}
                </span>
              ) : null}
            </span>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
