"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CircleHelp,
  Flame,
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useProgress } from "@/hooks/use-progress";
import { useStreakState } from "@/hooks/use-streak";
import { useSettingsDialog } from "@/components/settings/settings-dialog";
import { streakMessage } from "@/lib/streak";
import { AppsMenu } from "./apps-menu";
import { GmailLogo } from "./gmail-logo";
import { IconButton } from "./icon-button";

interface TopBarProps {
  onMenuClick: () => void;
}

/** Mở bảng phím tắt (ShortcutsModal nghe phím "?"). */
function openShortcuts(): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
}

/** Thanh trên cùng kiểu Gmail: ☰ + logo, ô tìm kiếm bo tròn, cụm icon và avatar. */
export function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const { data: progress } = useProgress();
  const streak = useStreakState();
  const settings = useSettingsDialog();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/inbox?folder=all&q=${encodeURIComponent(q)}` : "/inbox");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-background px-2 md:px-3">
      <div className="flex shrink-0 items-center gap-1 md:w-[232px]">
        <IconButton label="Menu chính" onClick={onMenuClick} className="h-12 w-12">
          <Menu className="h-6 w-6" />
        </IconButton>
        <Link href="/inbox" className="flex items-center gap-1.5 pl-1" aria-label="Hộp thư từ vựng">
          <GmailLogo className="h-6 w-8" />
          <span className="hidden text-[22px] text-muted-foreground sm:inline">Gmail</span>
        </Link>
      </div>

      <form
        onSubmit={submit}
        className="flex h-12 min-w-0 max-w-[720px] flex-1 items-center gap-1 rounded-full bg-mail-search px-1 transition-shadow focus-within:bg-card focus-within:shadow-[0_1px_3px_rgba(0,0,0,.2)]"
      >
        <IconButton label="Tìm kiếm" type="submit">
          <Search className="h-5 w-5" />
        </IconButton>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm từ, nghĩa hoặc câu ví dụ"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          aria-label="Tìm trong hộp thư từ vựng"
        />
        <IconButton label="Tìm nâng cao (Cmd+K)" className="hidden sm:flex" onClick={() => router.push("/search")}>
          <SlidersHorizontal className="h-5 w-5" />
        </IconButton>
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {streak ? (
          <button
            type="button"
            onClick={() => settings?.openSettings("study")}
            title={streakMessage(streak)}
            className={cn(
              "mr-1 hidden h-12 items-center gap-1.5 rounded-full bg-mail-search px-4 text-sm font-medium lg:flex",
              streak.status === "urgent" && "text-[#e37400]",
            )}
          >
            <Flame className="h-4 w-4" />
            {streak.currentStreak} ngày
          </button>
        ) : null}
        <IconButton label="Phím tắt" onClick={openShortcuts} className="hidden md:flex">
          <CircleHelp className="h-6 w-6" />
        </IconButton>
        <IconButton label="Cài đặt" onClick={() => settings?.openSettings()} className="hidden md:flex">
          <Settings className="h-6 w-6" />
        </IconButton>
        <AppsMenu />
        <button
          type="button"
          onClick={() => settings?.openSettings("profile")}
          className="ml-1 flex items-center gap-2 rounded-full p-1 hover:bg-mail-hover md:border md:pl-4"
          title={progress?.displayName?.trim() || "Hồ sơ của bạn"}
        >
          <span className="hidden max-w-[120px] truncate text-sm text-muted-foreground md:inline">
            {progress?.displayName?.trim() || "Hồ sơ"}
          </span>
          <Avatar
            src={progress?.avatarUrl}
            name={progress?.displayName ?? "Bạn"}
            className="h-8 w-8"
            size={13}
          />
        </button>
      </div>
    </header>
  );
}
