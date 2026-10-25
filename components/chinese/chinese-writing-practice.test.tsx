import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChineseWritingPractice } from "./chinese-writing-practice";
import type { Card } from "@/lib/types";

// Khung vẽ thật cần SVG + tải nét từ CDN → thay bằng nút giả lập viết đúng / sai / lỗi tải.
vi.mock("@/components/chinese/hanzi-writing-pad", () => ({
  HanziWritingPad: ({
    char,
    onComplete,
    onLoadError,
  }: {
    char: string;
    onComplete: (r: { strokes: number; mistakes: number }) => void;
    onLoadError: () => void;
  }) => (
    <div>
      <span>đang viết {char}</span>
      <button onClick={() => onComplete({ strokes: 5, mistakes: 0 })}>viết đúng</button>
      <button onClick={() => onComplete({ strokes: 5, mistakes: 2 })}>viết sai</button>
      <button onClick={onLoadError}>lỗi tải</button>
    </div>
  ),
}));
vi.mock("@/lib/tts", () => ({ speak: vi.fn(), isSpeakable: () => true }));

const makeCard = (id: string, word: string, phonetic: string, meaning: string) =>
  ({ id, word, phonetic, meaning }) as Card;

const cards = [makeCard("c1", "你好", "nǐ hǎo", "xin chào"), makeCard("c2", "大", "dà", "to, lớn")];

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

describe("ChineseWritingPractice", () => {
  afterEach(() => localStorage.clear());

  it("viết lần lượt từng chữ của từ, xong từ mới cho sang từ tiếp", () => {
    render(<ChineseWritingPractice cards={cards} historyKey="d1-writing" />);
    expect(screen.getByText("xin chào")).toBeTruthy();
    expect(screen.getByText("đang viết 你")).toBeTruthy();

    click("viết đúng");
    expect(screen.getByText("đang viết 好")).toBeTruthy();
    click("viết đúng");

    expect(screen.queryByText(/đang viết/)).toBeNull();
    click(/Từ tiếp theo/);
    expect(screen.getByText("đang viết 大")).toBeTruthy();
  });

  it("hết lượt: chấm điểm, liệt kê từ viết sai và cho luyện lại riêng từ sai", () => {
    render(<ChineseWritingPractice cards={cards} historyKey="d1-writing" />);
    click("viết đúng");
    click("viết đúng");
    click(/Từ tiếp theo/);
    click("viết sai");
    click(/Xem kết quả/);

    const score = Number(screen.getByText("Điểm luyện viết").nextElementSibling?.textContent);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
    expect(screen.getAllByText("sai 2 nét").length).toBeGreaterThan(0);

    click(/Luyện lại 1 từ sai/);
    expect(screen.getByText("đang viết 大")).toBeTruthy();
  });

  it("không tải được nét chữ thì cho bỏ qua chữ đó", () => {
    render(<ChineseWritingPractice cards={cards} historyKey="d1-writing" />);
    click("lỗi tải");
    expect(screen.getByText(/Không tải được dữ liệu nét/)).toBeTruthy();
    click(/Bỏ qua chữ này/);
    expect(screen.getByText("đang viết 好")).toBeTruthy();
  });

  it("viết sai thì lưu lịch sử, vào lại vẫn thấy", () => {
    const { unmount } = render(
      <ChineseWritingPractice cards={[cards[1]]} historyKey="d1-writing" />,
    );
    click("viết sai");
    click(/Xem kết quả/);
    unmount();

    render(<ChineseWritingPractice cards={[cards[1]]} historyKey="d1-writing" />);
    click("viết đúng");
    click(/Xem kết quả/);
    // Lịch sử của lượt trước (sai 2 nét) vẫn còn dù lượt này đúng hết.
    expect(screen.getAllByText("sai 2 nét").length).toBeGreaterThan(0);
  });
});
