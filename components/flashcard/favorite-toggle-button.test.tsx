import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FavoriteToggleButton } from "./favorite-toggle-button";

const mutateAsync = vi.fn();
vi.mock("@/hooks/use-cards", () => ({
  useToggleFavorite: () => ({ mutateAsync, isPending: false }),
}));
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (m: string) => toastSuccess(m), error: (m: string) => toastError(m) },
}));

describe("FavoriteToggleButton", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it("thẻ chưa yêu thích: bấm thì thêm vào yêu thích", async () => {
    mutateAsync.mockResolvedValue({});
    render(<FavoriteToggleButton cardId="c1" favorite={false} />);
    const btn = screen.getByRole("button", { name: "Thêm vào yêu thích" });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(btn);
    expect(mutateAsync).toHaveBeenCalledWith({ cardId: "c1", favorite: true });
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Đã thêm vào yêu thích"));
  });

  it("thẻ đã yêu thích: bấm thì bỏ yêu thích", async () => {
    mutateAsync.mockResolvedValue({});
    render(<FavoriteToggleButton cardId="c1" favorite />);
    const btn = screen.getByRole("button", { name: "Bỏ yêu thích" });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(btn);
    expect(mutateAsync).toHaveBeenCalledWith({ cardId: "c1", favorite: false });
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Đã bỏ yêu thích"));
  });

  it("lỗi API thì báo toast lỗi", async () => {
    mutateAsync.mockRejectedValue(new Error("Mất mạng"));
    render(<FavoriteToggleButton cardId="c1" favorite={false} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Mất mạng"));
  });

  it("bấm không lan ra ngoài (không lật thẻ)", () => {
    mutateAsync.mockResolvedValue({});
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <FavoriteToggleButton cardId="c1" favorite={false} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
