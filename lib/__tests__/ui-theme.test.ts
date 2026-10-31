import { describe, expect, it } from "vitest";
import { parseUiTheme, UI_THEMES } from "../ui-theme";

describe("parseUiTheme", () => {
  it("nhận đúng 2 chế độ", () => {
    expect(UI_THEMES).toEqual(["gmail", "classic"]);
    expect(parseUiTheme("classic")).toBe("classic");
    expect(parseUiTheme("gmail")).toBe("gmail");
  });
  it("giá trị lạ hoặc rỗng → gmail (mặc định)", () => {
    expect(parseUiTheme(null)).toBe("gmail");
    expect(parseUiTheme("")).toBe("gmail");
    expect(parseUiTheme("newera")).toBe("gmail");
  });
});
