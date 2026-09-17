"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  SettingsPanel,
  type SettingsSectionId,
} from "@/components/settings/settings-panel";

interface SettingsDialogContextValue {
  /** Mở popup cài đặt, tuỳ chọn nhảy thẳng tới một nhóm. */
  openSettings: (section?: SettingsSectionId) => void;
  closeSettings: () => void;
}

const SettingsDialogContext = createContext<SettingsDialogContextValue | null>(null);

/**
 * Hook mở popup cài đặt từ bất kỳ đâu trong layout dashboard.
 * Trả về `null` nếu dùng ngoài provider (vd trang /focus) — nơi gọi tự xử lý.
 */
export function useSettingsDialog(): SettingsDialogContextValue | null {
  return useContext(SettingsDialogContext);
}

interface SettingsDialogProviderProps {
  children: React.ReactNode;
}

/** Giữ state popup cài đặt và render nó một lần cho cả layout. */
export function SettingsDialogProvider({ children }: SettingsDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SettingsSectionId>("profile");

  const openSettings = useCallback((next?: SettingsSectionId) => {
    setSection(next ?? "profile");
    setOpen(true);
  }, []);
  const closeSettings = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openSettings, closeSettings }),
    [openSettings, closeSettings],
  );

  return (
    <SettingsDialogContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen} className="max-w-4xl">
        <DialogContent
          className="flex h-[85vh] max-h-[85vh] flex-col overflow-hidden p-0"
          onClose={closeSettings}
          role="dialog"
          aria-label="Cài đặt"
        >
          <div className="shrink-0 border-b px-5 py-4">
            <h1 className="text-lg font-bold">Cài đặt</h1>
            <p className="text-sm text-muted-foreground">
              Tuỳ chỉnh mục tiêu học và các thông số cá nhân.
            </p>
          </div>
          {/* Panel tự unmount khi đóng nên mỗi lần mở lại đúng nhóm được yêu cầu. */}
          <SettingsPanel
            initialSection={section}
            onNavigate={closeSettings}
            className="flex-1"
          />
        </DialogContent>
      </Dialog>
    </SettingsDialogContext.Provider>
  );
}
