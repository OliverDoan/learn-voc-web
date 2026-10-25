/**
 * Bài đọc (课文) Giáo trình Hán ngữ 1 (bản 3) Quyển thượng, Bài 1–10 — chép từ sách
 * (Hán tự + pinyin); bản dịch tiếng Việt soạn tay. Dữ liệu tĩnh, không dùng DB.
 * Mỗi câu (line) là một đơn vị kiểm tra: nghe chép chính tả và Việt → Trung.
 */

export interface ReadingLine {
  /** Người nói (Hán tự), vd "A", "麦克" */
  speaker: string;
  hanzi: string;
  pinyin: string;
  /** Nghĩa tiếng Việt */
  vi: string;
  /** Văn bản đưa cho giọng đọc khi khác `hanzi` (vd số đọc từng chữ số). */
  tts?: string;
}

export interface ReadingSection {
  /** Tiêu đề đoạn, vd "（一）学汉语" */
  title?: string;
  /** Bối cảnh, vd "在教室 — Trong phòng học" */
  note?: string;
  lines: ReadingLine[];
}

export interface ChineseReading {
  lesson: number;
  title: string;
  sections: ReadingSection[];
}

const line = (speaker: string, hanzi: string, pinyin: string, vi: string, tts?: string): ReadingLine =>
  tts ? { speaker, hanzi, pinyin, vi, tts } : { speaker, hanzi, pinyin, vi };

export const CHINESE_READINGS: readonly ChineseReading[] = [
  {
    lesson: 1,
    title: "你好 — Xin chào",
    sections: [
      {
        lines: [
          line("A", "你好！", "Nǐ hǎo!", "Xin chào!"),
          line("B", "你好！", "Nǐ hǎo!", "Xin chào!"),
        ],
      },
    ],
  },
  {
    lesson: 2,
    title: "汉语不太难 — Tiếng Hán không khó lắm",
    sections: [
      {
        lines: [
          line("A", "你忙吗？", "Nǐ máng ma?", "Bạn có bận không?"),
          line("B", "很忙。", "Hěn máng.", "Rất bận."),
          line("A", "汉语难吗？", "Hànyǔ nán ma?", "Tiếng Hán có khó không?"),
          line("B", "不太难。", "Bú tài nán.", "Không khó lắm."),
        ],
      },
    ],
  },
  {
    lesson: 3,
    title: "明天见 — Ngày mai gặp lại",
    sections: [
      {
        title: "（一）学汉语",
        lines: [
          line("A", "你学英语吗？", "Nǐ xué Yīngyǔ ma?", "Bạn học tiếng Anh à?"),
          line("B", "不，学汉语。", "Bù, xué Hànyǔ.", "Không, tôi học tiếng Hán."),
          line("A", "去北京吗？", "Qù Běijīng ma?", "Bạn đi Bắc Kinh à?"),
          line("B", "对。", "Duì.", "Đúng vậy."),
        ],
      },
      {
        title: "（二）明天见",
        lines: [
          line("A", "你去邮局寄信吗？", "Nǐ qù yóujú jì xìn ma?", "Bạn đi bưu điện gửi thư à?"),
          line("B", "不去。去银行取钱。", "Bú qù. Qù yínháng qǔ qián.", "Không. Tôi đi ngân hàng rút tiền."),
          line("A", "明天见！", "Míngtiān jiàn!", "Ngày mai gặp lại nhé!"),
          line("B", "明天见！", "Míngtiān jiàn!", "Ngày mai gặp lại!"),
        ],
      },
    ],
  },
  {
    lesson: 4,
    title: "你去哪儿 — Bạn đi đâu đấy",
    sections: [
      {
        title: "（一）你去哪儿",
        lines: [
          line("A", "今天星期几？", "Jīntiān xīngqī jǐ?", "Hôm nay thứ mấy?"),
          line("B", "今天星期二。", "Jīntiān xīngqī'èr.", "Hôm nay thứ ba."),
          line("A", "你去哪儿？", "Nǐ qù nǎr?", "Bạn đi đâu đấy?"),
          line(
            "B",
            "我去天安门，你去不去？",
            "Wǒ qù Tiān'ān Mén, nǐ qù bu qù?",
            "Tôi đi Thiên An Môn, bạn có đi không?",
          ),
          line("A", "不去，我回学校。", "Bú qù, wǒ huí xuéxiào.", "Không đi, tôi về trường."),
          line("B", "再见！", "Zàijiàn!", "Tạm biệt!"),
          line("A", "再见！", "Zàijiàn!", "Tạm biệt!"),
        ],
      },
      {
        title: "（二）对不起",
        lines: [
          line("A", "对不起！", "Duìbuqǐ!", "Xin lỗi!"),
          line("B", "没关系！", "Méi guānxi!", "Không sao!"),
        ],
      },
    ],
  },
  {
    lesson: 5,
    title: "这是王老师 — Đây là thầy giáo Vương",
    sections: [
      {
        lines: [
          line(
            "A",
            "这是王老师，这是我爸爸。",
            "Zhè shì Wáng lǎoshī, zhè shì wǒ bàba.",
            "Đây là thầy Vương, đây là bố tôi.",
          ),
          line("B", "王老师，您好！", "Wáng lǎoshī, nín hǎo!", "Chào thầy Vương ạ!"),
          line("C", "您好！请进！请坐！", "Nín hǎo! Qǐng jìn! Qǐng zuò!", "Chào ông! Mời vào! Mời ngồi!"),
          line("C", "请喝茶！", "Qǐng hē chá!", "Mời uống trà!"),
          line("B", "谢谢！", "Xièxie!", "Cảm ơn!"),
          line("C", "不客气！", "Bú kèqi!", "Không có gì!"),
          line("C", "工作忙吗？", "Gōngzuò máng ma?", "Công việc có bận không?"),
          line("B", "不太忙。", "Bú tài máng.", "Không bận lắm."),
          line("C", "身体好吗？", "Shēntǐ hǎo ma?", "Sức khỏe có tốt không?"),
          line("B", "很好！", "Hěn hǎo!", "Rất tốt!"),
        ],
      },
    ],
  },
  {
    lesson: 6,
    title: "我学习汉语 — Tôi học tiếng Hán",
    sections: [
      {
        title: "（一）我学习汉语",
        lines: [
          line("麦克", "请问，你贵姓？", "Qǐngwèn, nǐ guìxìng?", "Xin hỏi, bạn họ gì?"),
          line("张东", "我姓张。", "Wǒ xìng Zhāng.", "Tôi họ Trương."),
          line("麦克", "你叫什么名字？", "Nǐ jiào shénme míngzi?", "Bạn tên là gì?"),
          line("张东", "我叫张东。", "Wǒ jiào Zhāng Dōng.", "Tôi tên là Trương Đông."),
          line("麦克", "你是哪国人？", "Nǐ shì nǎ guó rén?", "Bạn là người nước nào?"),
          line(
            "张东",
            "我是中国人。你是哪国人？",
            "Wǒ shì Zhōngguó rén. Nǐ shì nǎ guó rén?",
            "Tôi là người Trung Quốc. Bạn là người nước nào?",
          ),
          line("麦克", "我是美国人。", "Wǒ shì Měiguó rén.", "Tôi là người Mỹ."),
          line("张东", "认识你很高兴。", "Rènshi nǐ hěn gāoxìng.", "Rất vui được làm quen với bạn."),
          line(
            "麦克",
            "认识你我也很高兴。",
            "Rènshi nǐ wǒ yě hěn gāoxìng.",
            "Tôi cũng rất vui được làm quen với bạn.",
          ),
          line("张东", "你学习什么？", "Nǐ xuéxí shénme?", "Bạn học gì?"),
          line("麦克", "我学习汉语。", "Wǒ xuéxí Hànyǔ.", "Tôi học tiếng Hán."),
          line("张东", "汉语难吗？", "Hànyǔ nán ma?", "Tiếng Hán có khó không?"),
          line(
            "麦克",
            "发音不太难，汉字很难。",
            "Fāyīn bú tài nán, Hànzì hěn nán.",
            "Phát âm không khó lắm, chữ Hán rất khó.",
          ),
        ],
      },
      {
        title: "（二）这是什么书",
        note: "桌子上有两个邮包 — Trên bàn có 2 kiện hàng",
        lines: [
          line("A", "这是什么？", "Zhè shì shénme?", "Đây là cái gì?"),
          line("B", "这是书。", "Zhè shì shū.", "Đây là sách."),
          line("A", "这是什么书？", "Zhè shì shénme shū?", "Đây là sách gì?"),
          line("B", "这是中文书。", "Zhè shì Zhōngwén shū.", "Đây là sách tiếng Trung."),
          line("A", "这是谁的书？", "Zhè shì shéi de shū?", "Đây là sách của ai?"),
          line("B", "这是老师的书。", "Zhè shì lǎoshī de shū.", "Đây là sách của thầy giáo."),
          line("A", "那是什么？", "Nà shì shénme?", "Kia là cái gì?"),
          line("B", "那是杂志。", "Nà shì zázhì.", "Kia là tạp chí."),
          line("A", "那是什么杂志？", "Nà shì shénme zázhì?", "Kia là tạp chí gì?"),
          line("B", "那是英文杂志。", "Nà shì Yīngwén zázhì.", "Kia là tạp chí tiếng Anh."),
          line("A", "那是谁的杂志？", "Nà shì shéi de zázhì?", "Kia là tạp chí của ai?"),
          line("B", "那是我朋友的杂志。", "Nà shì wǒ péngyou de zázhì.", "Kia là tạp chí của bạn tôi."),
        ],
      },
    ],
  },
  {
    lesson: 7,
    title: "你吃什么 — Bạn ăn gì",
    sections: [
      {
        note: "在教室 — Trong phòng học",
        lines: [
          line(
            "麦克",
            "中午你去哪儿吃饭？",
            "Zhōngwǔ nǐ qù nǎr chī fàn?",
            "Buổi trưa bạn đi đâu ăn cơm?",
          ),
          line("玛丽", "我去食堂。", "Wǒ qù shítáng.", "Tôi đi nhà ăn."),
        ],
      },
      {
        note: "在食堂 — Trong nhà ăn",
        lines: [
          line("麦克", "你吃什么？", "Nǐ chī shénme?", "Bạn ăn gì?"),
          line("玛丽", "我吃馒头。", "Wǒ chī mántou.", "Tôi ăn bánh bao chay."),
          line("麦克", "你要几个？", "Nǐ yào jǐ ge?", "Bạn lấy mấy cái?"),
          line(
            "玛丽",
            "一个。你也吃馒头吗？",
            "Yí ge. Nǐ yě chī mántou ma?",
            "Một cái. Bạn cũng ăn bánh bao chay à?",
          ),
          line(
            "麦克",
            "我不吃馒头，我吃米饭。你喝什么？",
            "Wǒ bù chī mántou, wǒ chī mǐfàn. Nǐ hē shénme?",
            "Tôi không ăn bánh bao chay, tôi ăn cơm. Bạn uống gì?",
          ),
          line(
            "玛丽",
            "我要一碗鸡蛋汤。你要吗？",
            "Wǒ yào yì wǎn jīdàntāng. Nǐ yào ma?",
            "Tôi lấy một bát canh trứng. Bạn có lấy không?",
          ),
          line("麦克", "不要，我喝啤酒。", "Bú yào, wǒ hē píjiǔ.", "Không, tôi uống bia."),
          line("玛丽", "这些是什么？", "Zhèxiē shì shénme?", "Những cái này là gì?"),
          line(
            "麦克",
            "这是饺子，这是包子，那是面条儿。",
            "Zhè shì jiǎozi, zhè shì bāozi, nà shì miàntiáor.",
            "Đây là sủi cảo, đây là bánh bao, kia là mì sợi.",
          ),
        ],
      },
    ],
  },
  {
    lesson: 8,
    title: "苹果一斤多少钱 — Nửa cân táo bao nhiêu tiền",
    sections: [
      {
        note: "A在买水果 — Mua trái cây",
        lines: [
          line("A", "您好，您买什么？", "Nín hǎo, nín mǎi shénme?", "Chào anh, anh mua gì ạ?"),
          line(
            "B",
            "我买水果。苹果一斤多少钱？",
            "Wǒ mǎi shuǐguǒ. Píngguǒ yì jīn duōshao qián?",
            "Tôi mua hoa quả. Táo bao nhiêu tiền một cân?",
          ),
          line("A", "六块。", "Liù kuài.", "Sáu đồng."),
          line(
            "B",
            "六块？太贵了。便宜点儿吧。",
            "Liù kuài? Tài guì le. Piányi diǎnr ba.",
            "Sáu đồng? Đắt quá. Rẻ một chút đi.",
          ),
          line("A", "你要多少？", "Nǐ yào duōshao?", "Anh lấy bao nhiêu?"),
          line("B", "来五个吧。", "Lái wǔ ge ba.", "Lấy năm quả đi."),
          line("A", "还要别的吗？", "Hái yào bié de ma?", "Còn lấy gì khác không?"),
          line("B", "橘子怎么卖？", "Júzi zěnme mài?", "Quýt bán thế nào?"),
          line("A", "八块。", "Bā kuài.", "Tám đồng."),
          line(
            "B",
            "要两斤吧。一共多少钱？",
            "Yào liǎng jīn ba. Yígòng duōshao qián?",
            "Lấy hai cân. Tổng cộng bao nhiêu tiền?",
          ),
          line(
            "A",
            "一共二十一块三（毛）。你给二十一吧。",
            "Yígòng èrshíyī kuài sān (máo). Nǐ gěi èrshíyī ba.",
            "Tổng cộng hai mươi mốt đồng ba hào. Anh đưa hai mươi mốt thôi.",
          ),
          line("B", "好。给你钱。", "Hǎo. Gěi nǐ qián.", "Được. Tiền đây."),
          line(
            "A",
            "这是五十，找您二十九块。",
            "Zhè shì wǔshí, zhǎo nín èrshíjiǔ kuài.",
            "Đây là năm mươi, trả lại anh hai mươi chín đồng.",
          ),
        ],
      },
    ],
  },
  {
    lesson: 9,
    title: "我换人民币 — Tôi đổi tiền Nhân dân tệ",
    sections: [
      {
        lines: [
          line(
            "玛丽",
            "下午我去图书馆，你去不去？",
            "Xiàwǔ wǒ qù túshūguǎn, nǐ qù bu qù?",
            "Buổi chiều tôi đi thư viện, bạn có đi không?",
          ),
          line(
            "麦克",
            "我不去。我要去银行换钱。",
            "Wǒ bú qù. Wǒ yào qù yínháng huàn qián.",
            "Tôi không đi. Tôi phải đi ngân hàng đổi tiền.",
          ),
        ],
      },
      {
        note: "在中国银行换钱 — Đổi tiền ở Ngân hàng Trung Quốc",
        lines: [
          line("麦克", "小姐，我换钱。", "Xiǎojiě, wǒ huàn qián.", "Chị ơi, tôi muốn đổi tiền."),
          line("营业员", "您换什么钱？", "Nín huàn shénme qián?", "Anh đổi tiền gì ạ?"),
          line("麦克", "我换人民币。", "Wǒ huàn rénmínbì.", "Tôi đổi Nhân dân tệ."),
          line("营业员", "换多少？", "Huàn duōshao?", "Đổi bao nhiêu ạ?"),
          line("麦克", "二百美元。", "Èrbǎi měiyuán.", "Hai trăm đô la Mỹ."),
          line(
            "营业员",
            "请等一会儿。……先生，给您钱。请数数。",
            "Qǐng děng yíhuìr. …… Xiānsheng, gěi nín qián. Qǐng shǔshu.",
            "Xin chờ một lát. … Thưa anh, tiền của anh đây. Mời anh đếm lại.",
          ),
          line("麦克", "对。谢谢！", "Duì. Xièxie!", "Đúng rồi. Cảm ơn!"),
          line("营业员", "不客气！", "Bú kèqi!", "Không có gì!"),
        ],
      },
    ],
  },
  {
    lesson: 10,
    title: "他住哪儿 — Ông ấy sống ở đâu",
    sections: [
      {
        lines: [
          line(
            "李昌浩",
            "请问，这是办公室吗？",
            "Qǐngwèn, zhè shì bàngōngshì ma?",
            "Xin hỏi, đây có phải là văn phòng không ạ?",
          ),
          line("老师", "是。你找谁？", "Shì. Nǐ zhǎo shéi?", "Phải. Em tìm ai?"),
          line(
            "李昌浩",
            "王老师在吗？我是他的学生。",
            "Wáng lǎoshī zài ma? Wǒ shì tā de xuésheng.",
            "Thầy Vương có ở đây không ạ? Em là học sinh của thầy ấy.",
          ),
          line(
            "老师",
            "他不在。他在家呢。",
            "Tā bú zài. Tā zài jiā ne.",
            "Thầy ấy không có ở đây. Thầy ấy đang ở nhà.",
          ),
          line("李昌浩", "他住哪儿？", "Tā zhù nǎr?", "Thầy ấy sống ở đâu ạ?"),
          line(
            "老师",
            "他住18号楼1门601房间。",
            "Tā zhù shíbā hào lóu yī mén liù líng yāo fángjiān.",
            "Thầy ấy sống ở phòng 601, cửa số 1, tòa nhà số 18.",
            "他住十八号楼一门六零幺房间。",
          ),
          line(
            "李昌浩",
            "您知道他家的电话号码吗？",
            "Nín zhīdào tā jiā de diànhuà hàomǎ ma?",
            "Thầy có biết số điện thoại nhà thầy ấy không ạ?",
          ),
          line(
            "老师",
            "知道，62931074。",
            "Zhīdào, liù èr jiǔ sān yāo líng qī sì.",
            "Biết, 62931074.",
            "知道，六二九三幺零七四。",
          ),
          line(
            "李昌浩",
            "他的手机号码是多少？",
            "Tā de shǒujī hàomǎ shì duōshao?",
            "Số di động của thầy ấy là bao nhiêu ạ?",
          ),
          line("老师", "不知道。", "Bù zhīdào.", "Không biết."),
          line("李昌浩", "谢谢您。", "Xièxie nín.", "Em cảm ơn thầy."),
          line("老师", "不客气。", "Bú kèqi.", "Không có gì."),
        ],
      },
    ],
  },
];

/** Một câu kèm id ổn định (dùng làm khoá đáp án & lịch sử sai). */
export interface ReadingItem extends ReadingLine {
  id: string;
}

/** Bài đọc của bài số `lesson`; chưa có thì null. */
export function getChineseReading(lesson: number | null): ChineseReading | null {
  if (lesson === null) return null;
  return CHINESE_READINGS.find((r) => r.lesson === lesson) ?? null;
}

/** Trải phẳng mọi câu của bài đọc theo thứ tự, gắn id `bài-đoạn-câu`. */
export function readingItems(reading: ChineseReading): ReadingItem[] {
  return reading.sections.flatMap((section, s) =>
    section.lines.map((l, i) => ({ ...l, id: `${reading.lesson}-${s}-${i}` })),
  );
}
