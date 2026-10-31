/** Chế độ hiển thị truyện: chêm / full tiếng Việt / full tiếng Anh. */
export type StoryViewMode = "cham" | "vi" | "en";

/** Ưu tiên đọc bản full tiếng Anh. */
export const DEFAULT_STORY_VIEW_MODE: StoryViewMode = "en";

/**
 * Chế độ thực sự dùng cho một truyện: chọn English mà truyện chưa có bản
 * tiếng Anh thì lùi về Chêm để không hiện khung trống.
 */
export function resolveStoryViewMode(
  mode: StoryViewMode,
  contentEn: string | null | undefined,
): StoryViewMode {
  return mode === "en" && !contentEn?.trim() ? "cham" : mode;
}
