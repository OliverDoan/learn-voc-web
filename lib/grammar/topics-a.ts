import type { GrammarTopic } from "./types";

export const GRAMMAR_TOPICS_A: GrammarTopic[] = [
  {
    id: "present-simple",
    level: "A",
    name: "Present Simple",
    nameVi: "Thì hiện tại đơn",
    icon: "🕐",
    summary:
      "Diễn tả thói quen, sự thật hiển nhiên, lịch trình cố định. Là thì nền tảng quan trọng nhất.",
    rules: [
      {
        title: "Cách dùng",
        explanation:
          "Dùng cho thói quen (every day), sự thật chung, và lịch trình. Thường đi với always, usually, often, sometimes, never.",
        examples: [
          { en: "I go to school every day.", vi: "Tôi đi học mỗi ngày." },
          { en: "The sun rises in the east.", vi: "Mặt trời mọc ở hướng đông." },
        ],
      },
      {
        title: "Ngôi thứ 3 số ít thêm -s/-es",
        explanation:
          "Với he/she/it, động từ thêm -s; thêm -es sau o, s, sh, ch, x; đổi -y thành -ies sau phụ âm.",
        examples: [
          { en: "She works in a bank.", vi: "Cô ấy làm việc ở ngân hàng." },
          { en: "He watches TV at night.", vi: "Anh ấy xem TV vào buổi tối." },
          { en: "It flies high.", vi: "Nó bay cao." },
        ],
      },
      {
        title: "Phủ định & câu hỏi với do/does",
        explanation:
          "Phủ định: don't (I/you/we/they), doesn't (he/she/it) + động từ nguyên mẫu. Câu hỏi: Do/Does + S + V?",
        examples: [
          { en: "I don't like coffee.", vi: "Tôi không thích cà phê." },
          { en: "Does she speak English?", vi: "Cô ấy có nói tiếng Anh không?" },
        ],
      },
    ],
    commonMistakes: [
      "Quên thêm -s ở ngôi thứ 3 số ít: 'He go' ❌ → 'He goes' ✅.",
      "Dùng động từ thêm -s sau does: 'Does she works?' ❌ → 'Does she work?' ✅.",
      "Dùng hiện tại đơn cho hành động đang diễn ra ngay lúc nói (phải dùng hiện tại tiếp diễn).",
    ],
    exercises: [
      {
        id: "ps-1",
        type: "mc",
        prompt: "She ___ to work by bus.",
        options: ["go", "goes", "going", "gone"],
        answer: "goes",
        explanation: "Chủ ngữ 'she' (ngôi 3 số ít) → động từ thêm -es: goes.",
      },
      {
        id: "ps-2",
        type: "mc",
        prompt: "They ___ like spicy food.",
        options: ["doesn't", "don't", "isn't", "aren't"],
        answer: "don't",
        explanation: "Chủ ngữ 'they' dùng don't + V nguyên mẫu.",
      },
      {
        id: "ps-3",
        type: "fill",
        prompt: "Điền dạng đúng: My brother ___ (watch) football every weekend.",
        answer: "watches",
        explanation: "Ngôi 3 số ít, động từ tận cùng -ch → thêm -es: watches.",
      },
      {
        id: "ps-4",
        type: "mc",
        prompt: "___ your father work in a hospital?",
        options: ["Do", "Does", "Is", "Are"],
        answer: "Does",
        explanation: "'your father' = ngôi 3 số ít → câu hỏi dùng Does.",
      },
      {
        id: "ps-5",
        type: "fill",
        prompt: "Phủ định: I ___ (not / drink) milk. (viết dạng rút gọn, 2 từ)",
        answer: "don't drink",
        accept: ["do not drink"],
        explanation: "Ngôi 'I' dùng don't + drink.",
      },
    ],
  },
  {
    id: "past-simple",
    level: "A",
    name: "Past Simple",
    nameVi: "Thì quá khứ đơn",
    icon: "⏪",
    summary:
      "Diễn tả hành động đã xảy ra và kết thúc trong quá khứ, thường có mốc thời gian (yesterday, last week, in 2020).",
    rules: [
      {
        title: "Động từ có quy tắc & bất quy tắc",
        explanation:
          "Động từ có quy tắc thêm -ed (work → worked). Động từ bất quy tắc đổi dạng riêng (go → went, see → saw).",
        examples: [
          { en: "I visited my grandmother last Sunday.", vi: "Tôi thăm bà vào Chủ nhật tuần trước." },
          { en: "She went to Paris in 2019.", vi: "Cô ấy đã đến Paris năm 2019." },
        ],
      },
      {
        title: "Phủ định & câu hỏi với did",
        explanation:
          "Dùng did cho mọi ngôi. Phủ định: didn't + V nguyên mẫu. Câu hỏi: Did + S + V?",
        examples: [
          { en: "We didn't see the film.", vi: "Chúng tôi đã không xem bộ phim đó." },
          { en: "Did you call him yesterday?", vi: "Hôm qua bạn có gọi anh ấy không?" },
        ],
      },
    ],
    commonMistakes: [
      "Dùng V2 sau did: 'Did you went?' ❌ → 'Did you go?' ✅.",
      "Quên đổi động từ bất quy tắc: 'He goed' ❌ → 'He went' ✅.",
      "Dùng quá khứ đơn khi hành động còn liên hệ hiện tại (nên dùng hiện tại hoàn thành).",
    ],
    exercises: [
      {
        id: "pa-1",
        type: "mc",
        prompt: "Yesterday I ___ a great movie.",
        options: ["watch", "watched", "watches", "watching"],
        answer: "watched",
        explanation: "'Yesterday' → quá khứ đơn, động từ có quy tắc thêm -ed: watched.",
      },
      {
        id: "pa-2",
        type: "fill",
        prompt: "Điền V2: She ___ (go) to the market this morning.",
        answer: "went",
        explanation: "go là động từ bất quy tắc: go → went.",
      },
      {
        id: "pa-3",
        type: "mc",
        prompt: "We ___ go to school last Monday because it was a holiday.",
        options: ["don't", "doesn't", "didn't", "weren't"],
        answer: "didn't",
        explanation: "Phủ định quá khứ: didn't + V nguyên mẫu.",
      },
      {
        id: "pa-4",
        type: "mc",
        prompt: "___ they enjoy the party last night?",
        options: ["Do", "Did", "Was", "Were"],
        answer: "Did",
        explanation: "Câu hỏi quá khứ đơn dùng Did + S + V.",
      },
      {
        id: "pa-5",
        type: "fill",
        prompt: "Điền V2 bất quy tắc: He ___ (buy) a new phone last week.",
        answer: "bought",
        explanation: "buy → bought (bất quy tắc).",
      },
    ],
  },
  {
    id: "articles",
    level: "A",
    name: "Articles (a / an / the)",
    nameVi: "Mạo từ a / an / the",
    icon: "🔤",
    summary:
      "a/an dùng cho danh từ đếm được số ít chưa xác định; the dùng cho danh từ đã xác định, duy nhất.",
    rules: [
      {
        title: "a vs an",
        explanation:
          "Dùng 'a' trước âm phụ âm, 'an' trước âm nguyên âm (xét ÂM, không phải chữ cái): a university (âm /j/), an hour (âm /aʊ/).",
        examples: [
          { en: "She has a dog.", vi: "Cô ấy có một con chó." },
          { en: "I waited for an hour.", vi: "Tôi đã đợi một tiếng." },
        ],
      },
      {
        title: "the — danh từ xác định",
        explanation:
          "Dùng 'the' khi cả người nói và người nghe biết rõ vật được nhắc; vật duy nhất (the sun); nhắc lại lần 2.",
        examples: [
          { en: "Close the door, please.", vi: "Làm ơn đóng cửa lại." },
          { en: "The Earth goes around the Sun.", vi: "Trái Đất quay quanh Mặt Trời." },
        ],
      },
      {
        title: "Không dùng mạo từ (zero article)",
        explanation:
          "Không dùng mạo từ với danh từ số nhiều/không đếm được mang nghĩa chung, tên riêng, bữa ăn, môn học.",
        examples: [
          { en: "I like music.", vi: "Tôi thích âm nhạc." },
          { en: "We have lunch at noon.", vi: "Chúng tôi ăn trưa lúc giữa trưa." },
        ],
      },
    ],
    commonMistakes: [
      "Dùng 'a' trước âm nguyên âm: 'a apple' ❌ → 'an apple' ✅.",
      "Dùng 'the' với danh từ chung chung số nhiều: 'I love the dogs' (ý chung) ❌ → 'I love dogs' ✅.",
      "Quên 'an' trước 'hour' vì 'h' câm: 'a hour' ❌ → 'an hour' ✅.",
    ],
    exercises: [
      {
        id: "ar-1",
        type: "mc",
        prompt: "I saw ___ elephant at the zoo.",
        options: ["a", "an", "the", "(không có)"],
        answer: "an",
        explanation: "elephant bắt đầu bằng âm nguyên âm → an.",
      },
      {
        id: "ar-2",
        type: "mc",
        prompt: "She is ___ university student.",
        options: ["a", "an", "the", "(không có)"],
        answer: "a",
        explanation: "university đọc /juː-/ (âm phụ âm /j/) → dùng a.",
      },
      {
        id: "ar-3",
        type: "mc",
        prompt: "___ moon is very bright tonight.",
        options: ["A", "An", "The", "(không có)"],
        answer: "The",
        explanation: "moon là vật duy nhất → dùng the.",
      },
      {
        id: "ar-4",
        type: "fill",
        prompt: "Điền a/an/the hoặc để trống (gõ 'x' nếu không cần): I love ___ coffee in the morning.",
        answer: "x",
        accept: ["(không có)", "khong", "no", "none"],
        explanation: "coffee ở đây mang nghĩa chung, không đếm được → không dùng mạo từ.",
      },
      {
        id: "ar-5",
        type: "mc",
        prompt: "He waited for ___ hour.",
        options: ["a", "an", "the", "(không có)"],
        answer: "an",
        explanation: "'h' trong hour câm, bắt đầu bằng âm nguyên âm → an.",
      },
    ],
  },
];
