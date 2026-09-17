import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoryFullscreenReader } from "./story-fullscreen-reader";
import type { StoryListItem } from "@/lib/types";

function story(id: string, title: string, content: string): StoryListItem {
  return {
    id,
    title,
    content,
    contentEn: null,
    imageUrl: null,
    readCount: 0,
    lastReadAt: null,
    deckId: "d1",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    _count: { storyCards: 2 },
    deck: { id: "d1", name: "Unit 1: Giấc mơ du học" },
  } as unknown as StoryListItem;
}

const STORIES = [
  story("s1", "Truyện thứ nhất", "Tôi thích [[apple|quả táo]] mỗi sáng."),
  story("s2", "Truyện thứ hai", "Cô ấy [[study|học]] rất chăm."),
];

function renderReader(props: Partial<React.ComponentProps<typeof StoryFullscreenReader>> = {}) {
  const onClose = vi.fn();
  const onNavigate = vi.fn();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <StoryFullscreenReader
        stories={STORIES}
        index={0}
        onNavigate={onNavigate}
        onClose={onClose}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onClose, onNavigate };
}

describe("StoryFullscreenReader", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.style.overflow = "";
  });

  it("hiện tiêu đề, tên deck và số thứ tự truyện", () => {
    renderReader();
    expect(screen.getByText("Truyện thứ nhất")).toBeTruthy();
    expect(screen.getByText(/Unit 1: Giấc mơ du học/)).toBeTruthy();
    expect(screen.getByText(/Truyện 1\/2/)).toBeTruthy();
  });

  it("nút Sau / Trước chuyển truyện theo vòng", () => {
    const { onNavigate } = renderReader();
    fireEvent.click(screen.getByText("Sau"));
    expect(onNavigate).toHaveBeenCalledWith(1);

    onNavigate.mockClear();
    // Đang ở truyện đầu, bấm Trước → quay vòng về truyện cuối.
    fireEvent.click(screen.getByText("Trước"));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("nút X và phím Esc đều đóng", () => {
    const { onClose } = renderReader();
    fireEvent.click(screen.getByLabelText("Đóng toàn màn hình"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("khoá cuộn nền khi mở và trả lại khi đóng", () => {
    const { unmount } = render(
      <QueryClientProvider client={new QueryClient()}>
        <StoryFullscreenReader stories={STORIES} index={0} onNavigate={vi.fn()} onClose={vi.fn()} />
      </QueryClientProvider>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("tăng/giảm cỡ chữ và ghi nhớ vào localStorage", () => {
    renderReader();
    expect(screen.getByText("17")).toBeTruthy(); // cỡ mặc định

    fireEvent.click(screen.getByLabelText("Tăng cỡ chữ"));
    expect(screen.getByText("19")).toBeTruthy();
    expect(localStorage.getItem("voca-story-reader-font")).toBe("2");

    fireEvent.click(screen.getByLabelText("Giảm cỡ chữ"));
    expect(screen.getByText("17")).toBeTruthy();
    expect(localStorage.getItem("voca-story-reader-font")).toBe("1");
  });

  it("khôi phục cỡ chữ đã lưu lần trước", () => {
    localStorage.setItem("voca-story-reader-font", "4");
    renderReader();
    expect(screen.getByText("25")).toBeTruthy();
  });

  it("ẩn thanh chuyển truyện khi deck chỉ có 1 truyện", () => {
    renderReader({ stories: [STORIES[0]] });
    expect(screen.queryByText("Sau")).toBeNull();
    expect(screen.queryByText(/Truyện 1\/1/)).toBeNull();
  });
});
