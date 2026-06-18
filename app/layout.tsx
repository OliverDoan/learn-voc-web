import type { Metadata, Viewport } from "next";
import {
  Be_Vietnam_Pro,
  DM_Sans,
  Lora,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { PALETTE_STORAGE_KEY } from "@/components/theme-provider";
import { FOCUS_THEMES, PALETTE_VAR_KEYS } from "@/lib/focus-themes";

// NewEra Inc. Design System fonts
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  style: ["normal", "italic"],
  subsets: ["latin", "vietnamese"],
});

const fontVars = `${beVietnam.variable} ${poppins.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${lora.variable}`;

export const metadata: Metadata = {
  title: "VocaLearn - Học từ vựng cá nhân",
  description: "Ứng dụng học từ vựng cá nhân với Spaced Repetition và truyện chêm.",
  applicationName: "VocaLearn",
  appleWebApp: {
    capable: true,
    title: "VocaLearn",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#173dc9" },
    { media: "(prefers-color-scheme: dark)", color: "#00021f" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// Map id → { surface, isDark, vars } để áp palette ngay trước khi paint
const PALETTE_MAP = Object.fromEntries(
  FOCUS_THEMES.map((t) => [t.id, { surface: t.surface, isDark: t.isDark, vars: t.vars }]),
);

const themeBootstrap = `
(function(){
  try {
    var root = document.documentElement;
    var palettes = ${JSON.stringify(PALETTE_MAP)};
    var keys = ${JSON.stringify(PALETTE_VAR_KEYS)};
    for (var i = 0; i < keys.length; i++) root.style.removeProperty(keys[i]);

    var storedTheme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "light";

    var storedPal = localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)});
    var p = storedPal && palettes[storedPal] ? palettes[storedPal] : null;

    var resolved;
    if (p && p.surface) {
      for (var k in p.vars) root.style.setProperty(k, p.vars[k]);
      root.style.setProperty("--background", p.surface);
      resolved = p.isDark ? "dark" : "light";
    } else {
      resolved = theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme;
    }
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.style.colorScheme = "light";
  }
})();
`.trim();

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="vi"
      className={`${fontVars} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
