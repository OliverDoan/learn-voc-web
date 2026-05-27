import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VocaLearn — Học từ vựng cá nhân",
    short_name: "VocaLearn",
    description: "Ứng dụng học từ vựng cá nhân với Spaced Repetition và truyện chêm.",
    lang: "vi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    categories: ["education", "productivity"],
  };
}
