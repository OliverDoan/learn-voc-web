import { describe, expect, it } from "vitest";
import { highlightEnglish, wordVariants } from "../story-english";

const words = (tokens: ReturnType<typeof highlightEnglish>) =>
  tokens.filter((t) => t.type === "word").map((t) => (t.type === "word" ? [t.word, t.lemma] : []));

describe("wordVariants", () => {
  it("sinh các dạng biến đổi thường gặp", () => {
    expect(wordVariants("learn")).toEqual(expect.arrayContaining(["learn", "learns", "learned", "learning"]));
    expect(wordVariants("study")).toEqual(expect.arrayContaining(["studies", "studied", "studying"]));
    expect(wordVariants("improve")).toEqual(expect.arrayContaining(["improves", "improved", "improving"]));
    expect(wordVariants("stop")).toEqual(expect.arrayContaining(["stopped", "stopping"]));
    expect(wordVariants("watch")).toEqual(expect.arrayContaining(["watches"]));
  });

  it("từ nhiều chữ chỉ biến đổi chữ đầu", () => {
    expect(wordVariants("drop out")).toEqual(expect.arrayContaining(["drop out", "dropping out", "dropped out"]));
  });
});

describe("highlightEnglish", () => {
  const content = "Tôi [[learn|học]] một [[language|ngôn ngữ]] và [[drop out|bỏ học]].";

  it("đánh dấu từ vựng của truyện, giữ nguyên chữ gốc", () => {
    const tokens = highlightEnglish("He learned a new Language and never dropped out.", content);
    expect(words(tokens)).toEqual([
      ["learned", "learn"],
      ["Language", "language"],
      ["dropped out", "drop out"],
    ]);
    expect(tokens.map((t) => (t.type === "text" ? t.text : t.word)).join("")).toBe(
      "He learned a new Language and never dropped out.",
    );
  });

  it("gắn nghĩa tiếng Việt từ markup chêm", () => {
    const tokens = highlightEnglish("learning", content);
    expect(tokens).toEqual([{ type: "word", word: "learning", meaning: "học", lemma: "learn" }]);
  });

  it("không bắt từ nằm trong từ khác", () => {
    expect(words(highlightEnglish("She is relearning multilanguage apps.", content))).toEqual([]);
  });

  it("từ gốc của thẻ khác thắng dạng suy ra", () => {
    const c = "[[win|thắng]] [[winner|người thắng]]";
    expect(words(highlightEnglish("The winner won.", c))).toEqual([
      ["winner", "winner"],
      ["won", "win"],
    ]);
  });

  it("bắt dạng bất quy tắc, so sánh hơn và trạng từ", () => {
    const c = "[[forget|quên]] [[heavy|nặng]] [[proper|đúng cách]] [[loved one|người thân]]";
    expect(words(highlightEnglish("I forgot the heavier bag, properly, for my loved ones.", c))).toEqual([
      ["forgot", "forget"],
      ["heavier", "heavy"],
      ["properly", "proper"],
      ["loved ones", "loved one"],
    ]);
  });

  it("ưu tiên cụm dài hơn khi chồng nhau", () => {
    const c = "[[drop|rơi]] [[drop out|bỏ học]]";
    expect(words(highlightEnglish("I drop out.", c))).toEqual([["drop out", "drop out"]]);
  });

  it("không có từ vựng → trả nguyên văn bản", () => {
    expect(highlightEnglish("Hello world", "không có từ")).toEqual([{ type: "text", text: "Hello world" }]);
  });
});
