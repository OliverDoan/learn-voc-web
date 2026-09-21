import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrevWrongPanel } from "../prev-wrong-panel";

const cards = [
  { id: "c1", word: "mad", meaning: "tức giận; điên rồ" },
  { id: "c2", word: "neat", meaning: "gọn gàng" },
  { id: "c3", word: "hero", meaning: "anh hùng" },
];

describe("PrevWrongPanel", () => {
  it("không hiện gì khi lượt trước không sai từ nào", () => {
    const { container } = render(<PrevWrongPanel wrongIds={[]} cards={cards} />);
    expect(container.innerHTML).toBe("");
  });

  it("bỏ qua id không tra được thẻ (thẻ đã xoá)", () => {
    render(<PrevWrongPanel wrongIds={["c1", "đã-xoá"]} cards={cards} />);
    expect(screen.getByText("Lần trước bạn sai 1 từ")).toBeTruthy();
  });

  it("danh sách đóng mặc định, mở ra khi bấm", () => {
    render(<PrevWrongPanel wrongIds={["c1", "c3"]} cards={cards} />);
    const toggle = screen.getByRole("button", { name: /Lần trước bạn sai 2 từ/ });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("mad")).toBeNull();

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("mad")).toBeTruthy();
    expect(screen.getByText("tức giận; điên rồ")).toBeTruthy();
    expect(screen.getByText("hero")).toBeTruthy();
    expect(screen.queryByText("neat")).toBeNull();
  });

  it("đánh dấu thẻ đang được hỏi", () => {
    render(<PrevWrongPanel wrongIds={["c1", "c3"]} cards={cards} currentCardId="c3" />);
    fireEvent.click(screen.getByRole("button", { name: /Lần trước bạn sai/ }));

    expect(screen.getAllByText("đang hỏi")).toHaveLength(1);
  });
});
