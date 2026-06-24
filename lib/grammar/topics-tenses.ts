import type { GrammarTopic } from "./types";

// Chương "Tenses" (Các thì) — bổ sung 7 thì còn thiếu.
// (Present Simple, Past Simple, Present Perfect đã có ở file khác.)

export const GRAMMAR_TOPICS_TENSES: GrammarTopic[] = [
  // 1. Present Continuous
  {
    id: "present-continuous",
    level: "A",
    name: "Present Continuous",
    nameVi: "Thì hiện tại tiếp diễn",
    icon: "⏳",
    summary:
      "Diễn tả hành động đang xảy ra ngay lúc nói hoặc quanh thời điểm hiện tại, và kế hoạch chắc chắn trong tương lai gần. Công thức: S + am/is/are + V-ing.",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Dùng để nói về hành động đang diễn ra ngay tại thời điểm nói, hành động tạm thời quanh hiện tại, hoặc kế hoạch đã sắp xếp cho tương lai gần.",
        examples: [
          { en: "She is reading a book right now.", vi: "Cô ấy đang đọc sách ngay bây giờ." },
          {
            en: "We are meeting our clients tomorrow.",
            vi: "Chúng tôi sẽ gặp khách hàng vào ngày mai (kế hoạch đã định).",
          },
          {
            en: "He is working in Hanoi these days.",
            vi: "Dạo này anh ấy đang làm việc ở Hà Nội (tạm thời).",
          },
        ],
      },
      {
        title: "Câu khẳng định",
        explanation:
          "Chủ ngữ + am/is/are + động từ thêm -ing. Dùng 'am' với I, 'is' với he/she/it, 'are' với you/we/they.",
        formula: "S + am/is/are + V-ing",
        examples: [
          { en: "I am studying English.", vi: "Tôi đang học tiếng Anh." },
          { en: "They are playing football.", vi: "Họ đang chơi bóng đá." },
        ],
      },
      {
        title: "Câu phủ định",
        explanation: "Thêm 'not' sau động từ tobe (am/is/are).",
        formula: "S + am/is/are + not + V-ing",
        examples: [
          { en: "She is not (isn't) sleeping now.", vi: "Cô ấy không đang ngủ lúc này." },
          { en: "We are not (aren't) watching TV.", vi: "Chúng tôi không đang xem tivi." },
        ],
      },
      {
        title: "Câu nghi vấn",
        explanation: "Đảo động từ tobe lên trước chủ ngữ.",
        formula: "Am/Is/Are + S + V-ing?",
        examples: [
          { en: "Are you listening to me?", vi: "Bạn có đang nghe tôi nói không?" },
          { en: "Is he cooking dinner?", vi: "Anh ấy có đang nấu bữa tối không?" },
        ],
      },
      {
        title: "Dấu hiệu nhận biết",
        explanation:
          "Thường đi với: now, right now, at the moment, at present, Look!, Listen!, currently.",
        examples: [
          { en: "Look! The bus is coming.", vi: "Nhìn kìa! Xe buýt đang đến." },
          { en: "Listen! Someone is singing.", vi: "Nghe này! Ai đó đang hát." },
        ],
      },
    ],
    tables: [
      {
        caption: "Cấu trúc 3 dạng câu",
        headers: ["Dạng câu", "Công thức", "Ví dụ"],
        rows: [
          ["Khẳng định", "S + am/is/are + V-ing", "I am working now."],
          ["Phủ định", "S + am/is/are + not + V-ing", "She isn't working now."],
          ["Nghi vấn", "Am/Is/Are + S + V-ing?", "Are they working now?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ She is study now. → ✅ She is studying now. (động từ phải thêm -ing)",
      "❌ I am knowing the answer. → ✅ I know the answer. (động từ chỉ trạng thái như know, like, want không dùng tiếp diễn)",
      "❌ They is playing. → ✅ They are playing. (chia sai tobe theo chủ ngữ)",
    ],
  },

  // 2. Present Perfect Continuous
  {
    id: "present-perfect-continuous",
    level: "B",
    name: "Present Perfect Continuous",
    nameVi: "Thì hiện tại hoàn thành tiếp diễn",
    icon: "🔁",
    summary:
      "Nhấn mạnh tính liên tục, kéo dài của một hành động bắt đầu trong quá khứ và kéo dài đến hiện tại (hoặc vừa mới kết thúc). Công thức: S + have/has been + V-ing.",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Nhấn mạnh quá trình/độ dài của hành động bắt đầu trong quá khứ và còn tiếp diễn đến hiện tại, hoặc vừa dừng nhưng để lại kết quả nhìn thấy được.",
        examples: [
          {
            en: "I have been learning English for five years.",
            vi: "Tôi đã và đang học tiếng Anh được năm năm rồi.",
          },
          {
            en: "It has been raining all day.",
            vi: "Trời đã mưa suốt cả ngày (và có thể vẫn còn mưa).",
          },
          {
            en: "Your eyes are red. Have you been crying?",
            vi: "Mắt bạn đỏ kìa. Bạn vừa khóc à? (kết quả nhìn thấy được).",
          },
        ],
      },
      {
        title: "Câu khẳng định",
        explanation: "Dùng 'have been' với I/you/we/they, 'has been' với he/she/it, rồi V-ing.",
        formula: "S + have/has + been + V-ing",
        examples: [
          { en: "She has been working since 8 a.m.", vi: "Cô ấy đã làm việc liên tục từ 8 giờ sáng." },
          { en: "They have been waiting for an hour.", vi: "Họ đã chờ suốt một tiếng đồng hồ." },
        ],
      },
      {
        title: "Câu phủ định",
        explanation: "Thêm 'not' sau have/has: haven't been / hasn't been + V-ing.",
        formula: "S + have/has + not + been + V-ing",
        examples: [
          {
            en: "I haven't been sleeping well lately.",
            vi: "Dạo này tôi ngủ không ngon.",
          },
          {
            en: "He hasn't been feeling well recently.",
            vi: "Gần đây anh ấy thấy không khỏe.",
          },
        ],
      },
      {
        title: "Câu nghi vấn",
        explanation: "Đảo have/has lên trước chủ ngữ, giữ 'been + V-ing'.",
        formula: "Have/Has + S + been + V-ing?",
        examples: [
          { en: "How long have you been living here?", vi: "Bạn đã sống ở đây bao lâu rồi?" },
          { en: "Has it been snowing?", vi: "Trời vừa có tuyết rơi à?" },
        ],
      },
      {
        title: "Dấu hiệu nhận biết",
        explanation:
          "Thường đi với: for (trong khoảng), since (kể từ khi), all day, all morning, how long, recently, lately.",
        examples: [
          { en: "We have been studying since morning.", vi: "Chúng tôi đã học từ sáng đến giờ." },
          { en: "He has been driving for three hours.", vi: "Anh ấy đã lái xe được ba tiếng." },
        ],
      },
    ],
    tables: [
      {
        caption: "Cấu trúc 3 dạng câu",
        headers: ["Dạng câu", "Công thức", "Ví dụ"],
        rows: [
          ["Khẳng định", "S + have/has + been + V-ing", "I have been reading for an hour."],
          ["Phủ định", "S + have/has + not + been + V-ing", "She hasn't been working today."],
          ["Nghi vấn", "Have/Has + S + been + V-ing?", "How long have you been waiting?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ I have been knowing him for years. → ✅ I have known him for years. (động từ trạng thái dùng hiện tại hoàn thành, không dùng tiếp diễn)",
      "❌ She has been work since 9. → ✅ She has been working since 9. (thiếu -ing)",
      "❌ They have being waiting. → ✅ They have been waiting. (dùng 'been' chứ không phải 'being')",
    ],
  },

  // 3. Past Continuous
  {
    id: "past-continuous",
    level: "A",
    name: "Past Continuous",
    nameVi: "Thì quá khứ tiếp diễn",
    icon: "🎞️",
    summary:
      "Diễn tả hành động đang xảy ra tại một thời điểm xác định trong quá khứ, hoặc một hành động đang diễn ra thì bị một hành động khác cắt ngang. Công thức: S + was/were + V-ing.",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Diễn tả hành động đang diễn ra tại một thời điểm cụ thể trong quá khứ, hai hành động song song trong quá khứ, hoặc hành động đang diễn ra (quá khứ tiếp diễn) bị một hành động khác (quá khứ đơn) cắt ngang.",
        examples: [
          {
            en: "At 8 p.m. last night, I was watching TV.",
            vi: "Lúc 8 giờ tối qua, tôi đang xem tivi.",
          },
          {
            en: "She was cooking while he was cleaning.",
            vi: "Cô ấy đang nấu ăn trong khi anh ấy đang dọn dẹp.",
          },
          {
            en: "I was sleeping when the phone rang.",
            vi: "Tôi đang ngủ thì điện thoại reo.",
          },
        ],
      },
      {
        title: "Câu khẳng định",
        explanation: "Dùng 'was' với I/he/she/it, 'were' với you/we/they, rồi V-ing.",
        formula: "S + was/were + V-ing",
        examples: [
          { en: "They were playing in the garden.", vi: "Họ đang chơi trong vườn." },
          { en: "He was driving to work.", vi: "Anh ấy đang lái xe đi làm." },
        ],
      },
      {
        title: "Câu phủ định",
        explanation: "Thêm 'not' sau was/were: wasn't / weren't + V-ing.",
        formula: "S + was/were + not + V-ing",
        examples: [
          { en: "I wasn't listening to you.", vi: "Tôi không đang nghe bạn nói." },
          { en: "We weren't sleeping at that time.", vi: "Lúc đó chúng tôi không ngủ." },
        ],
      },
      {
        title: "Câu nghi vấn",
        explanation: "Đảo was/were lên trước chủ ngữ.",
        formula: "Was/Were + S + V-ing?",
        examples: [
          { en: "Were you waiting for me?", vi: "Bạn có đang chờ tôi không?" },
          { en: "What was she doing at noon?", vi: "Buổi trưa cô ấy đang làm gì?" },
        ],
      },
      {
        title: "Dấu hiệu nhận biết",
        explanation:
          "Thường đi với: while (trong khi), when (khi), at that time, at 8 p.m. last night, as.",
        examples: [
          {
            en: "While I was reading, she was singing.",
            vi: "Trong khi tôi đang đọc, cô ấy đang hát.",
          },
          {
            en: "When they arrived, we were having dinner.",
            vi: "Khi họ đến, chúng tôi đang ăn tối.",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Cấu trúc 3 dạng câu",
        headers: ["Dạng câu", "Công thức", "Ví dụ"],
        rows: [
          ["Khẳng định", "S + was/were + V-ing", "I was studying at 9 p.m."],
          ["Phủ định", "S + was/were + not + V-ing", "They weren't playing then."],
          ["Nghi vấn", "Was/Were + S + V-ing?", "Was she sleeping at midnight?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ I was play football. → ✅ I was playing football. (thiếu -ing)",
      "❌ They was watching TV. → ✅ They were watching TV. (chia sai was/were)",
      "❌ When she called, I cooked. → ✅ When she called, I was cooking. (hành động đang diễn ra dùng quá khứ tiếp diễn)",
    ],
  },

  // 4. Past Perfect
  {
    id: "past-perfect",
    level: "B",
    name: "Past Perfect",
    nameVi: "Thì quá khứ hoàn thành",
    icon: "⏪",
    summary:
      "Diễn tả một hành động đã xảy ra và hoàn tất trước một thời điểm hoặc một hành động khác trong quá khứ. Công thức: S + had + V3 (quá khứ phân từ).",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Diễn tả hành động xảy ra trước một hành động/mốc thời gian khác trong quá khứ. Hành động xảy ra trước dùng quá khứ hoàn thành (had + V3), hành động sau dùng quá khứ đơn.",
        examples: [
          {
            en: "When I arrived, the train had already left.",
            vi: "Khi tôi đến, tàu đã rời đi rồi.",
          },
          {
            en: "She had finished her homework before dinner.",
            vi: "Cô ấy đã làm xong bài tập trước bữa tối.",
          },
          {
            en: "By 2010, he had written three books.",
            vi: "Đến năm 2010, anh ấy đã viết được ba cuốn sách.",
          },
        ],
      },
      {
        title: "Câu khẳng định",
        explanation: "Dùng 'had' cho tất cả các chủ ngữ, rồi đến động từ phân từ quá khứ (V3/V-ed).",
        formula: "S + had + V3/V-ed",
        examples: [
          { en: "They had eaten before we came.", vi: "Họ đã ăn xong trước khi chúng tôi đến." },
          { en: "I had seen that film before.", vi: "Tôi đã xem bộ phim đó trước đây rồi." },
        ],
      },
      {
        title: "Câu phủ định",
        explanation: "Thêm 'not' sau had: hadn't + V3.",
        formula: "S + had + not + V3/V-ed",
        examples: [
          {
            en: "She hadn't met him before the party.",
            vi: "Cô ấy chưa từng gặp anh ấy trước buổi tiệc.",
          },
          {
            en: "We hadn't finished when the bell rang.",
            vi: "Chúng tôi vẫn chưa xong khi chuông reo.",
          },
        ],
      },
      {
        title: "Câu nghi vấn",
        explanation: "Đảo 'had' lên trước chủ ngữ.",
        formula: "Had + S + V3/V-ed?",
        examples: [
          { en: "Had you eaten before you left?", vi: "Bạn đã ăn trước khi đi chưa?" },
          { en: "Had she ever traveled abroad?", vi: "Cô ấy đã từng đi nước ngoài chưa?" },
        ],
      },
      {
        title: "Dấu hiệu nhận biết",
        explanation:
          "Thường đi với: before (trước khi), after (sau khi), by the time (vào lúc), already, just, until then.",
        examples: [
          {
            en: "After he had left, she called.",
            vi: "Sau khi anh ấy đã đi, cô ấy gọi điện.",
          },
          {
            en: "By the time we arrived, the show had started.",
            vi: "Vào lúc chúng tôi đến, buổi diễn đã bắt đầu rồi.",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Cấu trúc 3 dạng câu",
        headers: ["Dạng câu", "Công thức", "Ví dụ"],
        rows: [
          ["Khẳng định", "S + had + V3/V-ed", "She had left before I arrived."],
          ["Phủ định", "S + had + not + V3/V-ed", "They hadn't finished by noon."],
          ["Nghi vấn", "Had + S + V3/V-ed?", "Had you seen it before?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ When I arrived, the train left. → ✅ When I arrived, the train had left. (hành động xảy ra trước dùng quá khứ hoàn thành)",
      "❌ She had went home. → ✅ She had gone home. (dùng phân từ quá khứ V3, không phải quá khứ đơn)",
      "❌ I had not saw him. → ✅ I had not seen him. (V3 của see là seen)",
    ],
  },

  // 5. Past Perfect Continuous
  {
    id: "past-perfect-continuous",
    level: "C",
    name: "Past Perfect Continuous",
    nameVi: "Thì quá khứ hoàn thành tiếp diễn",
    icon: "⏮️",
    summary:
      "Nhấn mạnh tính liên tục, độ dài của một hành động xảy ra và kéo dài liên tục trước một thời điểm hoặc hành động khác trong quá khứ. Công thức: S + had been + V-ing.",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Nhấn mạnh quá trình kéo dài liên tục của một hành động trước một mốc trong quá khứ, hoặc giải thích nguyên nhân của một kết quả/trạng thái trong quá khứ.",
        examples: [
          {
            en: "She had been studying for three hours before the exam started.",
            vi: "Cô ấy đã học liên tục ba tiếng trước khi kỳ thi bắt đầu.",
          },
          {
            en: "He was tired because he had been working all day.",
            vi: "Anh ấy mệt vì đã làm việc cả ngày trước đó.",
          },
          {
            en: "The ground was wet because it had been raining.",
            vi: "Mặt đất ướt vì trước đó trời đã mưa.",
          },
        ],
      },
      {
        title: "Câu khẳng định",
        explanation: "Dùng 'had been' cho mọi chủ ngữ, rồi đến V-ing.",
        formula: "S + had + been + V-ing",
        examples: [
          {
            en: "They had been waiting for an hour when the bus came.",
            vi: "Họ đã chờ một tiếng thì xe buýt đến.",
          },
          {
            en: "I had been living there for ten years before I moved.",
            vi: "Tôi đã sống ở đó mười năm trước khi chuyển đi.",
          },
        ],
      },
      {
        title: "Câu phủ định",
        explanation: "Thêm 'not' sau had: hadn't been + V-ing.",
        formula: "S + had + not + been + V-ing",
        examples: [
          {
            en: "She hadn't been feeling well before the trip.",
            vi: "Cô ấy đã không khỏe trước chuyến đi.",
          },
          {
            en: "We hadn't been sleeping enough that week.",
            vi: "Tuần đó chúng tôi đã ngủ không đủ.",
          },
        ],
      },
      {
        title: "Câu nghi vấn",
        explanation: "Đảo 'had' lên trước chủ ngữ, giữ 'been + V-ing'.",
        formula: "Had + S + been + V-ing?",
        examples: [
          {
            en: "How long had they been driving before they stopped?",
            vi: "Họ đã lái xe bao lâu trước khi dừng lại?",
          },
          {
            en: "Had you been waiting long?",
            vi: "Bạn đã chờ lâu chưa?",
          },
        ],
      },
      {
        title: "Dấu hiệu nhận biết",
        explanation:
          "Thường đi với: for (trong khoảng), since (kể từ), before, until, how long, kết hợp với một mốc/hành động quá khứ khác.",
        examples: [
          {
            en: "He had been smoking for years before he quit.",
            vi: "Anh ấy đã hút thuốc nhiều năm trước khi cai.",
          },
          {
            en: "We had been talking since noon when she arrived.",
            vi: "Chúng tôi đã nói chuyện từ trưa thì cô ấy đến.",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Cấu trúc 3 dạng câu",
        headers: ["Dạng câu", "Công thức", "Ví dụ"],
        rows: [
          ["Khẳng định", "S + had + been + V-ing", "I had been working all day."],
          ["Phủ định", "S + had + not + been + V-ing", "She hadn't been studying."],
          ["Nghi vấn", "Had + S + been + V-ing?", "Had they been waiting long?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ She had been studied for hours. → ✅ She had been studying for hours. (sau 'been' phải là V-ing)",
      "❌ They had being waiting. → ✅ They had been waiting. (dùng 'been' chứ không phải 'being')",
      "❌ He had been knowing her for years. → ✅ He had known her for years. (động từ trạng thái không dùng tiếp diễn)",
    ],
  },

  // 6. Future Simple
  {
    id: "future-simple",
    level: "A",
    name: "Future Simple",
    nameVi: "Thì tương lai đơn",
    icon: "🔮",
    summary:
      "Diễn tả quyết định tức thời ngay lúc nói, dự đoán, lời hứa hoặc lời đề nghị. Công thức: S + will + V (nguyên mẫu).",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Dùng cho quyết định tức thời ngay lúc nói, dự đoán về tương lai, lời hứa, lời đề nghị hoặc lời mời.",
        examples: [
          {
            en: "I'm thirsty. I will get some water.",
            vi: "Tôi khát quá. Tôi sẽ đi lấy ít nước (quyết định tức thời).",
          },
          {
            en: "It will rain tomorrow.",
            vi: "Ngày mai trời sẽ mưa (dự đoán).",
          },
          {
            en: "I will always love you.",
            vi: "Anh sẽ luôn yêu em (lời hứa).",
          },
        ],
      },
      {
        title: "Câu khẳng định",
        explanation: "Dùng 'will' cho mọi chủ ngữ, theo sau là động từ nguyên mẫu không 'to'.",
        formula: "S + will + V (nguyên mẫu)",
        examples: [
          { en: "She will call you later.", vi: "Cô ấy sẽ gọi cho bạn sau." },
          { en: "We will travel next month.", vi: "Chúng tôi sẽ đi du lịch tháng tới." },
        ],
      },
      {
        title: "Câu phủ định",
        explanation: "Thêm 'not' sau will: will not = won't, rồi động từ nguyên mẫu.",
        formula: "S + will + not (won't) + V",
        examples: [
          { en: "I won't tell anyone.", vi: "Tôi sẽ không nói với ai cả." },
          { en: "They won't come to the party.", vi: "Họ sẽ không đến bữa tiệc." },
        ],
      },
      {
        title: "Câu nghi vấn",
        explanation: "Đảo 'will' lên trước chủ ngữ.",
        formula: "Will + S + V?",
        examples: [
          { en: "Will you help me?", vi: "Bạn sẽ giúp tôi chứ?" },
          { en: "Will she be there?", vi: "Cô ấy sẽ có mặt ở đó chứ?" },
        ],
      },
      {
        title: "Phân biệt will và be going to",
        explanation:
          "Dùng 'will' cho quyết định tức thời và dự đoán chung; dùng 'be going to' cho kế hoạch đã định sẵn hoặc dự đoán dựa trên dấu hiệu hiện tại.",
        formula: "S + will + V  vs.  S + am/is/are + going to + V",
        examples: [
          {
            en: "I will answer the phone. (quyết định ngay) — I am going to study tonight. (kế hoạch)",
            vi: "Tôi sẽ nghe máy (quyết định ngay) — Tối nay tôi sẽ học bài (đã có kế hoạch).",
          },
          {
            en: "Look at those clouds! It's going to rain.",
            vi: "Nhìn mây kìa! Trời sắp mưa rồi (dự đoán có dấu hiệu).",
          },
        ],
      },
      {
        title: "Dấu hiệu nhận biết",
        explanation:
          "Thường đi với: tomorrow, next week/month/year, soon, in the future, someday, I think, I promise.",
        examples: [
          { en: "I think it will be cold tonight.", vi: "Tôi nghĩ tối nay trời sẽ lạnh." },
          { en: "We will see them next week.", vi: "Chúng ta sẽ gặp họ tuần sau." },
        ],
      },
    ],
    tables: [
      {
        caption: "Cấu trúc 3 dạng câu",
        headers: ["Dạng câu", "Công thức", "Ví dụ"],
        rows: [
          ["Khẳng định", "S + will + V", "I will help you."],
          ["Phủ định", "S + will not (won't) + V", "She won't go there."],
          ["Nghi vấn", "Will + S + V?", "Will they come tonight?"],
        ],
      },
      {
        caption: "will vs be going to",
        headers: ["Cấu trúc", "Cách dùng chính", "Ví dụ"],
        rows: [
          ["will + V", "Quyết định tức thời, dự đoán, lời hứa", "I will call you back."],
          ["be going to + V", "Kế hoạch đã định, dự đoán có dấu hiệu", "We are going to move house."],
        ],
      },
    ],
    commonMistakes: [
      "❌ I will to help you. → ✅ I will help you. (sau 'will' là động từ nguyên mẫu không 'to')",
      "❌ She wills come. → ✅ She will come. (will không chia theo chủ ngữ)",
      "❌ Tomorrow I am going to the party. (chỉ dùng will khi quyết định ngay) → ✅ I will go / I am going to go — chọn theo ngữ cảnh kế hoạch hay quyết định tức thời.",
    ],
  },

  // 7. Future Continuous
  {
    id: "future-continuous",
    level: "B",
    name: "Future Continuous",
    nameVi: "Thì tương lai tiếp diễn",
    icon: "🛸",
    summary:
      "Diễn tả hành động đang diễn ra tại một thời điểm xác định trong tương lai. Công thức: S + will be + V-ing.",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Diễn tả hành động sẽ đang diễn ra tại một thời điểm cụ thể trong tương lai, hoặc một hành động đang diễn ra ở tương lai thì có hành động khác xen vào.",
        examples: [
          {
            en: "At 8 p.m. tomorrow, I will be watching the match.",
            vi: "Lúc 8 giờ tối mai, tôi sẽ đang xem trận đấu.",
          },
          {
            en: "This time next week, we will be flying to Japan.",
            vi: "Vào giờ này tuần sau, chúng tôi sẽ đang bay sang Nhật.",
          },
          {
            en: "When you arrive, she will be cooking dinner.",
            vi: "Khi bạn đến, cô ấy sẽ đang nấu bữa tối.",
          },
        ],
      },
      {
        title: "Câu khẳng định",
        explanation: "Dùng 'will be' cho mọi chủ ngữ, theo sau là V-ing.",
        formula: "S + will be + V-ing",
        examples: [
          {
            en: "They will be studying at 9 tomorrow.",
            vi: "Họ sẽ đang học vào lúc 9 giờ ngày mai.",
          },
          {
            en: "I will be working all day on Monday.",
            vi: "Thứ Hai tôi sẽ làm việc cả ngày.",
          },
        ],
      },
      {
        title: "Câu phủ định",
        explanation: "Thêm 'not' sau will: won't be + V-ing.",
        formula: "S + will not (won't) be + V-ing",
        examples: [
          {
            en: "She won't be sleeping at midnight.",
            vi: "Lúc nửa đêm cô ấy sẽ không đang ngủ.",
          },
          {
            en: "We won't be using the room then.",
            vi: "Lúc đó chúng tôi sẽ không dùng căn phòng.",
          },
        ],
      },
      {
        title: "Câu nghi vấn",
        explanation: "Đảo 'will' lên trước chủ ngữ, giữ 'be + V-ing'.",
        formula: "Will + S + be + V-ing?",
        examples: [
          {
            en: "Will you be using the car tonight?",
            vi: "Tối nay bạn có dùng xe không?",
          },
          {
            en: "What will they be doing at noon?",
            vi: "Buổi trưa họ sẽ đang làm gì?",
          },
        ],
      },
      {
        title: "Dấu hiệu nhận biết",
        explanation:
          "Thường đi với: at this time tomorrow, at 8 p.m. tomorrow, this time next week, when + (hành động tương lai), soon.",
        examples: [
          {
            en: "At this time tomorrow, I will be lying on the beach.",
            vi: "Giờ này ngày mai, tôi sẽ đang nằm trên bãi biển.",
          },
          {
            en: "When she calls, we will be having lunch.",
            vi: "Khi cô ấy gọi, chúng ta sẽ đang ăn trưa.",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Cấu trúc 3 dạng câu",
        headers: ["Dạng câu", "Công thức", "Ví dụ"],
        rows: [
          ["Khẳng định", "S + will be + V-ing", "I will be working at 9."],
          ["Phủ định", "S + will not (won't) be + V-ing", "She won't be sleeping then."],
          ["Nghi vấn", "Will + S + be + V-ing?", "Will you be using it tomorrow?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ I will working at 9. → ✅ I will be working at 9. (cần 'be' trước V-ing)",
      "❌ She will be work tomorrow. → ✅ She will be working tomorrow. (thiếu -ing)",
      "❌ Will you using the car? → ✅ Will you be using the car? (giữ đủ 'be' trong câu hỏi)",
    ],
  },
];
