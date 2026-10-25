import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStoryPanelHidden } from "./use-story-panel-hidden";

describe("useStoryPanelHidden", () => {
  afterEach(() => localStorage.clear());

  it("mặc định hiện truyện chêm", () => {
    const { result } = renderHook(() => useStoryPanelHidden());
    expect(result.current.hidden).toBe(false);
  });

  it("bấm ẩn thì ẩn và vẫn ẩn khi mở lại trang", () => {
    const { result } = renderHook(() => useStoryPanelHidden());
    act(() => result.current.toggle());
    expect(result.current.hidden).toBe(true);

    const reopened = renderHook(() => useStoryPanelHidden());
    expect(reopened.result.current.hidden).toBe(true);
  });

  it("bấm lần nữa thì hiện lại, và mở lại trang vẫn hiện", () => {
    const { result } = renderHook(() => useStoryPanelHidden());
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.hidden).toBe(false);

    const reopened = renderHook(() => useStoryPanelHidden());
    expect(reopened.result.current.hidden).toBe(false);
  });
});
