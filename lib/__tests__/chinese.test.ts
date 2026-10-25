import { describe, expect, it } from "vitest";
import {
  CHINESE_TTS_LANG,
  adjacentChineseDecks,
  buildChineseQuiz,
  chineseLessonNumber,
  isChineseDeck,
  parseDeckLanguage,
  sortChineseDecks,
  strokeSummary,
} from "@/lib/chinese";
import type { Card } from "@/lib/types";

/** Thẻ tiếng Trung tối giản cho test. */
function makeCard(
  partial: Partial<Card> & Pick<Card, "id" | "word" | "meaning">,
): Card {
  return {
    deckId: "deck-zh",
    partOfSpeech: null,
    rootWord: null,
    rootWordMeaning: null,
    phonetic: null,
    example: null,
    examplePinyin: null,
    exampleTranslation: null,
    note: null,
    imageUrl: null,
    audioUrl: null,
    tags: "[]",
    wordForms: null,
    wordFormMeanings: null,
    synonyms: null,
    antonyms: null,
    favorite: false,
    dialect: null,
    variantWord: null,
    hanziFormal: null,
    strokeCount: null,
    radical: null,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: "2026-01-01T00:00:00.000Z",
    state: "NEW",
    lapses: 0,
    deletedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

const NUMBERS: Card[] = [
  makeCard({ id: "c1", word: "一", meaning: "một", phonetic: "yī" }),
  makeCard({ id: "c2", word: "二", meaning: "hai", phonetic: "èr" }),
  makeCard({ id: "c3", word: "三", meaning: "ba", phonetic: "sān" }),
  makeCard({ id: "c4", word: "四", meaning: "bốn", phonetic: "sì" }),
  makeCard({ id: "c5", word: "五", meaning: "năm", phonetic: "wǔ" }),
];

/** rng giả lập: luôn trả 0 → chọn phần tử đầu, kết quả ổn định. */
const zeroRng = () => 0;

describe("parseDeckLanguage", () => {
  it("nhận 'zh' và 'en'", () => {
    expect(parseDeckLanguage("zh")).toBe("zh");
    expect(parseDeckLanguage("en")).toBe("en");
  });

  it("giá trị lạ / rỗng → mặc định 'en'", () => {
    expect(parseDeckLanguage(null)).toBe("en");
    expect(parseDeckLanguage(undefined)).toBe("en");
    expect(parseDeckLanguage("")).toBe("en");
    expect(parseDeckLanguage("jp")).toBe("en");
  });
});

describe("isChineseDeck", () => {
  it("chỉ đúng với deck language = zh", () => {
    expect(isChineseDeck({ language: "zh" })).toBe(true);
    expect(isChineseDeck({ language: "en" })).toBe(false);
  });
});

describe("strokeSummary", () => {
  it("gộp số nét và bộ thủ thành một dòng", () => {
    expect(strokeSummary({ strokeCount: 5, radical: "囗" })).toBe(
      "5 nét · bộ 囗",
    );
  });

  it("thiếu một trong hai thì chỉ hiện phần có", () => {
    expect(strokeSummary({ strokeCount: 2, radical: null })).toBe("2 nét");
    expect(strokeSummary({ strokeCount: null, radical: "一" })).toBe("bộ 一");
  });

  it("không có gì → null", () => {
    expect(strokeSummary({ strokeCount: null, radical: null })).toBeNull();
  });
});

describe("buildChineseQuiz", () => {
  it("tạo đúng một câu hỏi cho mỗi thẻ", () => {
    const quiz = buildChineseQuiz(NUMBERS, { rng: zeroRng });
    expect(quiz).toHaveLength(NUMBERS.length);
    expect(new Set(quiz.map((q) => q.cardId)).size).toBe(NUMBERS.length);
  });

  it("xoay vòng các dạng câu hỏi theo thứ tự đã khai báo", () => {
    const modes = ["hanzi-to-meaning", "meaning-to-hanzi"] as const;
    const quiz = buildChineseQuiz(NUMBERS, { modes, rng: zeroRng });
    expect(quiz.map((q) => q.mode)).toEqual([
      "hanzi-to-meaning",
      "meaning-to-hanzi",
      "hanzi-to-meaning",
      "meaning-to-hanzi",
      "hanzi-to-meaning",
    ]);
  });

  it("đề và đáp án khớp với dạng câu hỏi", () => {
    const [hanziToMeaning] = buildChineseQuiz([NUMBERS[0]], {
      modes: ["hanzi-to-meaning"],
      rng: zeroRng,
      pool: NUMBERS,
    });
    expect(hanziToMeaning.prompt).toBe("一");
    expect(hanziToMeaning.promptPinyin).toBe("yī");
    expect(hanziToMeaning.answer).toBe("một");

    const [meaningToHanzi] = buildChineseQuiz([NUMBERS[0]], {
      modes: ["meaning-to-hanzi"],
      rng: zeroRng,
      pool: NUMBERS,
    });
    expect(meaningToHanzi.prompt).toBe("một");
    expect(meaningToHanzi.promptPinyin).toBeNull();
    expect(meaningToHanzi.answer).toBe("一");

    const [hanziToPinyin] = buildChineseQuiz([NUMBERS[0]], {
      modes: ["hanzi-to-pinyin"],
      rng: zeroRng,
      pool: NUMBERS,
    });
    expect(hanziToPinyin.prompt).toBe("一");
    expect(hanziToPinyin.promptPinyin).toBeNull();
    expect(hanziToPinyin.answer).toBe("yī");
  });

  it("mỗi câu có 4 lựa chọn khác nhau và luôn chứa đáp án", () => {
    const quiz = buildChineseQuiz(NUMBERS, { rng: () => 0.42 });
    for (const q of quiz) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
    }
  });

  it("deck ít thẻ hơn số lựa chọn → dùng hết thẻ có được, không lặp", () => {
    const quiz = buildChineseQuiz(NUMBERS.slice(0, 2), { rng: zeroRng });
    for (const q of quiz) {
      expect(q.options).toHaveLength(2);
      expect(new Set(q.options).size).toBe(2);
      expect(q.options).toContain(q.answer);
    }
  });

  it("bỏ qua thẻ thiếu dữ liệu cho dạng câu hỏi (vd không có pinyin)", () => {
    const noPinyin = makeCard({
      id: "c9",
      word: "六",
      meaning: "sáu",
      phonetic: null,
    });
    const quiz = buildChineseQuiz([noPinyin], {
      modes: ["hanzi-to-pinyin"],
      rng: zeroRng,
    });
    expect(quiz).toHaveLength(0);
  });

  it("thẻ trùng nghĩa không tạo lựa chọn trùng nhau", () => {
    const cards = [
      makeCard({ id: "a", word: "二", meaning: "hai", phonetic: "èr" }),
      makeCard({ id: "b", word: "两", meaning: "hai", phonetic: "liǎng" }),
      makeCard({ id: "c", word: "三", meaning: "ba", phonetic: "sān" }),
    ];
    const quiz = buildChineseQuiz(cards, {
      modes: ["hanzi-to-meaning"],
      rng: zeroRng,
    });
    for (const q of quiz) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("hai thẻ cùng nghĩa → câu hỏi nghĩa→Hán chỉ có MỘT đáp án đúng", () => {
    // 二 và 两 cùng nghĩa "hai": nếu để cả hai vào lựa chọn thì người học
    // chọn chữ kia cũng đúng nhưng bị chấm sai.
    const cards = [
      makeCard({ id: "a", word: "二", meaning: "hai", phonetic: "èr" }),
      makeCard({ id: "b", word: "两", meaning: "hai", phonetic: "liǎng" }),
      makeCard({ id: "c", word: "三", meaning: "ba", phonetic: "sān" }),
      makeCard({ id: "d", word: "四", meaning: "bốn", phonetic: "sì" }),
    ];
    const quiz = buildChineseQuiz(cards, {
      modes: ["meaning-to-hanzi"],
      rng: zeroRng,
    });
    const question = quiz.find((q) => q.prompt === "hai");
    expect(question).toBeDefined();
    expect(question!.options).not.toContain("两");
  });

  it("danh sách rỗng → không có câu hỏi", () => {
    expect(buildChineseQuiz([], { rng: zeroRng })).toEqual([]);
  });
});

describe("CHINESE_TTS_LANG", () => {
  it("dùng giọng tiếng Trung phổ thông", () => {
    expect(CHINESE_TTS_LANG).toBe("zh-CN");
  });
});

describe("chineseLessonNumber", () => {
  it("lấy số bài từ tên deck", () => {
    expect(chineseLessonNumber("Bài 1: 你好 (Xin chào)")).toBe(1);
    expect(chineseLessonNumber("Bài 12: 你在哪儿学习汉语")).toBe(12);
  });

  it("tên không theo mẫu Bài N → null", () => {
    expect(chineseLessonNumber("Từ tự thêm")).toBeNull();
  });
});

describe("sortChineseDecks", () => {
  it("xếp theo số bài tăng dần, deck không có số bài đứng cuối giữ thứ tự cũ", () => {
    const decks = [
      { name: "Bài 10: 他住哪儿" },
      { name: "Tự thêm A" },
      { name: "Bài 2: 汉语不太难" },
      { name: "Tự thêm B" },
      { name: "Bài 1: 你好" },
    ];
    expect(sortChineseDecks(decks).map((d) => d.name)).toEqual([
      "Bài 1: 你好",
      "Bài 2: 汉语不太难",
      "Bài 10: 他住哪儿",
      "Tự thêm A",
      "Tự thêm B",
    ]);
    expect(decks[0].name).toBe("Bài 10: 他住哪儿");
  });
});

describe("adjacentChineseDecks", () => {
  const decks = [
    { id: "b3", name: "Bài 3: 明天见" },
    { id: "b1", name: "Bài 1: 你好" },
    { id: "b2", name: "Bài 2: 汉语不太难" },
  ];

  it("lấy deck trước/sau theo số bài, không theo thứ tự API", () => {
    const { prev, next } = adjacentChineseDecks(decks, "b2");
    expect(prev?.id).toBe("b1");
    expect(next?.id).toBe("b3");
  });

  it("quay vòng ở đầu và cuối danh sách", () => {
    expect(adjacentChineseDecks(decks, "b1").prev?.id).toBe("b3");
    expect(adjacentChineseDecks(decks, "b3").next?.id).toBe("b1");
  });

  it("chỉ có 1 deck hoặc không tìm thấy deck hiện tại → không có nút chuyển", () => {
    expect(adjacentChineseDecks([decks[0]], "b3")).toEqual({ prev: null, next: null });
    expect(adjacentChineseDecks(decks, "khac")).toEqual({ prev: null, next: null });
  });
});
