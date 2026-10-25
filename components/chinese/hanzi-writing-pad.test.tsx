import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { HanziWritingPad } from "./hanzi-writing-pad";

interface FakeQuizOptions {
  onCorrectStroke: (d: { strokeNum: number; strokesRemaining: number }) => void;
  onComplete: (s: { character: string; totalMistakes: number }) => void;
}
interface FakeCreateOptions {
  onLoadCharDataSuccess: () => void;
  onLoadCharDataError: () => void;
}

const writer = {
  quizOptions: null as FakeQuizOptions | null,
  createOptions: null as FakeCreateOptions | null,
  quiz: vi.fn(),
  cancelQuiz: vi.fn(),
  showOutline: vi.fn(),
  hideOutline: vi.fn(),
};

vi.mock("hanzi-writer", () => ({
  default: {
    create: (_el: unknown, _char: string, options: FakeCreateOptions) => {
      writer.createOptions = options;
      writer.quiz.mockImplementation((opts: FakeQuizOptions) => {
        writer.quizOptions = opts;
        return Promise.resolve();
      });
      return writer;
    },
  },
}));

describe("HanziWritingPad", () => {
  beforeEach(() => {
    writer.quizOptions = null;
    writer.createOptions = null;
    vi.clearAllMocks();
  });

  it("viết xong báo đủ số nét của chữ và số lần sai", async () => {
    const onComplete = vi.fn();
    render(
      <HanziWritingPad char="你" showOutline onComplete={onComplete} onLoadError={vi.fn()} />,
    );
    await waitFor(() => expect(writer.quizOptions).not.toBeNull());

    // Chữ 7 nét: nhận nét cuối (strokeNum 6, còn 0) rồi hoàn thành với 2 lần sai.
    writer.quizOptions?.onCorrectStroke({ strokeNum: 6, strokesRemaining: 0 });
    writer.quizOptions?.onComplete({ character: "你", totalMistakes: 2 });

    expect(onComplete).toHaveBeenCalledWith({ strokes: 7, mistakes: 2 });
  });

  it("bật/tắt nét mờ áp ngay lên chữ đang viết, không tạo lại khung", async () => {
    const { rerender } = render(
      <HanziWritingPad char="好" showOutline onComplete={vi.fn()} onLoadError={vi.fn()} />,
    );
    await waitFor(() => expect(writer.quiz).toHaveBeenCalled());
    const quizCalls = writer.quiz.mock.calls.length;

    rerender(
      <HanziWritingPad char="好" showOutline={false} onComplete={vi.fn()} onLoadError={vi.fn()} />,
    );
    expect(writer.hideOutline).toHaveBeenCalled();
    expect(writer.quiz.mock.calls.length).toBe(quizCalls);
  });

  it("không tải được dữ liệu nét thì báo lỗi lên trên", async () => {
    const onLoadError = vi.fn();
    render(
      <HanziWritingPad char="马" showOutline onComplete={vi.fn()} onLoadError={onLoadError} />,
    );
    await waitFor(() => expect(writer.createOptions).not.toBeNull());
    writer.createOptions?.onLoadCharDataError();
    expect(onLoadError).toHaveBeenCalled();
  });
});
