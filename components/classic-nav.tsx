"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useProgress } from "@/hooks/use-progress";
import { useHiddenNavItems } from "@/hooks/use-sidebar-prefs";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { StreakChip } from "@/components/dashboard/streak-chip";
import { NAV_ITEMS } from "@/lib/nav-items";
import { useSettingsDialog } from "@/components/settings/settings-dialog";

/** Sidebar giao diện "Cổ điển" (VocaLearn / NewEra) — dùng khi tắt khung Gmail. */
export function ClassicNav() {
  const pathname = usePathname();
  const { data: progress } = useProgress();
  const settings = useSettingsDialog();
  // Thu gọn sidebar (chỉ hiện icon khi thu gọn).
  const [collapsed, toggle] = useSidebarCollapsed();
  // Mục bị ẩn do người dùng cấu hình trong Cài đặt (mục pinned luôn hiện).
  const hidden = useHiddenNavItems();
  const visibleItems = NAV_ITEMS.filter((i) => i.pinned || !hidden.has(i.href));

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
        <Link href="/decks" className="flex items-center gap-2.5">
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
        {visibleItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const itemClass = cn(
            "flex items-center rounded-[10px] text-sm font-medium transition-colors",
            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          );
          // Cài đặt mở dưới dạng popup thay vì điều hướng sang trang riêng.
          if (item.href === "/settings" && settings) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => settings.openSettings()}
                title={collapsed ? item.label : undefined}
                className={cn(itemClass, "w-full text-left")}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed ? item.label : null}
              </button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch ?? false}
              title={collapsed ? item.label : undefined}
              className={itemClass}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>

      <StreakChip collapsed={collapsed} />

      <button
        type="button"
        onClick={() => settings?.openSettings("profile")}
        title={collapsed ? progress?.displayName?.trim() || "Hồ sơ của bạn" : undefined}
        className={cn(
          "mt-auto flex items-center rounded-[10px] border text-left transition-colors",
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
            <p className="truncate text-xs text-muted-foreground">Xem hồ sơ &amp; cài đặt</p>
          </div>
        ) : null}
      </button>
    </aside>
  );
}
