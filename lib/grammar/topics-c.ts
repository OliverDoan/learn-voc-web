import type { GrammarTopic } from "./types";

export const GRAMMAR_TOPICS_C: GrammarTopic[] = [
  {
    id: "conditionals",
    level: "C",
    name: "Conditional Sentences",
    nameVi: "Câu điều kiện (loại 0, 1, 2, 3)",
    icon: "🔀",
    summary:
      "Diễn tả giả định và kết quả. 4 loại chính tùy mức độ có thật của điều kiện.",
    rules: [
      {
        title: "Loại 0 & Loại 1",
        explanation:
          "Loại 0 (sự thật hiển nhiên): If + hiện tại đơn, hiện tại đơn. Loại 1 (có thật ở tương lai): If + hiện tại đơn, will + V.",
        examples: [
          { en: "If you heat ice, it melts.", vi: "Nếu bạn làm nóng đá, nó tan chảy." },
          { en: "If it rains, I will stay home.", vi: "Nếu trời mưa, tôi sẽ ở nhà." },
        ],
      },
      {
        title: "Loại 2 — không có thật ở hiện tại",
        explanation:
          "If + quá khứ đơn, would + V. Diễn tả giả định trái với hiện tại. Dùng 'were' cho mọi ngôi với to be.",
        examples: [
          { en: "If I had a car, I would drive to work.", vi: "Nếu tôi có ô tô, tôi sẽ lái đi làm (nhưng không có)." },
          { en: "If I were you, I would apologize.", vi: "Nếu tôi là bạn, tôi sẽ xin lỗi." },
        ],
      },
      {
        title: "Loại 3 — không có thật ở quá khứ",
        explanation:
          "If + quá khứ hoàn thành (had + V3), would have + V3. Tiếc nuối về điều đã không xảy ra.",
        examples: [
          { en: "If I had studied, I would have passed.", vi: "Nếu tôi đã học, tôi đã đậu (nhưng đã không học)." },
        ],
      },
    ],
    commonMistakes: [
      "Dùng will ngay sau if ở loại 1: 'If it will rain' ❌ → 'If it rains' ✅.",
      "Dùng would trong mệnh đề if: 'If I would have' ❌ → 'If I had' ✅.",
      "Nhầm loại 2 và 3: loại 2 (quá khứ đơn + would V), loại 3 (had V3 + would have V3).",
    ],
    exercises: [
      {
        id: "cd-1",
        type: "mc",
        prompt: "If it ___ tomorrow, we will cancel the trip.",
        options: ["rains", "will rain", "rained", "would rain"],
        answer: "rains",
        explanation: "Loại 1: If + hiện tại đơn (rains), mệnh đề chính dùng will.",
      },
      {
        id: "cd-2",
        type: "mc",
        prompt: "If I ___ rich, I would travel the world.",
        options: ["am", "was", "were", "will be"],
        answer: "were",
        explanation: "Loại 2: dùng 'were' cho mọi ngôi (If I were...).",
      },
      {
        id: "cd-3",
        type: "fill",
        prompt: "Loại 3 — điền: If she had left earlier, she ___ (catch) the train. (3 từ)",
        answer: "would have caught",
        explanation: "Loại 3: would have + V3 (catch → caught).",
      },
      {
        id: "cd-4",
        type: "mc",
        prompt: "Water boils if you ___ it to 100°C.",
        options: ["heat", "will heat", "heated", "would heat"],
        answer: "heat",
        explanation: "Loại 0 (sự thật): cả hai mệnh đề ở hiện tại đơn.",
      },
      {
        id: "cd-5",
        type: "mc",
        prompt: "If I had known you were coming, I ___ a cake.",
        options: ["will bake", "would bake", "would have baked", "baked"],
        answer: "would have baked",
        explanation: "Mệnh đề if ở quá khứ hoàn thành (had known) → loại 3: would have + V3.",
      },
    ],
  },
  {
    id: "relative-clauses",
    level: "C",
    name: "Relative Clauses",
    nameVi: "Mệnh đề quan hệ",
    icon: "🔗",
    summary:
      "Dùng who, which, that, whose, where... để bổ nghĩa cho danh từ, nối hai câu thành một.",
    rules: [
      {
        title: "Đại từ quan hệ",
        explanation:
          "who (người), which (vật), that (người/vật), whose (sở hữu), where (nơi chốn), when (thời gian).",
        examples: [
          { en: "The man who lives next door is a doctor.", vi: "Người đàn ông sống cạnh nhà là bác sĩ." },
          { en: "This is the book which I bought.", vi: "Đây là cuốn sách mà tôi đã mua." },
        ],
      },
      {
        title: "Mệnh đề xác định & không xác định",
        explanation:
          "Xác định (không dấu phẩy): thông tin cần thiết. Không xác định (có dấu phẩy): thông tin thêm; KHÔNG dùng 'that', không lược bỏ đại từ.",
        examples: [
          { en: "My brother, who lives in Japan, is a teacher.", vi: "Anh trai tôi, người sống ở Nhật, là giáo viên." },
          { en: "The car that he bought is red.", vi: "Chiếc xe mà anh ấy mua màu đỏ." },
        ],
      },
      {
        title: "Lược bỏ đại từ quan hệ",
        explanation:
          "Có thể bỏ who/which/that khi nó là tân ngữ của mệnh đề (the book I bought = the book that I bought).",
        examples: [
          { en: "The movie (that) we watched was boring.", vi: "Bộ phim (mà) chúng tôi xem thật chán." },
        ],
      },
    ],
    commonMistakes: [
      "Dùng 'that' trong mệnh đề không xác định (có dấu phẩy): ❌ → dùng who/which.",
      "Dùng 'which' cho người: 'the man which' ❌ → 'the man who' ✅.",
      "Lặp tân ngữ: 'the book which I bought it' ❌ → 'the book which I bought' ✅.",
    ],
    exercises: [
      {
        id: "rc-1",
        type: "mc",
        prompt: "The woman ___ helped me was very kind.",
        options: ["which", "who", "whose", "where"],
        answer: "who",
        explanation: "Chỉ người, làm chủ ngữ → who.",
      },
      {
        id: "rc-2",
        type: "mc",
        prompt: "This is the house ___ I was born.",
        options: ["which", "that", "where", "who"],
        answer: "where",
        explanation: "Chỉ nơi chốn → where.",
      },
      {
        id: "rc-3",
        type: "fill",
        prompt: "Điền đại từ quan hệ chỉ sở hữu: I met a girl ___ brother is famous.",
        answer: "whose",
        explanation: "Chỉ sở hữu (anh trai của cô gái) → whose.",
      },
      {
        id: "rc-4",
        type: "mc",
        prompt: "My laptop, ___ is two years old, still works well.",
        options: ["that", "which", "who", "where"],
        answer: "which",
        explanation: "Mệnh đề không xác định (có dấu phẩy), chỉ vật → which (không dùng that).",
      },
      {
        id: "rc-5",
        type: "mc",
        prompt: "Câu nào đại từ quan hệ CÓ THỂ lược bỏ?",
        options: [
          "The man who called you is here.",
          "The book that I read was good.",
          "The city which is famous...",
          "The woman who lives here...",
        ],
        answer: "The book that I read was good.",
        explanation: "Lược bỏ được khi đại từ là tân ngữ: 'The book I read was good.'",
      },
    ],
  },
  {
    id: "reported-speech",
    level: "C",
    name: "Reported Speech",
    nameVi: "Câu tường thuật",
    icon: "💬",
    summary:
      "Thuật lại lời nói của người khác. Thường lùi thì một bậc và đổi đại từ, trạng từ thời gian/nơi chốn.",
    rules: [
      {
        title: "Lùi thì",
        explanation:
          "present → past, past → past perfect, will → would, can → could, must → had to. (says/say thì không lùi).",
        examples: [
          { en: '"I am tired." → He said he was tired.', vi: 'Anh ấy nói anh ấy mệt.' },
          { en: '"I will call." → She said she would call.', vi: 'Cô ấy nói sẽ gọi.' },
        ],
      },
      {
        title: "Đổi đại từ & trạng từ",
        explanation:
          "now → then, today → that day, tomorrow → the next day, here → there, this → that.",
        examples: [
          { en: '"I saw him here today." → She said she had seen him there that day.', vi: 'Cô ấy nói đã gặp anh ấy ở đó ngày hôm đó.' },
        ],
      },
      {
        title: "Câu hỏi & câu mệnh lệnh",
        explanation:
          "Câu hỏi Yes/No: ask if/whether. Câu hỏi Wh-: ask + từ để hỏi + S + V. Mệnh lệnh: tell sb (not) to + V.",
        examples: [
          { en: '"Are you ok?" → He asked if I was ok.', vi: 'Anh ấy hỏi tôi có ổn không.' },
          { en: '"Close the door." → She told me to close the door.', vi: 'Cô ấy bảo tôi đóng cửa.' },
        ],
      },
    ],
    commonMistakes: [
      "Giữ nguyên thì khi cần lùi: 'He said he is tired' ❌ → 'He said he was tired' ✅.",
      "Giữ trật tự câu hỏi: 'He asked where was she' ❌ → 'He asked where she was' ✅.",
      "Quên 'to' ở mệnh lệnh tường thuật: 'told me close' ❌ → 'told me to close' ✅.",
    ],
    exercises: [
      {
        id: "rs-1",
        type: "mc",
        prompt: '"I am busy." → She said she ___ busy.',
        options: ["is", "was", "had been", "will be"],
        answer: "was",
        explanation: "Lùi thì: am → was.",
      },
      {
        id: "rs-2",
        type: "mc",
        prompt: '"I will help you." → He said he ___ help me.',
        options: ["will", "would", "had", "can"],
        answer: "would",
        explanation: "will → would khi tường thuật.",
      },
      {
        id: "rs-3",
        type: "fill",
        prompt: 'Đổi trạng từ: "I will see you tomorrow." → He said he would see me the next ___.',
        answer: "day",
        explanation: "tomorrow → the next day.",
      },
      {
        id: "rs-4",
        type: "mc",
        prompt: '"Where do you live?" → She asked me ___ I lived.',
        options: ["where do", "where", "where did", "that where"],
        answer: "where",
        explanation: "Câu hỏi tường thuật giữ trật tự S+V: 'where I lived' (bỏ do).",
      },
      {
        id: "rs-5",
        type: "mc",
        prompt: '"Don\'t be late." → The teacher told us ___ late.',
        options: ["don't be", "not to be", "to not be", "not be"],
        answer: "not to be",
        explanation: "Mệnh lệnh phủ định tường thuật: tell sb not to + V.",
      },
    ],
  },
];
