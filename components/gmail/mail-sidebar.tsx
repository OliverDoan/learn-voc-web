"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  File,
  Inbox,
  Mails,
  Pencil,
  Plus,
  Send,
  Star,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDecks } from "@/hooks/use-decks";
import { useDueCount } from "@/hooks/use-due-count";
import { useHiddenNavItems } from "@/hooks/use-sidebar-prefs";
import { NAV_ITEMS } from "@/lib/nav-items";
import { FOLDER_LABELS, parseFolder, type InboxFolder } from "@/lib/inbox";
import { useSettingsDialog } from "@/components/settings/settings-dialog";

interface MailSidebarProps {
  collapsed: boolean;
  onCompose: () => void;
  /** Gọi sau khi chọn mục (đóng drawer trên mobile). */
  onNavigate?: () => void;
}

const FOLDER_ICONS: Record<InboxFolder, LucideIcon> = {
  inbox: Inbox,
  starred: Star,
  snoozed: Clock,
  sent: Send,
  drafts: File,
  all: Mails,
  trash: Trash2,
};

/** Trang "Học tập" luôn hiện trong sidebar; các mục còn lại nằm sau nút "Thêm". */
const EXCLUDED_HREFS = new Set(["/inbox", "/trash", "/settings"]);

interface RowProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  count?: number;
  bold?: boolean;
  iconColor?: string;
  onClick?: () => void;
}

function SidebarRow({ href, icon: Icon, label, active, collapsed, count, bold, iconColor, onClick }: RowProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      prefetch={false}
      className={cn(
        "flex h-8 items-center text-sm transition-colors",
        collapsed
          ? "mx-auto w-14 justify-center rounded-full"
          : "mr-2 gap-4 rounded-r-full pl-[26px] pr-3",
        active ? "bg-mail-active font-bold text-foreground" : "hover:bg-foreground/[.06]",
        bold && "font-bold",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" style={iconColor ? { color: iconColor } : undefined} />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {count ? <span className="text-xs font-bold">{count.toLocaleString("vi-VN")}</span> : null}
        </>
      ) : null}
    </Link>
  );
}

/** Cột trái kiểu Gmail: nút Soạn, thư mục, trang học tập, và "Nhãn" = các deck. */
export function MailSidebar({ collapsed, onCompose, onNavigate }: MailSidebarProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const settings = useSettingsDialog();
  const { total, newCount } = useDueCount();
  const { data: decks } = useDecks();
  const hidden = useHiddenNavItems();
  const [showMore, setShowMore] = useState(false);

  const onInbox = pathname.startsWith("/inbox");
  const currentLabel = onInbox ? params.get("label") : null;
  const currentFolder = onInbox && !currentLabel ? parseFolder(params.get("folder")) : null;

  const studyItems = NAV_ITEMS.filter((i) => !EXCLUDED_HREFS.has(i.href));
  const visibleStudy = studyItems.filter((i) => showMore || !hidden.has(i.href));
  const labels = (decks ?? [])
    .filter((d) => !d.locked)
    .toSorted((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const folderCount = (f: InboxFolder): number | undefined =>
    f === "inbox" ? total : f === "drafts" ? newCount : undefined;

  return (
    <nav className={cn("flex flex-col pb-6", collapsed ? "w-[72px]" : "w-[256px]")}>
      <div className={cn("mb-4 mt-2", collapsed ? "flex justify-center" : "pl-2")}>
        <button
          type="button"
          onClick={onCompose}
          title="Soạn từ mới"
          className={cn(
            "flex h-14 items-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm transition-shadow hover:shadow-[0_1px_3px_rgba(0,0,0,.3),0_4px_8px_3px_rgba(0,0,0,.15)]",
            collapsed ? "w-14 justify-center" : "gap-3 pl-4 pr-6",
          )}
        >
          <Pencil className="h-6 w-6" />
          {!collapsed ? <span className="text-sm font-medium">Soạn từ mới</span> : null}
        </button>
      </div>

      {(Object.keys(FOLDER_ICONS) as InboxFolder[]).map((f) => {
        const count = folderCount(f);
        return (
          <SidebarRow
            key={f}
            href={f === "trash" ? "/trash" : `/inbox?folder=${f}`}
            icon={FOLDER_ICONS[f]}
            label={FOLDER_LABELS[f]}
            active={f === "trash" ? pathname.startsWith("/trash") : currentFolder === f}
            collapsed={collapsed}
            count={count}
            bold={f === "inbox" && !!count}
            onClick={onNavigate}
          />
        );
      })}

      {!collapsed ? (
        <p className="mb-1 mt-4 pl-[26px] text-sm font-medium">Học tập</p>
      ) : (
        <div className="mx-auto my-2 h-px w-8 bg-border" />
      )}
      {visibleStudy.map((item) => (
        <SidebarRow
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname.startsWith(item.href)}
          collapsed={collapsed}
          onClick={onNavigate}
        />
      ))}
      {hidden.size > 0 && !collapsed ? (
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="mr-2 flex h-8 items-center gap-4 rounded-r-full pl-[26px] text-sm hover:bg-foreground/[.06]"
        >
          {showMore ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          {showMore ? "Ẩn bớt" : "Thêm"}
        </button>
      ) : null}

      {!collapsed ? (
        <>
          <div className="mb-1 mt-5 flex items-center justify-between pl-[26px] pr-4">
            <span className="text-base font-medium">Nhãn</span>
            <Link
              href="/decks"
              prefetch={false}
              onClick={onNavigate}
              title="Quản lý deck"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-foreground/[.08]"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>
          {labels.map((d) => (
            <SidebarRow
              key={d.id}
              href={`/inbox?label=${d.id}`}
              icon={Tag}
              iconColor={d.color}
              label={d.name}
              active={currentLabel === d.id}
              collapsed={false}
              count={(d.due ?? 0) + (d.newCount ?? 0) || undefined}
              onClick={onNavigate}
            />
          ))}
        </>
      ) : null}

      {!collapsed ? (
        <button
          type="button"
          onClick={() => settings?.openSettings("sidebar")}
          className="mt-4 pl-[26px] text-left text-xs text-muted-foreground hover:underline"
        >
          Tuỳ chỉnh mục hiển thị
        </button>
      ) : null}
    </nav>
  );
}
