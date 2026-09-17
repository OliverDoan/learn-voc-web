"use client";

import { useState } from "react";
import {
  Award,
  Bell,
  Database,
  Loader2,
  Palette,
  Target,
  User,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/use-progress";
import { ProfileSection } from "@/components/settings/profile-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { SidebarSection } from "@/components/settings/sidebar-section";
import { PronounceSection } from "@/components/settings/pronounce-section";
import { FocusSection } from "@/components/settings/focus-section";
import { DailyGoalSection } from "@/components/settings/daily-goal-section";
import { ReminderSection } from "@/components/settings/reminder-section";
import { AchievementsSection } from "@/components/settings/achievements-section";
import { StreakSection } from "@/components/settings/streak-section";
import { UnlockDecksSection } from "@/components/settings/unlock-decks-section";
import { ResetSection } from "@/components/settings/reset-section";

/** Các nhóm cài đặt hiện trên sidebar trái. */
export type SettingsSectionId =
  | "profile"
  | "appearance"
  | "study"
  | "pronounce"
  | "reminder"
  | "achievements"
  | "data";

interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  icon: LucideIcon;
  /** Mô tả ngắn hiện ở đầu vùng nội dung bên phải. */
  desc: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "profile", label: "Hồ sơ", icon: User, desc: "Tên hiển thị, ảnh đại diện, giới thiệu." },
  {
    id: "appearance",
    label: "Giao diện",
    icon: Palette,
    desc: "Chế độ sáng/tối, màu chủ đề và các mục hiện trên thanh bên.",
  },
  {
    id: "study",
    label: "Học tập",
    icon: Target,
    desc: "Mục tiêu hằng ngày, chuỗi ngày học, mở khoá deck và chế độ tập trung.",
  },
  { id: "pronounce", label: "Phát âm", icon: Volume2, desc: "Giọng đọc và tốc độ phát âm." },
  { id: "reminder", label: "Nhắc nhở", icon: Bell, desc: "Lời nhắc học mỗi ngày." },
  { id: "achievements", label: "Huy hiệu", icon: Award, desc: "Các huy hiệu đã mở khoá." },
  { id: "data", label: "Dữ liệu", icon: Database, desc: "Đặt lại dữ liệu học của ứng dụng." },
];

interface SettingsPanelProps {
  /** Nhóm mở sẵn khi vừa mở bảng cài đặt. */
  initialSection?: SettingsSectionId;
  /** Gọi khi người dùng bấm một liên kết rời khỏi bảng (để đóng popup). */
  onNavigate?: () => void;
  className?: string;
}

/**
 * Bảng cài đặt hai cột: sidebar chọn nhóm bên trái, nội dung nhóm bên phải.
 * Dùng chung cho popup (`SettingsDialog`) và trang `/settings`.
 */
export function SettingsPanel({
  initialSection = "profile",
  onNavigate,
  className,
}: SettingsPanelProps) {
  const [section, setSection] = useState<SettingsSectionId>(initialSection);
  const { data: progress, isLoading } = useProgress();

  const current = SETTINGS_SECTIONS.find((s) => s.id === section) ?? SETTINGS_SECTIONS[0];

  return (
    <div className={cn("flex min-h-0 flex-col md:flex-row", className)}>
      {/* SIDEBAR: dọc trên desktop, thanh cuộn ngang trên mobile */}
      <nav
        aria-label="Nhóm cài đặt"
        className="flex shrink-0 gap-1 overflow-x-auto border-b p-2 md:w-52 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:p-3"
      >
        {SETTINGS_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors md:w-full",
              section === s.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <s.icon className="h-[18px] w-[18px] shrink-0" />
            {s.label}
          </button>
        ))}
      </nav>

      {/* NỘI DUNG nhóm đang chọn */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <header className="mb-4">
          <h2 className="text-xl font-bold">{current.label}</h2>
          <p className="text-sm text-muted-foreground">{current.desc}</p>
        </header>

        {isLoading || !progress ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {section === "profile" ? <ProfileSection progress={progress} /> : null}

            {section === "appearance" ? (
              <>
                <AppearanceSection />
                <SidebarSection />
              </>
            ) : null}

            {section === "study" ? (
              <>
                <DailyGoalSection progress={progress} />
                <StreakSection progress={progress} />
                <UnlockDecksSection progress={progress} />
                <FocusSection onNavigate={onNavigate} />
              </>
            ) : null}

            {section === "pronounce" ? <PronounceSection /> : null}
            {section === "reminder" ? <ReminderSection /> : null}
            {section === "achievements" ? <AchievementsSection /> : null}
            {section === "data" ? <ResetSection /> : null}
          </div>
        )}
      </div>
    </div>
  );
}
