/**
 * Kiểu giao diện toàn app: "gmail" (khung giống Gmail, mặc định) hoặc
 * "classic" (giao diện NewEra cũ: sidebar cũ, màu xanh NewEra).
 * Lưu localStorage; script bootstrap trong app/layout.tsx đặt `data-ui` lên <html>
 * trước khi paint để CSS chọn đúng bảng màu, không nháy.
 */
export const UI_THEMES = ["gmail", "classic"] as const;

export type UiTheme = (typeof UI_THEMES)[number];

export const UI_THEME_STORAGE_KEY = "voc-ui-theme";

export const DEFAULT_UI_THEME: UiTheme = "gmail";

export const UI_THEME_LABELS: Record<UiTheme, { label: string; desc: string }> = {
  gmail: { label: "Gmail", desc: "Hộp thư từ vựng, sidebar thư mục & nhãn" },
  classic: { label: "Cổ điển", desc: "Giao diện cũ: sidebar VocaLearn, màu xanh NewEra" },
};

export function parseUiTheme(raw: string | null | undefined): UiTheme {
  return (UI_THEMES as readonly string[]).includes(raw ?? "") ? (raw as UiTheme) : DEFAULT_UI_THEME;
}
