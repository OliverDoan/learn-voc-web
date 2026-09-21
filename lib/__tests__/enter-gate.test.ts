import { describe, expect, it, vi } from "vitest";
import { createEnterGate } from "../enter-gate";

/** Sự kiện phím giả lập, đủ dùng cho cổng Enter (không cần DOM). */
function keyEvent(key: string, repeat = false) {
  return { key, repeat, preventDefault: vi.fn() };
}

describe("createEnterGate — chặn Enter nộp bài nhảy luôn câu sau", () => {
  it("giữ Enter sau khi nộp: phím tự lặp KHÔNG chuyển câu", () => {
    const onTrigger = vi.fn();
    const gate = createEnterGate(onTrigger);

    // Người học nhấn Enter để nộp rồi giữ nguyên ngón tay → keydown lặp lại.
    gate.handleKeyDown(keyEvent("Enter", true));
    gate.handleKeyDown(keyEvent("Enter", true));

    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("Enter nhấn mới khi chưa từng nhả phím cũng không chuyển câu", () => {
    const onTrigger = vi.fn();
    const gate = createEnterGate(onTrigger);

    gate.handleKeyDown(keyEvent("Enter"));

    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("nhả Enter rồi nhấn lại: chuyển câu đúng một lần", () => {
    const onTrigger = vi.fn();
    const gate = createEnterGate(onTrigger);

    gate.handleKeyUp(keyEvent("Enter"));
    const event = keyEvent("Enter");
    gate.handleKeyDown(event);

    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("giữ Enter sau khi đã chuyển câu: không chuyển tiếp câu nữa", () => {
    const onTrigger = vi.fn();
    const gate = createEnterGate(onTrigger);

    gate.handleKeyUp(keyEvent("Enter"));
    gate.handleKeyDown(keyEvent("Enter"));
    gate.handleKeyDown(keyEvent("Enter", true));
    gate.handleKeyDown(keyEvent("Enter"));

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it("nhả rồi nhấn lại lần nữa thì lại chuyển được", () => {
    const onTrigger = vi.fn();
    const gate = createEnterGate(onTrigger);

    gate.handleKeyUp(keyEvent("Enter"));
    gate.handleKeyDown(keyEvent("Enter"));
    gate.handleKeyUp(keyEvent("Enter"));
    gate.handleKeyDown(keyEvent("Enter"));

    expect(onTrigger).toHaveBeenCalledTimes(2);
  });

  it("phím khác không mở khoá và không chuyển câu", () => {
    const onTrigger = vi.fn();
    const gate = createEnterGate(onTrigger);

    gate.handleKeyUp(keyEvent("a"));
    const event = keyEvent("a");
    gate.handleKeyDown(event);

    expect(onTrigger).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
