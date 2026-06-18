/**
 * Các "màu chủ đề" (palette) áp dụng cho TOÀN APP. Mỗi theme override một số CSS
 * variable của design system (foreground, primary, card, border...) nên mọi
 * component dùng token Tailwind (text-foreground, bg-card, stroke-primary...) sẽ
 * tự đổi màu theo. Trang Focus dùng thêm `background` (gradient) cho đẹp.
 */
export interface FocusTheme {
  id: string;
  name: string;
  /** Gradient cho trang Focus + ô swatch. */
  background: string;
  /** Màu nền đặc dùng cho toàn app (`--background`). null = theo theme app. */
  surface: string | null;
  /** Nền tối hay sáng (quyết định chữ + class `.dark`). */
  isDark: boolean;
  /** Biến CSS override; rỗng nghĩa là không override (theo theme app). */
  vars: Record<string, string>;
}

/** Bộ biến cho nền sáng (chữ tối). */
function lightVars(accent: string): Record<string, string> {
  return {
    "--foreground": "#1b1b2b",
    "--card": "rgba(255,255,255,0.85)",
    "--card-foreground": "#1b1b2b",
    "--popover": "#ffffff",
    "--popover-foreground": "#1b1b2b",
    "--primary": accent,
    "--primary-foreground": "#ffffff",
    "--secondary": "rgba(255,255,255,0.7)",
    "--secondary-foreground": "#1b1b2b",
    "--muted": "rgba(255,255,255,0.5)",
    "--muted-foreground": "rgba(27,27,43,0.62)",
    "--accent": "rgba(255,255,255,0.75)",
    "--accent-foreground": "#1b1b2b",
    "--border": "rgba(0,0,0,0.12)",
    "--input": "rgba(0,0,0,0.18)",
    "--ring": accent,
  };
}

/** Bộ biến cho nền tối (chữ sáng). */
function darkVars(accent: string, foreground = "#f4f1ec"): Record<string, string> {
  return {
    "--foreground": foreground,
    "--card": "rgba(255,255,255,0.07)",
    "--card-foreground": foreground,
    "--popover": "#161a30",
    "--popover-foreground": foreground,
    "--primary": accent,
    "--primary-foreground": "#ffffff",
    "--secondary": "rgba(255,255,255,0.1)",
    "--secondary-foreground": foreground,
    "--muted": "rgba(255,255,255,0.08)",
    "--muted-foreground": "rgba(255,255,255,0.62)",
    "--accent": "rgba(255,255,255,0.14)",
    "--accent-foreground": foreground,
    "--border": "rgba(255,255,255,0.16)",
    "--input": "rgba(255,255,255,0.22)",
    "--ring": accent,
  };
}

export const DEFAULT_PALETTE_ID = "default";

export const FOCUS_THEMES: FocusTheme[] = [
  {
    id: "default",
    name: "Mặc định",
    background: "linear-gradient(135deg, #f6f7fb 0%, #f6f7fb 50%, #00021f 50%, #00021f 100%)",
    surface: null,
    isDark: false,
    vars: {},
  },
  {
    id: "mint",
    name: "Bạc hà",
    background: "linear-gradient(135deg, #dcf5c8 0%, #8ed07f 100%)",
    surface: "#eef7e6",
    isDark: false,
    vars: lightVars("#3f9d4f"),
  },
  {
    id: "lavender",
    name: "Oải hương",
    background: "linear-gradient(135deg, #c9bbf7 0%, #e2b4ed 100%)",
    surface: "#f2edfb",
    isDark: false,
    vars: lightVars("#8b5cf6"),
  },
  {
    id: "sky",
    name: "Bầu trời",
    background: "linear-gradient(135deg, #c0e7f8 0%, #88cdee 100%)",
    surface: "#e9f4fb",
    isDark: false,
    vars: lightVars("#2f9fd6"),
  },
  {
    id: "coral",
    name: "San hô",
    background: "linear-gradient(135deg, #f4937f 0%, #f8cda6 100%)",
    surface: "#fbeee7",
    isDark: false,
    vars: lightVars("#e2573b"),
  },
  {
    id: "amber",
    name: "Hổ phách",
    background: "linear-gradient(135deg, #ef9a4a 0%, #c5611c 100%)",
    surface: "#241a0c",
    isDark: true,
    vars: darkVars("#f59e0b"),
  },
  {
    id: "blush",
    name: "Phấn hồng",
    background: "linear-gradient(135deg, #f3b2b2 0%, #f8d6c8 100%)",
    surface: "#fbeef1",
    isDark: false,
    vars: lightVars("#e0728c"),
  },
  {
    id: "midnight",
    name: "Nửa đêm",
    background: "linear-gradient(135deg, #161a30 0%, #2c2f4a 100%)",
    surface: "#0e1124",
    isDark: true,
    vars: darkVars("#4d7cff", "#eaf0ff"),
  },
];

/** Tất cả biến CSS có thể bị palette override — dùng để xoá khi chuyển theme. */
export const PALETTE_VAR_KEYS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
] as const;

export function getFocusTheme(id: string): FocusTheme {
  return (
    FOCUS_THEMES.find((t) => t.id === id) ??
    FOCUS_THEMES.find((t) => t.id === DEFAULT_PALETTE_ID) ??
    FOCUS_THEMES[0]
  );
}
