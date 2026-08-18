"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseReminderTime, type ReminderSettings } from "@/lib/reminder";
import {
  refreshNotificationPermission,
  setReminderSettings,
  useNotificationPermission,
  useReminderSettings,
} from "@/hooks/use-reminder";

const PRESET_TIMES = ["08:00", "12:00", "20:00", "21:30"] as const;

/** Bật/tắt nhắc học hằng ngày qua thông báo trình duyệt. */
export function ReminderSection() {
  const stored = useReminderSettings();
  const permission = useNotificationPermission();
  const [requesting, setRequesting] = useState(false);
  // Giờ đang gõ dở (có thể chưa hợp lệ) — chỉ ghi xuống store khi hợp lệ.
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const settings: ReminderSettings = {
    ...stored,
    time: draftTime ?? stored.time,
  };

  const persist = (next: ReminderSettings) => {
    setDraftTime(null);
    setReminderSettings(next);
  };

  const handleToggle = async () => {
    if (settings.enabled) {
      persist({ ...settings, enabled: false });
      toast.success("Đã tắt nhắc học");
      return;
    }

    if (permission === "unsupported") {
      toast.error("Trình duyệt này không hỗ trợ thông báo");
      return;
    }

    if (permission !== "granted") {
      setRequesting(true);
      try {
        const result = await Notification.requestPermission();
        refreshNotificationPermission();
        if (result !== "granted") {
          toast.error("Bạn cần cho phép thông báo để bật nhắc học");
          return;
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Không xin được quyền thông báo",
        );
        return;
      } finally {
        setRequesting(false);
      }
    }

    persist({ ...settings, enabled: true });
    toast.success(`Sẽ nhắc bạn lúc ${settings.time} mỗi ngày 🔔`);
  };

  const handleTimeChange = (time: string) => {
    if (!parseReminderTime(time)) {
      setDraftTime(time);
      return;
    }
    persist({ ...settings, time });
  };

  const timeIsValid = parseReminderTime(settings.time) !== null;

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        {settings.enabled ? (
          <Bell className="h-5 w-5 text-primary" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
        <h2 className="text-lg font-semibold">Nhắc học hằng ngày</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Thông báo nhắc ôn từ nếu tới giờ mà hôm nay bạn chưa học. Chỉ hoạt động khi
        trình duyệt còn mở (không cần tab này ở trên cùng).
      </p>

      <div className="space-y-3">
        <div>
          <Label htmlFor="reminderTime" className="mb-1.5 block text-sm">
            Giờ nhắc
          </Label>
          <Input
            id="reminderTime"
            type="time"
            value={settings.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="max-w-[160px]"
          />
          {!timeIsValid ? (
            <p className="mt-1.5 text-xs text-destructive">Giờ không hợp lệ</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTimeChange(t)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                settings.time === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {permission === "denied" ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            Trình duyệt đang chặn thông báo cho trang này. Mở cài đặt trang web của
            trình duyệt để cho phép lại.
          </p>
        ) : null}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {settings.enabled ? (
              <>
                Đang bật —{" "}
                <span className="font-semibold text-foreground">{settings.time}</span>{" "}
                mỗi ngày
              </>
            ) : (
              "Đang tắt"
            )}
          </p>
          <Button
            onClick={handleToggle}
            disabled={requesting || !timeIsValid}
            variant={settings.enabled ? "outline" : "default"}
          >
            {requesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : settings.enabled ? (
              <BellOff className="mr-2 h-4 w-4" />
            ) : (
              <Bell className="mr-2 h-4 w-4" />
            )}
            {settings.enabled ? "Tắt nhắc" : "Bật nhắc"}
          </Button>
        </div>
      </div>
    </section>
  );
}
