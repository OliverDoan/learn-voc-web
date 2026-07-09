"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Blocks,
  BookMarked,
  BookOpen,
  BookText,
  CircleAlert,
  GraduationCap,
  History,
  Home,
  Layers,
  Library,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sprout,
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
  { href: "/history", label: "Lịch sử", icon: History, mobile: false },
  { href: "/mistakes", label: "Xem lỗi sai", icon: CircleAlert, mobile: false },
  { href: "/ielts", label: "IELTS", icon: GraduationCap, mobile: true },
  { href: "/grammar", label: "Ngữ pháp", icon: BookText, mobile: true },
  { href: "/word-formation", label: "Cấu tạo từ", icon: Blocks, mobile: false },
  { href: "/word-roots", label: "Từ gốc", icon: Sprout, mobile: false },
  { href: "/confusing-words", label: "Từ dễ lẫn", icon: ArrowLeftRight, mobile: false },
  { href: "/trash", label: "Thùng rác", icon: Trash2, mobile: false },
  { href: "/settings", label: "Cài đặt", icon: Settings, mobile: true },
];

const mobileItems = items.filter((i) => i.mobile);

// Store nhỏ cho trạng thái thu gọn sidebar, lưu ở localStorage.
// Dùng useSyncExternalStore để SSR luôn trả về false (khớp server) rồi
// tự đồng bộ giá trị client sau hydrate — tránh lỗi hydration mismatch.
const COLLAPSED_KEY = "voc-sidebar-collapsed";
const collapsedListeners = new Set<() => void>();

function getCollapsedSnapshot(): boolean {
  return localStorage.getItem(COLLAPSED_KEY) === "1";
}

function subscribeCollapsed(cb: () => void): () => void {
  collapsedListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    collapsedListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function setCollapsedStore(next: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  } catch {
    /* bỏ qua */
  }
  collapsedListeners.forEach((cb) => cb());
}

export function Nav() {
  const pathname = usePathname();
  const { data: progress } = useProgress();
  // Thu gọn sidebar (chỉ hiện icon khi thu gọn).
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    () => false,
  );
  const toggle = () => setCollapsedStore(!collapsed);

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
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  // 4 mục chính + nút "Thêm" mở bảng chứa toàn bộ mục.
  const primary = mobileItems.slice(0, 4);
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
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center text-xs font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent",
                    )}
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
        <ul className="grid grid-cols-5">
          {primary.map((item) => {
            const active = isActive(item.href);
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
