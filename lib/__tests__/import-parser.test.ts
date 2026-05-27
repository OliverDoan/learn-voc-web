import { describe, expect, it } from "vitest";
import { parseCsvImport, parseJsonImport } from "../import-parser";

describe("parseCsvImport", () => {
  it("parse CSV chuẩn với header đầy đủ", () => {
    const csv = `word,meaning,partOfSpeech,phonetic,example,exampleTranslation,note,tags
apple,quả táo,noun,/ˈæp.əl/,I eat an apple.,Tôi ăn quả táo.,Trái cây,fruit;food`;
    const result = parseCsvImport(csv);
    expect(result.errors).toEqual([]);
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]).toMatchObject({
      word: "apple",
      meaning: "quả táo",
      partOfSpeech: "noun",
      phonetic: "/ˈæp.əl/",
      example: "I eat an apple.",
      exampleTranslation: "Tôi ăn quả táo.",
      note: "Trái cây",
      tags: ["fruit", "food"],
    });
  });

  it("hỗ trợ tags ngăn cách bằng dấu ; hoặc ,", () => {
    const csv = `word,meaning,tags
apple,quả táo,fruit;food;basic
run,chạy,"action,sport"`;
    const result = parseCsvImport(csv);
    expect(result.cards[0].tags).toEqual(["fruit", "food", "basic"]);
    expect(result.cards[1].tags).toEqual(["action", "sport"]);
  });

  it("chỉ cần word + meaning là parse được, các trường khác optional", () => {
    const csv = `word,meaning
run,chạy
go,đi`;
    const result = parseCsvImport(csv);
    expect(result.errors).toEqual([]);
    expect(result.cards).toHaveLength(2);
    expect(result.cards[0]).toMatchObject({ word: "run", meaning: "chạy", tags: [] });
  });

  it("xử lý quoted field chứa dấu phẩy", () => {
    const csv = `word,meaning,example
hello,"chào, xin chào","Hi, how are you?"`;
    const result = parseCsvImport(csv);
    expect(result.cards[0].meaning).toBe("chào, xin chào");
    expect(result.cards[0].example).toBe("Hi, how are you?");
  });

  it("escape dấu nháy kép bằng \"\" trong CSV", () => {
    const csv = `word,meaning,note
quote,trích dẫn,"He said ""hello"" to me"`;
    const result = parseCsvImport(csv);
    expect(result.cards[0].note).toBe('He said "hello" to me');
  });

  it("báo lỗi nếu thiếu word hoặc meaning", () => {
    const csv = `word,meaning
,quả táo
run,
ok,được`;
    const result = parseCsvImport(csv);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].word).toBe("ok");
  });

  it("báo lỗi nếu thiếu header bắt buộc", () => {
    const csv = `name,definition
apple,quả táo`;
    const result = parseCsvImport(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toMatch(/word|meaning/i);
    expect(result.cards).toEqual([]);
  });

  it("báo lỗi nếu file rỗng", () => {
    expect(parseCsvImport("").errors.length).toBeGreaterThan(0);
    expect(parseCsvImport("   \n  ").errors.length).toBeGreaterThan(0);
  });

  it("bỏ qua dòng rỗng giữa file", () => {
    const csv = `word,meaning
apple,quả táo

run,chạy
`;
    const result = parseCsvImport(csv);
    expect(result.cards).toHaveLength(2);
  });

  it("trim whitespace ở mọi field", () => {
    const csv = `word,meaning
  apple  ,  quả táo  `;
    const result = parseCsvImport(csv);
    expect(result.cards[0].word).toBe("apple");
    expect(result.cards[0].meaning).toBe("quả táo");
  });

  it("hỗ trợ CRLF line ending", () => {
    const csv = "word,meaning\r\napple,quả táo\r\nrun,chạy\r\n";
    const result = parseCsvImport(csv);
    expect(result.cards).toHaveLength(2);
  });
});

describe("parseJsonImport", () => {
  it("parse JSON với format { cards: [...] }", () => {
    const json = JSON.stringify({
      cards: [
        { word: "apple", meaning: "quả táo", tags: ["fruit"] },
        { word: "run", meaning: "chạy" },
      ],
    });
    const result = parseJsonImport(json);
    expect(result.errors).toEqual([]);
    expect(result.cards).toHaveLength(2);
    expect(result.cards[0].tags).toEqual(["fruit"]);
    expect(result.cards[1].tags).toEqual([]);
  });

  it("parse JSON là array trực tiếp", () => {
    const json = JSON.stringify([
      { word: "apple", meaning: "quả táo" },
      { word: "run", meaning: "chạy" },
    ]);
    const result = parseJsonImport(json);
    expect(result.errors).toEqual([]);
    expect(result.cards).toHaveLength(2);
  });

  it("báo lỗi khi JSON sai cú pháp", () => {
    const result = parseJsonImport("{not valid json");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.cards).toEqual([]);
  });

  it("báo lỗi nếu card thiếu word hoặc meaning", () => {
    const json = JSON.stringify({
      cards: [
        { word: "apple", meaning: "quả táo" },
        { word: "", meaning: "trống" },
        { word: "no-meaning" },
      ],
    });
    const result = parseJsonImport(json);
    expect(result.cards).toHaveLength(1);
    expect(result.errors.length).toBe(2);
  });

  it("convert tags là string sang array", () => {
    const json = JSON.stringify({
      cards: [{ word: "apple", meaning: "quả táo", tags: "fruit;food" }],
    });
    const result = parseJsonImport(json);
    expect(result.cards[0].tags).toEqual(["fruit", "food"]);
  });

  it("báo lỗi nếu root không phải array hoặc object có cards", () => {
    const result = parseJsonImport(JSON.stringify({ foo: "bar" }));
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("trim whitespace ở các field string", () => {
    const json = JSON.stringify({
      cards: [{ word: "  apple  ", meaning: "  quả táo  ", note: "  ghi chú  " }],
    });
    const result = parseJsonImport(json);
    expect(result.cards[0].word).toBe("apple");
    expect(result.cards[0].meaning).toBe("quả táo");
    expect(result.cards[0].note).toBe("ghi chú");
  });
});
