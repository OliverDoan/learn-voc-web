import { describe, expect, it } from "vitest";
import { withFavorite } from "../favorite-cache";

describe("withFavorite", () => {
  const list = [
    { id: "a", favorite: false, word: "apple" },
    { id: "b", favorite: true, word: "bear" },
  ];

  it("đổi cờ yêu thích của đúng thẻ, trả mảng mới", () => {
    const next = withFavorite(list, "a", true) as typeof list;
    expect(next).not.toBe(list);
    expect(next[0]).toEqual({ id: "a", favorite: true, word: "apple" });
    expect(next[1]).toBe(list[1]);
    expect(list[0].favorite).toBe(false);
  });

  it("không có thẻ đó thì giữ nguyên tham chiếu", () => {
    expect(withFavorite(list, "zzz", true)).toBe(list);
  });

  it("dữ liệu cache không phải mảng thẻ thì bỏ qua", () => {
    expect(withFavorite(undefined, "a", true)).toBeUndefined();
    const obj = { total: 3 };
    expect(withFavorite(obj, "a", true)).toBe(obj);
  });
});
