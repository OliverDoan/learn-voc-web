import { describe, expect, it } from "vitest";
import { parseVocabMdOrder, planCardOrder } from "../vocab-md-order";

const MD = `# Từ vựng Unit 1 – 2

## Unit 1: Giấc mơ du học

1. foreigner (noun): người nước ngoài
2. Abroad (adverb): ở nước ngoài
3. drop out: bỏ học

## Unit 2: Đi học

1. term (noun): học kỳ
`;

describe("parseVocabMdOrder", () => {
  it("đọc từ theo từng Unit, giữ thứ tự và chuẩn hoá chữ thường", () => {
    const units = parseVocabMdOrder(MD);
    expect(units.get(1)).toEqual(["foreigner", "abroad", "drop out"]);
    expect(units.get(2)).toEqual(["term"]);
  });

  it("bỏ qua dòng đánh số nằm trước tiêu đề Unit đầu tiên", () => {
    expect(parseVocabMdOrder("1. stray (noun): x\n## Unit 3: A\n1. hill (noun): đồi").get(3)).toEqual(["hill"]);
  });
});

describe("planCardOrder", () => {
  const cards = [
    { id: "a", word: "abroad" },
    { id: "b", word: "Foreigner" },
    { id: "c", word: "idea" },
  ];

  it("xếp thẻ theo thứ tự file, không phân biệt hoa thường", () => {
    const plan = planCardOrder(cards, ["foreigner", "abroad", "idea"]);
    expect(plan.orderedIds).toEqual(["b", "a", "c"]);
    expect(plan.missingCards).toEqual([]);
    expect(plan.missingInFile).toEqual([]);
  });

  it("thẻ không có trong file nằm cuối, giữ thứ tự cũ; báo từ không có thẻ", () => {
    const plan = planCardOrder(cards, ["foreigner", "ghost"]);
    expect(plan.orderedIds).toEqual(["b", "a", "c"]);
    expect(plan.missingCards).toEqual(["ghost"]);
    expect(plan.missingInFile).toEqual(["abroad", "idea"]);
  });

  it("từ lặp trong file chỉ tính lần đầu", () => {
    expect(planCardOrder(cards, ["idea", "idea", "abroad"]).orderedIds).toEqual(["c", "a", "b"]);
  });
});
