import { describe, expect, it } from "vitest";
import { sortCardsByStoryOrder, storyWordOrder } from "../story-order";

const CHAM = "Tôi dạy [[science|khoa học]] ở trường [[secondary|trung học]]. Cậu rời [[primary|tiểu học]], lại [[science|khoa học]].";

describe("storyWordOrder", () => {
  it("lấy thứ tự xuất hiện đầu tiên của từ trong bản chêm, bỏ trùng", () => {
    expect(storyWordOrder(CHAM, null, "cham")).toEqual(["science", "secondary", "primary"]);
  });

  it("chế độ Tiếng Việt dùng thứ tự của bản chêm", () => {
    expect(storyWordOrder(CHAM, "Primary first, then science.", "vi")).toEqual([
      "science",
      "secondary",
      "primary",
    ]);
  });

  it("chế độ English theo thứ tự trong bản tiếng Anh, quy về từ gốc", () => {
    const en = "He left primary school. I taught science at a secondary school.";
    expect(storyWordOrder(CHAM, en, "en")).toEqual(["primary", "science", "secondary"]);
  });

  it("từ chỉ có trong bản chêm mà bản tiếng Anh không có thì nối vào cuối", () => {
    expect(storyWordOrder(CHAM, "Only science here.", "en")).toEqual(["science", "secondary", "primary"]);
  });

  it("English mà chưa có bản tiếng Anh thì lùi về bản chêm", () => {
    expect(storyWordOrder(CHAM, "  ", "en")).toEqual(["science", "secondary", "primary"]);
  });
});

describe("sortCardsByStoryOrder", () => {
  const cards = [
    { id: "1", word: "kindergarten" },
    { id: "2", word: "Primary" },
    { id: "3", word: "secondary" },
    { id: "4", word: "art" },
    { id: "5", word: "science " },
  ];

  it("xếp thẻ theo thứ tự trong truyện, không phân biệt hoa thường/khoảng trắng", () => {
    const sorted = sortCardsByStoryOrder(cards, ["science", "secondary", "primary"]);
    expect(sorted.map((c) => c.id)).toEqual(["5", "3", "2", "1", "4"]);
  });

  it("thẻ không có trong truyện giữ thứ tự gốc ở cuối", () => {
    const sorted = sortCardsByStoryOrder(cards, ["art"]);
    expect(sorted.map((c) => c.id)).toEqual(["4", "1", "2", "3", "5"]);
  });

  it("không có thứ tự truyện thì trả nguyên mảng, không đổi mảng gốc", () => {
    expect(sortCardsByStoryOrder(cards, [])).toBe(cards);
    sortCardsByStoryOrder(cards, ["art"]);
    expect(cards[0].id).toBe("1");
  });
});
