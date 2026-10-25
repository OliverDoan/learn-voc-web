import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChineseCardsTest } from "./chinese-cards-test";
import type { Card } from "@/lib/types";

const makeCard = (id: string, word: string, phonetic: string, meaning: string) =>
  ({ id, word, phonetic, meaning }) as Card;

const cards = [
  makeCard("c1", "你好", "nǐ hǎo", "xin chào"),
  makeCard("c2", "好", "hǎo", "tốt"),
  makeCard("c3", "大", "dà", "to, lớn"),
];

describe("ChineseCardsTest", () => {
  afterEach(() => localStorage.clear());

  it("chấm Hán tự và pinyin, hiện điểm và đáp án đúng cho câu sai", () => {
    render(<ChineseCardsTest cards={cards} deckId="d1" />);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "你好" } });
    fireEvent.change(inputs[1], { target: { value: "hao" } });
    fireEvent.change(inputs[2], { target: { value: "xiao" } });

    fireEvent.click(screen.getByRole("button", { name: /Chấm điểm/ }));

    expect(screen.getByText(`Đúng 2/${cards.length}`)).toBeTruthy();
    // Câu sai hiện đáp án đúng (pinyin của thẻ).
    expect(screen.getByText(cards[2].phonetic as string)).toBeTruthy();
  });

  it("chưa nhập gì thì không cho chấm", () => {
    render(<ChineseCardsTest cards={cards} deckId="d1" />);
    const grade = screen.getByRole("button", { name: /Chấm điểm/ }) as HTMLButtonElement;
    expect(grade.disabled).toBe(true);
  });

  it("làm lại thì xoá đáp án và mở lại ô nhập", () => {
    render(<ChineseCardsTest cards={cards} deckId="d1" />);
    const first = screen.getAllByRole("textbox")[0] as HTMLInputElement;
    fireEvent.change(first, { target: { value: "你好" } });
    fireEvent.click(screen.getByRole("button", { name: /Chấm điểm/ }));
    expect(first.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Làm lại/ }));
    const reset = screen.getAllByRole("textbox")[0] as HTMLInputElement;
    expect(reset.value).toBe("");
    expect(reset.disabled).toBe(false);
  });
});
