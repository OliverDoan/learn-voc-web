import { describe, expect, it } from "vitest";
import { isChineseAnswerCorrect } from "@/lib/chinese-answer";

const card = (word: string, phonetic: string | null) => ({ word, phonetic });

describe("isChineseAnswerCorrect", () => {
  it("gõ đúng Hán tự → đúng (bỏ qua khoảng trắng thừa)", () => {
    expect(isChineseAnswerCorrect(card("你好", "nǐ hǎo"), " 你好 ")).toBe(true);
  });

  it("gõ sai Hán tự → sai", () => {
    expect(isChineseAnswerCorrect(card("你好", "nǐ hǎo"), "你")).toBe(false);
  });

  it("ô trống → sai", () => {
    expect(isChineseAnswerCorrect(card("你好", "nǐ hǎo"), "   ")).toBe(false);
  });

  it("pinyin không dấu, không khoảng trắng, không phân biệt hoa thường → đúng", () => {
    expect(isChineseAnswerCorrect(card("你好", "nǐ hǎo"), "NiHao")).toBe(true);
    expect(isChineseAnswerCorrect(card("你好", "nǐ hǎo"), "nǐ hǎo")).toBe(true);
  });

  it("pinyin kèm số thanh vẫn được chấm đúng", () => {
    expect(isChineseAnswerCorrect(card("你好", "nǐ hǎo"), "ni3 hao3")).toBe(true);
  });

  it("pinyin sai âm → sai", () => {
    expect(isChineseAnswerCorrect(card("你好", "nǐ hǎo"), "nihau")).toBe(false);
  });

  it("ü gõ bằng u hoặc v đều được", () => {
    const nu = card("女", "nǚ");
    expect(isChineseAnswerCorrect(nu, "nu")).toBe(true);
    expect(isChineseAnswerCorrect(nu, "nv")).toBe(true);
  });

  it("bỏ qua dấu nháy ngăn âm tiết", () => {
    expect(isChineseAnswerCorrect(card("星期二", "xīngqī'èr"), "xingqier")).toBe(true);
  });

  it("phần trong ngoặc là tuỳ chọn — gõ có hay không đều đúng", () => {
    const meiyou = card("没(有)", "méi(yǒu)");
    expect(isChineseAnswerCorrect(meiyou, "没有")).toBe(true);
    expect(isChineseAnswerCorrect(meiyou, "没")).toBe(true);
    expect(isChineseAnswerCorrect(meiyou, "meiyou")).toBe(true);
    expect(isChineseAnswerCorrect(meiyou, "mei")).toBe(true);
    expect(isChineseAnswerCorrect(meiyou, "you")).toBe(false);
  });

  it("nhiều cách đọc ngăn bởi / — cách nào cũng đúng", () => {
    const shei = card("谁", "shéi/shuí");
    expect(isChineseAnswerCorrect(shei, "shei")).toBe(true);
    expect(isChineseAnswerCorrect(shei, "shui")).toBe(true);
  });

  it("bỏ qua dấu … trong mẫu câu", () => {
    const tai = card("太…了", "tài…le");
    expect(isChineseAnswerCorrect(tai, "太了")).toBe(true);
    expect(isChineseAnswerCorrect(tai, "太…了")).toBe(true);
    expect(isChineseAnswerCorrect(tai, "taile")).toBe(true);
  });

  it("thẻ chưa có pinyin thì chỉ chấm theo Hán tự", () => {
    expect(isChineseAnswerCorrect(card("你", null), "ni")).toBe(false);
    expect(isChineseAnswerCorrect(card("你", null), "你")).toBe(true);
  });
});
