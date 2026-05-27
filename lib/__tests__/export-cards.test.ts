import { describe, expect, it } from "vitest";
import { safeFilename, toCsv, toJson, type ExportableCard } from "../export-cards";

function makeCard(overrides: Partial<ExportableCard> = {}): ExportableCard {
  return {
    word: "apple",
    meaning: "quả táo",
    partOfSpeech: "noun",
    phonetic: "/ˈæp.əl/",
    example: "I eat an apple.",
    exampleTranslation: "Tôi ăn quả táo.",
    note: null,
    tags: JSON.stringify(["fruit"]),
    ...overrides,
  };
}

describe("toCsv", () => {
  it("trả về header chính xác khi không có cards", () => {
    const csv = toCsv([]);
    expect(csv).toBe(
      "word,meaning,partOfSpeech,phonetic,example,exampleTranslation,note,tags",
    );
  });

  it("xuất 1 card đầy đủ field", () => {
    const csv = toCsv([makeCard()]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe(
      "apple,quả táo,noun,/ˈæp.əl/,I eat an apple.,Tôi ăn quả táo.,,fruit",
    );
  });

  it("escape dấu phẩy và dấu nháy kép", () => {
    const csv = toCsv([
      makeCard({
        word: "hello,world",
        meaning: 'She said "hi"',
        example: "line1\nline2",
      }),
    ]);
    expect(csv).toContain('"hello,world"');
    expect(csv).toContain('"She said ""hi"""');
    expect(csv).toContain('"line1\nline2"');
  });

  it("nối nhiều tags bằng dấu chấm phẩy", () => {
    const csv = toCsv([
      makeCard({ tags: JSON.stringify(["fruit", "food", "basic"]) }),
    ]);
    expect(csv).toContain("fruit;food;basic");
  });

  it("xử lý card tag rỗng và field null", () => {
    const csv = toCsv([
      makeCard({
        word: "run",
        meaning: "chạy",
        partOfSpeech: null,
        phonetic: null,
        example: null,
        exampleTranslation: null,
        note: null,
        tags: "[]",
      }),
    ]);
    expect(csv.split("\n")[1]).toBe("run,chạy,,,,,,");
  });
});

describe("toJson", () => {
  it("bọc deck + cards và parse tags về array", () => {
    const json = toJson(
      { name: "Test", description: "desc", color: "#abc123", icon: "📘" },
      [makeCard({ tags: JSON.stringify(["a", "b"]) })],
    );
    expect(json.deck.name).toBe("Test");
    expect(json.cards).toHaveLength(1);
    expect(json.cards[0].tags).toEqual(["a", "b"]);
    expect(json.cards[0].word).toBe("apple");
  });

  it("tags là array rỗng khi card không có tag", () => {
    const json = toJson(
      { name: "T", description: null, color: "#000000", icon: null },
      [makeCard({ tags: "[]" })],
    );
    expect(json.cards[0].tags).toEqual([]);
  });
});

describe("safeFilename", () => {
  it("chuyển tiếng Việt có dấu thành ASCII", () => {
    expect(safeFilename("Từ vựng IELTS")).toBe("tu-vung-ielts");
  });

  it("thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang", () => {
    expect(safeFilename("Hello / World!")).toBe("hello-world");
  });

  it("trả 'deck' khi rỗng hoặc toàn ký tự bị strip", () => {
    expect(safeFilename("")).toBe("deck");
    expect(safeFilename("///")).toBe("deck");
  });

  it("ép về chữ thường", () => {
    expect(safeFilename("HELLO")).toBe("hello");
  });
});
