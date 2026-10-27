import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SidebarSection } from "./sidebar-section";
import { NAV_ITEMS } from "@/lib/nav-items";
import { resetNavItemsToDefault } from "@/lib/sidebar-prefs";

describe("SidebarSection", () => {
  afterEach(() => {
    cleanup();
    resetNavItemsToDefault();
    localStorage.clear();
  });

  it("hiện thẳng mọi mục thanh bên dạng công tắc, không cần mở dropdown", () => {
    render(<SidebarSection />);
    expect(screen.getAllByRole("switch")).toHaveLength(NAV_ITEMS.length);
  });

  it("bấm công tắc của mục đang ẩn thì hiện mục đó và tăng số đếm", () => {
    resetNavItemsToDefault();
    render(<SidebarSection />);
    const shownBefore = NAV_ITEMS.filter((i) => i.pinned || i.defaultVisible).length;
    expect(screen.getByText(`${shownBefore}/${NAV_ITEMS.length} mục`)).toBeTruthy();

    const search = screen.getByRole("switch", { name: /Tra từ/ });
    expect(search.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(search);

    expect(screen.getByRole("switch", { name: /Tra từ/ }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText(`${shownBefore + 1}/${NAV_ITEMS.length} mục`)).toBeTruthy();
  });

  it("mục Cài đặt luôn hiện, không tắt được", () => {
    render(<SidebarSection />);
    const settings = screen.getByRole("switch", { name: /Cài đặt/ });
    expect(settings.getAttribute("aria-checked")).toBe("true");
    expect((settings as HTMLButtonElement).disabled).toBe(true);
  });
});
