import { describe, expect, it } from "vitest";
import { isChineseSentenceCorrect } from "@/lib/chinese-answer";

const s = (hanzi: string, pinyin: string) => ({ hanzi, pinyin });

describe("isChineseSentenceCorrect", () => {
  const busy = s("你忙吗？", "Nǐ máng ma?");

  it("gõ đúng Hán tự, bỏ qua dấu câu và khoảng trắng", () => {
    expect(isChineseSentenceCorrect(busy, "你忙吗")).toBe(true);
    expect(isChineseSentenceCorrect(busy, " 你 忙 吗 ? ")).toBe(true);
    expect(isChineseSentenceCorrect(busy, "你忙吗？")).toBe(true);
  });

  it("thiếu hay sai chữ → sai", () => {
    expect(isChineseSentenceCorrect(busy, "你忙")).toBe(false);
    expect(isChineseSentenceCorrect(busy, "你好吗")).toBe(false);
  });

  it("ô trống → sai", () => {
    expect(isChineseSentenceCorrect(busy, "  ")).toBe(false);
  });

  it("gõ pinyin không dấu, không dấu câu → đúng", () => {
    expect(isChineseSentenceCorrect(busy, "ni mang ma")).toBe(true);
    expect(isChineseSentenceCorrect(busy, "Nǐ máng ma?")).toBe(true);
  });

  it("pinyin sai âm → sai", () => {
    expect(isChineseSentenceCorrect(busy, "ni man ma")).toBe(false);
  });

  it("câu nhiều vế, dấu câu toàn khổ và dấu … đều bỏ qua", () => {
    const wait = s(
      "请等一会儿。……先生，给您钱。",
      "Qǐng děng yíhuìr. …… Xiānsheng, gěi nín qián.",
    );
    expect(isChineseSentenceCorrect(wait, "请等一会儿先生给您钱")).toBe(true);
    expect(isChineseSentenceCorrect(wait, "qing deng yihuir xiansheng gei nin qian")).toBe(true);
  });

  it("phần trong ngoặc là tuỳ chọn", () => {
    const total = s("一共二十一块三（毛）。", "Yígòng èrshíyī kuài sān (máo).");
    expect(isChineseSentenceCorrect(total, "一共二十一块三")).toBe(true);
    expect(isChineseSentenceCorrect(total, "一共二十一块三毛")).toBe(true);
    expect(isChineseSentenceCorrect(total, "yigong ershiyi kuai san mao")).toBe(true);
    expect(isChineseSentenceCorrect(total, "yigong ershiyi kuai san")).toBe(true);
  });

  it("giữ chữ số khi so Hán tự", () => {
    const phone = s("知道，62931074。", "Zhīdào, liù èr jiǔ sān yāo líng qī sì.");
    expect(isChineseSentenceCorrect(phone, "知道62931074")).toBe(true);
    expect(isChineseSentenceCorrect(phone, "知道62931075")).toBe(false);
  });
});
