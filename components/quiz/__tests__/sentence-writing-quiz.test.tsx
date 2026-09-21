import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SentenceWritingQuiz } from "../sentence-writing-quiz";
import type { Card } from "@/lib/types";

const card = {
  id: "c1",
  word: "mood",
  meaning: "tâm trạng",
  example: "A cup of coffee always improves my mood.",
  exampleTranslation: "Một tách cà phê luôn cải thiện tâm trạng của tôi.",
} as Card;

/** Gõ câu trả lời rồi bấm "Kiểm tra". */
function answer(text: string) {
  fireEvent.change(screen.getByPlaceholderText(/Gõ câu tiếng Anh/), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
}

describe("SentenceWritingQuiz", () => {
  it("hiện kết quả đúng kèm câu đáp án sau khi nộp", () => {
    render(<SentenceWritingQuiz question={card} onAnswer={vi.fn()} onNext={vi.fn()} />);
    answer("A cup of coffee always improves my mood.");

    expect(screen.getByText(/Chính xác/)).toBeTruthy();
    // Ô nhập cũng chứa đúng câu này nên chỉ kiểm tra khối "Câu đúng" có xuất hiện.
    expect(screen.getByText("Câu đúng")).toBeTruthy();
  });

  it("hiện kết quả sai kèm câu đáp án để đối chiếu", () => {
    render(<SentenceWritingQuiz question={card} onAnswer={vi.fn()} onNext={vi.fn()} />);
    answer("I like tea.");

    expect(screen.getByText(/Chưa đúng/)).toBeTruthy();
    expect(screen.getByText(card.example!)).toBeTruthy();
  });

  it("KHÔNG tự chuyển câu: chỉ gọi onNext khi người dùng bấm nút", () => {
    const onNext = vi.fn();
    render(<SentenceWritingQuiz question={card} onAnswer={vi.fn()} onNext={onNext} />);
    answer("I like tea.");

    expect(onNext).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Câu tiếp theo/ }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("chưa nộp thì không có nút chuyển câu", () => {
    render(<SentenceWritingQuiz question={card} onAnswer={vi.fn()} onNext={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Câu tiếp theo/ })).toBeNull();
  });

  it("nhả rồi nhấn Enter sau khi đã nộp thì sang câu tiếp theo", () => {
    const onNext = vi.fn();
    render(<SentenceWritingQuiz question={card} onAnswer={vi.fn()} onNext={onNext} />);
    answer("I like tea.");

    // Nhả phím Enter vừa dùng để nộp, rồi mới nhấn lần mới.
    fireEvent.keyUp(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("giữ Enter lúc nộp thì KHÔNG nhảy luôn câu sau", () => {
    const onNext = vi.fn();
    render(<SentenceWritingQuiz question={card} onAnswer={vi.fn()} onNext={onNext} />);
    answer("I like tea.");

    // Phím Enter vẫn đang được giữ → bàn phím tự lặp keydown.
    fireEvent.keyDown(window, { key: "Enter", repeat: true });
    fireEvent.keyDown(window, { key: "Enter", repeat: true });
    expect(onNext).not.toHaveBeenCalled();
  });

  it("không có onNext (chế độ cũ) thì không hiện nút chuyển câu", () => {
    render(<SentenceWritingQuiz question={card} onAnswer={vi.fn()} />);
    answer("I like tea.");

    expect(screen.queryByRole("button", { name: /Câu tiếp theo/ })).toBeNull();
  });

  it("báo kết quả đúng/sai cho component cha đúng một lần", () => {
    const onAnswer = vi.fn();
    render(<SentenceWritingQuiz question={card} onAnswer={onAnswer} onNext={vi.fn()} />);
    answer("I like tea.");

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(false, "I like tea.");
  });
});
