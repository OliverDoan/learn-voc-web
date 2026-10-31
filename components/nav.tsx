"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHiddenNavItems } from "@/hooks/use-sidebar-prefs";
import { NAV_ITEMS } from "@/lib/nav-items";
import { useSettingsDialog } from "@/components/settings/settings-dialog";

export function MobileNav() {
  const pathname = usePathname();
  const settings = useSettingsDialog();
  const [moreOpen, setMoreOpen] = useState(false);
  const hidden = useHiddenNavItems();
  const visibleItems = NAV_ITEMS.filter((i) => i.pinned || !hidden.has(i.href));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  // 4 mục chính (chỉ lấy mục đang hiện) + nút "Thêm" mở bảng chứa toàn bộ mục.
  const primary = visibleItems.filter((i) => i.mobile).slice(0, 4);
  const onPrimary = primary.some((i) => isActive(i.href));

  return (
    <>
      {moreOpen ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t bg-card p-4 pb-6 shadow-[0_-12px_40px_rgba(0,0,0,.15)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
            <div className="grid grid-cols-4 gap-2">
              {visibleItems.map((item) => {
                const active = isActive(item.href);
                const sheetClass = cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center text-xs font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                );
                // Cài đặt mở popup thay vì điều hướng sang trang riêng.
                if (item.href === "/settings" && settings) {
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setMoreOpen(false);
                        settings.openSettings();
                      }}
                      className={sheetClass}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="leading-tight">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={item.prefetch ?? false}
                    onClick={() => setMoreOpen(false)}
                    className={sheetClass}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur">
        <ul
          className="grid"
          // Số cột theo số mục đang hiện + nút "Thêm" để không bị hở khoảng trống.
          style={{ gridTemplateColumns: `repeat(${primary.length + 1}, minmax(0, 1fr))` }}
        >
          {primary.map((item) => {
            const active = isActive(item.href);
            const barClass = cn(
              "flex w-full flex-col items-center gap-1 py-2 text-xs",
              active ? "text-primary" : "text-muted-foreground",
            );
            return (
              <li key={item.href}>
                {item.href === "/settings" && settings ? (
                  <button
                    type="button"
                    onClick={() => settings.openSettings()}
                    className={barClass}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={item.prefetch ?? false}
                    className={barClass}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className={cn(
                "flex w-full flex-col items-center gap-1 py-2 text-xs",
                moreOpen || !onPrimary ? "text-primary" : "text-muted-foreground",
              )}
              aria-label="Thêm mục"
            >
              <Menu className="h-5 w-5" />
              <span>Thêm</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
