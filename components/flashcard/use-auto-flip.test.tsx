import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoFlip } from "./use-auto-flip";

interface Props {
  enabled: boolean;
  cardKey: string | null;
  flipped: boolean;
}

function setup(initial: Props) {
  const onFlip = vi.fn();
  const hook = renderHook((p: Props) => useAutoFlip({ ...p, onFlip, delayMs: 1000 }), {
    initialProps: initial,
  });
  return { onFlip, ...hook };
}

describe("useAutoFlip", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("bật: thẻ mới tự lật sau khoảng chờ", () => {
    const { onFlip } = setup({ enabled: true, cardKey: "0-a", flipped: false });
    vi.advanceTimersByTime(999);
    expect(onFlip).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("tắt: không tự lật", () => {
    const { onFlip } = setup({ enabled: false, cardKey: "0-a", flipped: false });
    vi.advanceTimersByTime(5000);
    expect(onFlip).not.toHaveBeenCalled();
  });

  it("thẻ đang lật sẵn thì không lật nữa", () => {
    const { onFlip } = setup({ enabled: true, cardKey: "0-a", flipped: true });
    vi.advanceTimersByTime(5000);
    expect(onFlip).not.toHaveBeenCalled();
  });

  it("sang thẻ khác trước khi hết giờ thì huỷ hẹn của thẻ cũ, hẹn lại cho thẻ mới", () => {
    const { onFlip, rerender } = setup({ enabled: true, cardKey: "0-a", flipped: false });
    vi.advanceTimersByTime(600);
    rerender({ enabled: true, cardKey: "1-b", flipped: false });
    vi.advanceTimersByTime(600);
    expect(onFlip).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("đã tự lật rồi, người dùng lật ngược lại thì không tự lật lần nữa", () => {
    const { onFlip, rerender } = setup({ enabled: true, cardKey: "0-a", flipped: false });
    vi.advanceTimersByTime(1000);
    rerender({ enabled: true, cardKey: "0-a", flipped: true });
    rerender({ enabled: true, cardKey: "0-a", flipped: false });
    vi.advanceTimersByTime(5000);
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("tắt giữa chừng thì huỷ lượt lật đang chờ", () => {
    const { onFlip, rerender } = setup({ enabled: true, cardKey: "0-a", flipped: false });
    vi.advanceTimersByTime(500);
    rerender({ enabled: false, cardKey: "0-a", flipped: false });
    vi.advanceTimersByTime(5000);
    expect(onFlip).not.toHaveBeenCalled();
  });
});
