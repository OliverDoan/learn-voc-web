import { describe, expect, it } from "vitest";
import { sampleExamCards, sortDecksByUnit } from "../exam";

const cards = [
  { id: "a1", deckId: "A" },
  { id: "a2", deckId: "A" },
  { id: "a3", deckId: "A" },
  { id: "b1", deckId: "B" },
  { id: "b2", deckId: "B" },
  { id: "c1", deckId: "C" },
];

describe("sampleExamCards", () => {
  it("chỉ lấy thẻ thuộc các unit đã chọn", () => {
    const picked = sampleExamCards(cards, ["A", "C"], 10);
    expect(picked.map((c) => c.id).sort()).toEqual(["a1", "a2", "a3", "c1"]);
  });

  it("lấy đúng số lượng yêu cầu khi đủ thẻ, không trùng", () => {
    const picked = sampleExamCards(cards, ["A", "B", "C"], 4);
    expect(picked).toHaveLength(4);
    expect(new Set(picked.map((c) => c.id)).size).toBe(4);
  });

  it("count null = lấy tất cả thẻ của các unit đã chọn", () => {
    expect(sampleExamCards(cards, ["A", "B"], null)).toHaveLength(5);
  });

  it("xáo theo hàm random truyền vào (không đổi mảng gốc)", () => {
    const snapshot = [...cards];
    // random luôn 0 → Fisher–Yates đảo phần tử đầu lên cuối mỗi bước
    const picked = sampleExamCards(cards, ["A"], 3, () => 0);
    expect(picked.map((c) => c.id)).toEqual(["a2", "a3", "a1"]);
    expect(cards).toEqual(snapshot);
  });

  it("không chọn unit nào → rỗng", () => {
    expect(sampleExamCards(cards, [], 5)).toEqual([]);
  });
});

describe("sortDecksByUnit", () => {
  it("xếp tăng dần theo số Unit, deck không có số Unit xuống cuối", () => {
    const decks = [
      { name: "Unit 50: Trái Đất" },
      { name: "Daily Life" },
      { name: "Unit 2: Gia đình" },
      { name: "Unit 10: Nhà cửa" },
      { name: "Unit 1: Chào hỏi" },
    ];
    expect(sortDecksByUnit(decks).map((d) => d.name)).toEqual([
      "Unit 1: Chào hỏi",
      "Unit 2: Gia đình",
      "Unit 10: Nhà cửa",
      "Unit 50: Trái Đất",
      "Daily Life",
    ]);
  });

  it("không đổi mảng gốc", () => {
    const decks = [{ name: "Unit 2" }, { name: "Unit 1" }];
    sortDecksByUnit(decks);
    expect(decks[0].name).toBe("Unit 2");
  });
});
