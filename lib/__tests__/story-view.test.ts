import { describe, expect, it } from "vitest";
import { DEFAULT_STORY_VIEW_MODE, resolveStoryViewMode } from "../story-view";

describe("resolveStoryViewMode", () => {
  it("mặc định là tiếng Anh", () => {
    expect(DEFAULT_STORY_VIEW_MODE).toBe("en");
  });

  it("giữ English khi truyện có bản tiếng Anh", () => {
    expect(resolveStoryViewMode("en", "Once upon a time")).toBe("en");
  });

  it("lùi về Chêm khi truyện chưa có bản tiếng Anh", () => {
    expect(resolveStoryViewMode("en", null)).toBe("cham");
    expect(resolveStoryViewMode("en", "   ")).toBe("cham");
    expect(resolveStoryViewMode("en", undefined)).toBe("cham");
  });

  it("không đụng chế độ Chêm / Tiếng Việt", () => {
    expect(resolveStoryViewMode("cham", null)).toBe("cham");
    expect(resolveStoryViewMode("vi", "text")).toBe("vi");
  });
});
