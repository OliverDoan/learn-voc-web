import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReadingTest } from "./reading-test";
import type { ReadingItem } from "@/lib/chinese-readings";

const speak = vi.fn();
vi.mock("@/lib/tts", () => ({ speak: (...args: unknown[]) => speak(...args) }));

const items: ReadingItem[] = [
  { id: "2-0-0", speaker: "A", hanzi: "你忙吗？", pinyin: "Nǐ máng ma?", vi: "Bạn có bận không?" },
  { id: "2-0-1", speaker: "B", hanzi: "很忙。", pinyin: "Hěn máng.", vi: "Rất bận." },
  {
    id: "10-0-7",
    speaker: "老师",
    hanzi: "知道，62931074。",
    pinyin: "Zhīdào, liù èr jiǔ sān yāo líng qī sì.",
    vi: "Biết, 62931074.",
    tts: "知道，六二九三幺零七四。",
  },
];

describe("ReadingTest", () => {
  afterEach(() => {
    localStorage.clear();
    speak.mockReset();
  });

  it("nghe chép: không lộ đáp án trước khi chấm, bấm Nghe thì đọc câu (ưu tiên bản tts)", () => {
    render(<ReadingTest items={items} mode="dictation" historyKey="d1-dictation" />);
    expect(screen.queryByText(items[0].vi)).toBeNull();
    expect(screen.queryByText(items[0].hanzi)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Nghe câu 3" }));
    expect(speak).toHaveBeenCalledWith(items[2].tts, expect.any(String), expect.any(Number));
  });

  it("Việt → Trung: hiện nghĩa Việt, chấm Hán tự lẫn pinyin, câu sai hiện đáp án", () => {
    render(<ReadingTest items={items} mode="translate" historyKey="d1-translate" />);
    expect(screen.getByText(items[0].vi)).toBeTruthy();

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "你忙吗" } });
    fireEvent.change(inputs[1], { target: { value: "hen mang" } });
    fireEvent.change(inputs[2], { target: { value: "知道" } });
    fireEvent.click(screen.getByRole("button", { name: /Chấm điểm/ }));

    expect(screen.getByText(`Đúng 2/${items.length}`)).toBeTruthy();
    expect(screen.getByText(items[2].pinyin)).toBeTruthy();
  });

  it("có câu sai thì lưu lịch sử, mở lại vẫn thấy đáp án đã gõ", () => {
    const wrongAnswer = "dap-an-sai-xyz";
    const { unmount } = render(
      <ReadingTest items={items} mode="translate" historyKey="d1-translate" />,
    );
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: wrongAnswer } });
    fireEvent.click(screen.getByRole("button", { name: /Chấm điểm/ }));
    unmount();

    render(<ReadingTest items={items} mode="translate" historyKey="d1-translate" />);
    expect(screen.getAllByText(wrongAnswer).length).toBeGreaterThan(0);
  });
});
