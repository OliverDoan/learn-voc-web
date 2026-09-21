import { describe, expect, it } from "vitest";
import type { DeckWithCounts } from "@/lib/types";
import { groupDecksByTopic, topicName, topicTitle, topicUnitRange } from "../deck-topics";

/** Deck tối giản đủ để gom nhóm — chỉ cần `name`. */
const deck = (name: string) => ({ name }) as DeckWithCounts;

describe("topicUnitRange", () => {
  it("gom 5 unit liên tiếp cho mỗi topic", () => {
    expect(topicUnitRange(0)).toEqual({ from: 1, to: 5 });
    expect(topicUnitRange(6)).toEqual({ from: 31, to: 35 });
    expect(topicUnitRange(7)).toEqual({ from: 36, to: 40 });
  });
});

describe("topicName / topicTitle", () => {
  it("trả tên chủ đề đã đặt", () => {
    expect(topicName(0)).toBe("Học tập & Sự nghiệp");
    expect(topicName(6)).toBe("Society");
    expect(topicName(7)).toBe("Relationship");
  });

  it("ghép tiêu đề kèm khoảng Unit", () => {
    expect(topicTitle(6)).toBe("Topic 7 · Unit 31–35: Society");
    expect(topicTitle(7)).toBe("Topic 8 · Unit 36–40: Relationship");
  });

  it("bỏ phần tên khi topic chưa được đặt tên", () => {
    expect(topicName(8)).toBeNull();
    expect(topicTitle(8)).toBe("Topic 9 · Unit 41–45");
  });
});

describe("groupDecksByTopic", () => {
  it("gom deck theo topic và sắp theo số Unit", () => {
    const groups = groupDecksByTopic([
      deck("Unit 40: Giải trí và đi chơi"),
      deck("Unit 31: Âm nhạc và biểu diễn"),
      deck("Unit 36: Tính cách và cách nhìn người"),
    ]);

    expect(groups.map((g) => g.title)).toEqual([
      "Topic 7 · Unit 31–35: Society",
      "Topic 8 · Unit 36–40: Relationship",
    ]);
    expect(groups[1].decks.map((d) => d.name)).toEqual([
      "Unit 36: Tính cách và cách nhìn người",
      "Unit 40: Giải trí và đi chơi",
    ]);
  });

  it("đưa deck không có số Unit vào nhóm Khác ở cuối", () => {
    const groups = groupDecksByTopic([deck("Từ vựng lẻ"), deck("Unit 36: Tính cách")]);
    expect(groups.at(-1)).toMatchObject({ key: "topic-other", index: null, title: "Khác" });
  });
});
