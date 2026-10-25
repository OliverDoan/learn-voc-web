import { describe, expect, it } from "vitest";
import { planExclusiveSync } from "../story-sync";

describe("planExclusiveSync", () => {
  const existing = [
    { id: "a", title: "Giấc mơ du học" },
    { id: "b", title: "Nhật ký tuần đầu" },
    { id: "c", title: "Chuyến đi Seoul" },
  ];

  it("giữ truyện trùng tiêu đề để cập nhật, xoá truyện không có trong file", () => {
    const plan = planExclusiveSync(existing, ["Giấc mơ du học"]);
    expect(plan.updateIdByTitle.get("giấc mơ du học")).toBe("a");
    expect(plan.deleteIds).toEqual(["b", "c"]);
  });

  it("so tiêu đề không phân biệt hoa/thường và khoảng trắng hai đầu", () => {
    const plan = planExclusiveSync(existing, ["  GIẤC MƠ DU HỌC "]);
    expect(plan.updateIdByTitle.get("giấc mơ du học")).toBe("a");
    expect(plan.deleteIds).toEqual(["b", "c"]);
  });

  it("tiêu đề mới hoàn toàn thì xoá hết truyện cũ, không cập nhật gì", () => {
    const plan = planExclusiveSync(existing, ["Truyện mới"]);
    expect(plan.updateIdByTitle.size).toBe(0);
    expect(plan.deleteIds).toEqual(["a", "b", "c"]);
  });

  it("deck chưa có truyện thì không xoá gì", () => {
    const plan = planExclusiveSync([], ["Truyện mới"]);
    expect(plan.deleteIds).toEqual([]);
  });
});
