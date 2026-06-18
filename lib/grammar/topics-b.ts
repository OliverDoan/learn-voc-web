import type { GrammarTopic } from "./types";

export const GRAMMAR_TOPICS_B: GrammarTopic[] = [
  {
    id: "present-perfect",
    level: "B",
    name: "Present Perfect",
    nameVi: "Thì hiện tại hoàn thành",
    icon: "✅",
    summary:
      "Diễn tả hành động trong quá khứ còn liên hệ tới hiện tại, hoặc kinh nghiệm. Công thức: have/has + V3 (past participle).",
    rules: [
      {
        title: "Công thức & cách dùng",
        explanation:
          "have/has + V3. Dùng cho trải nghiệm, hành động vừa xảy ra, hoặc kéo dài tới hiện tại. Thường đi với: just, already, yet, ever, never, for, since.",
        examples: [
          { en: "I have finished my homework.", vi: "Tôi đã làm xong bài tập (và giờ đã xong)." },
          { en: "She has lived here for five years.", vi: "Cô ấy đã sống ở đây 5 năm (vẫn còn sống)." },
        ],
      },
      {
        title: "for vs since",
        explanation:
          "for + khoảng thời gian (for two hours). since + mốc thời gian bắt đầu (since 2020, since Monday).",
        examples: [
          { en: "We have known each other for ten years.", vi: "Chúng tôi quen nhau được 10 năm." },
          { en: "He has worked here since 2018.", vi: "Anh ấy làm ở đây từ năm 2018." },
        ],
      },
      {
        title: "Phân biệt với quá khứ đơn",
        explanation:
          "Quá khứ đơn: thời điểm xác định, đã kết thúc (yesterday). Hiện tại hoàn thành: không nói rõ thời điểm, còn liên hệ hiện tại.",
        examples: [
          { en: "I have seen that film. (không rõ khi nào)", vi: "Tôi đã xem phim đó rồi." },
          { en: "I saw that film yesterday. (rõ thời điểm)", vi: "Tôi xem phim đó hôm qua." },
        ],
      },
    ],
    commonMistakes: [
      "Dùng V2 thay vì V3: 'I have went' ❌ → 'I have gone' ✅.",
      "Dùng với thời điểm xác định: 'I have seen him yesterday' ❌ → 'I saw him yesterday' ✅.",
      "Nhầm for/since: 'for 2020' ❌ → 'since 2020' ✅.",
    ],
    exercises: [
      {
        id: "pp-1",
        type: "mc",
        prompt: "I ___ already eaten breakfast.",
        options: ["have", "has", "had", "am"],
        answer: "have",
        explanation: "Chủ ngữ 'I' → have + V3 (eaten).",
      },
      {
        id: "pp-2",
        type: "fill",
        prompt: "Điền V3: She has ___ (write) three books.",
        answer: "written",
        explanation: "write → written (V3).",
      },
      {
        id: "pp-3",
        type: "mc",
        prompt: "We have been friends ___ 2010.",
        options: ["for", "since", "in", "from"],
        answer: "since",
        explanation: "2010 là mốc thời gian → dùng since.",
      },
      {
        id: "pp-4",
        type: "mc",
        prompt: "They have lived in Hanoi ___ ten years.",
        options: ["since", "for", "ago", "during"],
        answer: "for",
        explanation: "'ten years' là khoảng thời gian → dùng for.",
      },
      {
        id: "pp-5",
        type: "mc",
        prompt: "Chọn câu ĐÚNG:",
        options: [
          "I have seen him last week.",
          "I have seen him yesterday.",
          "I have never seen that movie.",
          "I have saw that movie.",
        ],
        answer: "I have never seen that movie.",
        explanation:
          "Hiện tại hoàn thành không đi với thời điểm xác định (last week/yesterday) và phải dùng V3 (seen).",
      },
    ],
  },
  {
    id: "comparatives-superlatives",
    level: "B",
    name: "Comparatives & Superlatives",
    nameVi: "So sánh hơn & so sánh nhất",
    icon: "📊",
    summary:
      "So sánh hơn (-er/more) để so 2 vật; so sánh nhất (-est/most) để so 3 vật trở lên.",
    rules: [
      {
        title: "Tính từ ngắn (1 âm tiết)",
        explanation:
          "So sánh hơn thêm -er + than; so sánh nhất thêm the ...-est. (tall → taller → the tallest).",
        examples: [
          { en: "He is taller than me.", vi: "Anh ấy cao hơn tôi." },
          { en: "She is the tallest in the class.", vi: "Cô ấy cao nhất lớp." },
        ],
      },
      {
        title: "Tính từ dài (2+ âm tiết)",
        explanation:
          "Dùng more ... than và the most ... (beautiful → more beautiful → the most beautiful).",
        examples: [
          { en: "This book is more interesting than that one.", vi: "Cuốn sách này hay hơn cuốn kia." },
          { en: "It is the most expensive car here.", vi: "Đó là chiếc xe đắt nhất ở đây." },
        ],
      },
      {
        title: "Bất quy tắc",
        explanation:
          "good → better → the best; bad → worse → the worst; far → farther/further → the farthest.",
        examples: [
          { en: "Her English is better than mine.", vi: "Tiếng Anh của cô ấy tốt hơn của tôi." },
          { en: "This is the best day of my life.", vi: "Đây là ngày tuyệt nhất đời tôi." },
        ],
      },
    ],
    commonMistakes: [
      "Dùng cả -er và more: 'more taller' ❌ → 'taller' ✅.",
      "Quên 'the' ở so sánh nhất: 'He is tallest' ❌ → 'He is the tallest' ✅.",
      "Dùng 'than' ở so sánh nhất: 'the best than' ❌ → 'the best in/of' ✅.",
    ],
    exercises: [
      {
        id: "cs-1",
        type: "mc",
        prompt: "A car is ___ than a bicycle.",
        options: ["fast", "faster", "fastest", "more fast"],
        answer: "faster",
        explanation: "Tính từ ngắn 'fast' so sánh hơn → faster + than.",
      },
      {
        id: "cs-2",
        type: "fill",
        prompt: "Điền so sánh nhất: Everest is the ___ (high) mountain in the world.",
        answer: "highest",
        explanation: "Tính từ ngắn → the highest.",
      },
      {
        id: "cs-3",
        type: "mc",
        prompt: "This film is ___ than the last one.",
        options: ["interesting", "interestinger", "more interesting", "most interesting"],
        answer: "more interesting",
        explanation: "Tính từ dài → more interesting than.",
      },
      {
        id: "cs-4",
        type: "fill",
        prompt: "Điền dạng bất quy tắc: My result is ___ (good) than yours.",
        answer: "better",
        explanation: "good → better (bất quy tắc).",
      },
      {
        id: "cs-5",
        type: "mc",
        prompt: "It was ___ day of my life.",
        options: ["worse", "the worst", "worst", "more bad"],
        answer: "the worst",
        explanation: "So sánh nhất của bad: the worst.",
      },
    ],
  },
  {
    id: "passive-voice",
    level: "B",
    name: "Passive Voice",
    nameVi: "Câu bị động",
    icon: "🔄",
    summary:
      "Nhấn mạnh hành động/đối tượng nhận hành động thay vì người thực hiện. Công thức: be + V3 (past participle).",
    rules: [
      {
        title: "Công thức cơ bản",
        explanation:
          "Tân ngữ câu chủ động trở thành chủ ngữ câu bị động: be (chia theo thì) + V3. Người thực hiện theo sau 'by' (nếu cần).",
        examples: [
          { en: "The cake was made by my mother.", vi: "Cái bánh được làm bởi mẹ tôi." },
          { en: "English is spoken all over the world.", vi: "Tiếng Anh được nói khắp thế giới." },
        ],
      },
      {
        title: "Bị động ở các thì",
        explanation:
          "Hiện tại đơn: am/is/are + V3. Quá khứ đơn: was/were + V3. Hiện tại hoàn thành: have/has been + V3. Tương lai: will be + V3.",
        examples: [
          { en: "The room is cleaned every day.", vi: "Căn phòng được dọn mỗi ngày." },
          { en: "The bridge will be built next year.", vi: "Cây cầu sẽ được xây năm sau." },
        ],
      },
      {
        title: "Khi nào dùng",
        explanation:
          "Khi người thực hiện không quan trọng/không rõ, hoặc muốn nhấn mạnh đối tượng. Phổ biến trong văn viết trang trọng, khoa học.",
        examples: [
          { en: "My wallet was stolen.", vi: "Ví của tôi bị lấy cắp (không rõ ai)." },
        ],
      },
    ],
    commonMistakes: [
      "Quên 'be': 'The car repaired' ❌ → 'The car was repaired' ✅.",
      "Dùng V2 thay V3: 'is wrote' ❌ → 'is written' ✅.",
      "Chia sai thì của 'be' so với câu chủ động gốc.",
    ],
    exercises: [
      {
        id: "pv-1",
        type: "mc",
        prompt: "The letter ___ by John yesterday.",
        options: ["was written", "wrote", "is written", "was wrote"],
        answer: "was written",
        explanation: "Quá khứ bị động: was + V3 (written).",
      },
      {
        id: "pv-2",
        type: "fill",
        prompt: "Điền V3: Rice is ___ (grow) in many Asian countries.",
        answer: "grown",
        explanation: "grow → grown (V3). Hiện tại bị động: is grown.",
      },
      {
        id: "pv-3",
        type: "mc",
        prompt: "A new school ___ in our town next year.",
        options: ["will build", "will be built", "is building", "builds"],
        answer: "will be built",
        explanation: "Tương lai bị động: will be + V3.",
      },
      {
        id: "pv-4",
        type: "mc",
        prompt: "Chuyển sang bị động: 'People speak English here.'",
        options: [
          "English speaks here.",
          "English is spoken here.",
          "English is speaking here.",
          "English was spoken here.",
        ],
        answer: "English is spoken here.",
        explanation: "Hiện tại đơn bị động: is + V3 (spoken).",
      },
      {
        id: "pv-5",
        type: "fill",
        prompt: "Điền be đúng: These photos ___ (take) by a professional last week. (2 từ)",
        answer: "were taken",
        explanation: "Số nhiều, quá khứ → were + taken (V3 của take).",
      },
    ],
  },
];
