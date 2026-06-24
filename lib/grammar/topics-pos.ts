import type { GrammarTopic } from "./types";

// Nhóm chủ đề ngữ pháp về từ loại (Parts of Speech): trạng từ, giới từ, động từ, động từ khuyết thiếu.
export const GRAMMAR_TOPICS_POS: GrammarTopic[] = [
  {
    id: "adverbs",
    level: "A",
    name: "Adverbs",
    nameVi: "Trạng từ",
    icon: "🏃",
    summary: "Trạng từ bổ nghĩa cho động từ, tính từ hoặc cả câu, cho biết cách thức, nơi chốn, thời gian, tần suất và mức độ.",
    rules: [
      {
        title: "Định nghĩa và chức năng của trạng từ",
        explanation:
          "Trạng từ (adverb) là từ dùng để bổ nghĩa cho động từ, tính từ, một trạng từ khác hoặc cả câu. Nó trả lời cho các câu hỏi: như thế nào? ở đâu? khi nào? bao lâu một lần? và ở mức độ nào.",
        examples: [
          { en: "She sings beautifully.", vi: "Cô ấy hát hay (bổ nghĩa cho động từ 'sings')." },
          { en: "He is very tall.", vi: "Anh ấy rất cao ('very' bổ nghĩa cho tính từ 'tall')." },
          { en: "Luckily, we arrived on time.", vi: "May mắn thay, chúng tôi đến đúng giờ ('luckily' bổ nghĩa cho cả câu)." },
        ],
      },
      {
        title: "Phân loại trạng từ",
        explanation:
          "Có nhiều loại trạng từ chính: cách thức (manner: how), nơi chốn (place: where), thời gian (time: when), tần suất (frequency: how often) và mức độ (degree: to what extent).",
        examples: [
          { en: "He drives carefully. (manner)", vi: "Anh ấy lái xe cẩn thận. (cách thức)" },
          { en: "I left my keys here. (place)", vi: "Tôi để chìa khóa ở đây. (nơi chốn)" },
          { en: "She rarely eats meat. (frequency)", vi: "Cô ấy hiếm khi ăn thịt. (tần suất)" },
        ],
      },
      {
        title: "Cách tạo trạng từ từ tính từ (+ly)",
        explanation:
          "Đa số trạng từ cách thức được tạo bằng cách thêm '-ly' vào tính từ. Có một số quy tắc biến đổi chính tả: tính từ kết thúc bằng 'y' đổi thành 'i' rồi thêm 'ly' (happy → happily); kết thúc bằng 'le' bỏ 'e' thêm 'y' (gentle → gently); kết thúc bằng 'ic' thêm 'ally' (basic → basically). Một số trạng từ bất quy tắc: good → well, fast → fast, hard → hard.",
        formula: "Tính từ + ly = Trạng từ",
        examples: [
          { en: "quick → quickly: She finished quickly.", vi: "nhanh → một cách nhanh chóng: Cô ấy hoàn thành nhanh chóng." },
          { en: "happy → happily: They lived happily.", vi: "hạnh phúc → một cách hạnh phúc: Họ sống hạnh phúc." },
          { en: "good → well: He plays the piano well.", vi: "giỏi → giỏi: Anh ấy chơi piano giỏi." },
        ],
      },
      {
        title: "Vị trí của trạng từ trong câu",
        explanation:
          "Trạng từ cách thức thường đứng sau động từ thường hoặc sau tân ngữ. Trạng từ thời gian và nơi chốn thường đứng ở cuối câu (nơi chốn trước thời gian). Trạng từ chỉ cả câu (sentence adverb) thường đứng đầu câu, ngăn cách bởi dấu phẩy.",
        examples: [
          { en: "She speaks English fluently.", vi: "Cô ấy nói tiếng Anh trôi chảy." },
          { en: "We met at the cafe yesterday.", vi: "Chúng tôi gặp nhau ở quán cà phê hôm qua. (nơi chốn trước thời gian)" },
          { en: "Fortunately, no one was hurt.", vi: "May mắn thay, không ai bị thương." },
        ],
      },
      {
        title: "Trạng từ chỉ tần suất",
        explanation:
          "Trạng từ chỉ tần suất (always, usually, often, sometimes, rarely, never...) thường đứng TRƯỚC động từ thường, nhưng đứng SAU động từ 'to be' và đứng SAU trợ động từ đầu tiên.",
        formula: "S + [trạng từ tần suất] + V(thường) / S + be + [trạng từ tần suất]",
        examples: [
          { en: "I always brush my teeth before bed.", vi: "Tôi luôn đánh răng trước khi ngủ. (trước động từ thường)" },
          { en: "She is never late for work.", vi: "Cô ấy không bao giờ đi làm muộn. (sau động từ to be)" },
          { en: "They have often visited Paris.", vi: "Họ thường xuyên đến thăm Paris. (sau trợ động từ 'have')" },
        ],
      },
    ],
    tables: [
      {
        caption: "Trạng từ chỉ tần suất theo mức độ",
        headers: ["Trạng từ", "Mức %", "Ví dụ"],
        rows: [
          ["always", "100%", "I always drink coffee in the morning."],
          ["usually", "~90%", "She usually walks to school."],
          ["often", "~70%", "We often play football on Sunday."],
          ["sometimes", "~50%", "He sometimes forgets his keys."],
          ["rarely / seldom", "~10%", "They rarely watch TV."],
          ["never", "0%", "I never eat fast food."],
        ],
      },
      {
        caption: "Chuyển tính từ thành trạng từ",
        headers: ["Tính từ", "Quy tắc", "Trạng từ"],
        rows: [
          ["quick", "+ ly", "quickly"],
          ["happy", "y → i + ly", "happily"],
          ["gentle", "bỏ e + y", "gently"],
          ["basic", "+ ally", "basically"],
          ["good", "bất quy tắc", "well"],
          ["fast", "không đổi", "fast"],
        ],
      },
    ],
    commonMistakes: [
      "❌ She sings beautiful. → ✅ She sings beautifully. (dùng trạng từ bổ nghĩa cho động từ, không dùng tính từ)",
      "❌ He plays good football. (sai khi bổ nghĩa động từ) → ✅ He plays football well.",
      "❌ I am usually not late. → ✅ I am never/usually late. (trạng từ tần suất đứng sau 'to be')",
      "❌ She drives careful. → ✅ She drives carefully. (động từ cần trạng từ).",
    ],
  },
  {
    id: "prepositions",
    level: "A",
    name: "Prepositions",
    nameVi: "Giới từ",
    icon: "📍",
    summary: "Giới từ nối danh từ/đại từ với các thành phần khác, chỉ thời gian, nơi chốn, hướng chuyển động và quan hệ.",
    rules: [
      {
        title: "Giới từ chỉ thời gian: in / on / at",
        explanation:
          "Dùng 'in' cho khoảng thời gian dài (tháng, năm, mùa, buổi trong ngày). Dùng 'on' cho ngày cụ thể và ngày trong tuần. Dùng 'at' cho giờ cụ thể và một số mốc cố định (at night, at noon).",
        formula: "in (tháng/năm/mùa) · on (ngày/thứ) · at (giờ)",
        examples: [
          { en: "My birthday is in July.", vi: "Sinh nhật tôi vào tháng Bảy." },
          { en: "The meeting is on Monday.", vi: "Cuộc họp vào thứ Hai." },
          { en: "The train leaves at 6 p.m.", vi: "Tàu khởi hành lúc 6 giờ chiều." },
        ],
      },
      {
        title: "Giới từ chỉ nơi chốn: in / on / at",
        explanation:
          "Dùng 'in' cho không gian bao quanh (trong phòng, thành phố, quốc gia). Dùng 'on' cho bề mặt (trên bàn, trên tường, trên tầng). Dùng 'at' cho một điểm/địa điểm cụ thể (at the bus stop, at the door).",
        formula: "in (bên trong) · on (trên bề mặt) · at (tại điểm)",
        examples: [
          { en: "She lives in London.", vi: "Cô ấy sống ở London." },
          { en: "The book is on the table.", vi: "Quyển sách ở trên bàn." },
          { en: "I am waiting at the bus stop.", vi: "Tôi đang đợi ở trạm xe buýt." },
        ],
      },
      {
        title: "Giới từ chỉ chuyển động",
        explanation:
          "Các giới từ chỉ chuyển động/hướng đi gồm: 'to' (đến một nơi), 'into' (vào bên trong), 'onto' (lên trên bề mặt), 'from' (từ đâu), 'through' (xuyên qua), 'across' (băng qua), 'towards' (về phía).",
        formula: "to / into / onto / through / across / towards",
        examples: [
          { en: "We are going to the beach.", vi: "Chúng tôi đang đi đến bãi biển." },
          { en: "The cat jumped onto the sofa.", vi: "Con mèo nhảy lên ghế sofa." },
          { en: "She walked into the room.", vi: "Cô ấy bước vào phòng." },
        ],
      },
      {
        title: "Một số cụm giới từ thông dụng",
        explanation:
          "Nhiều cụm cố định đi với giới từ riêng, cần học thuộc: 'good at' (giỏi về), 'interested in' (quan tâm đến), 'afraid of' (sợ), 'depend on' (phụ thuộc vào), 'arrive at/in' (đến nơi).",
        examples: [
          { en: "She is good at math.", vi: "Cô ấy giỏi toán." },
          { en: "I am interested in music.", vi: "Tôi quan tâm đến âm nhạc." },
          { en: "It depends on the weather.", vi: "Điều đó phụ thuộc vào thời tiết." },
        ],
      },
    ],
    tables: [
      {
        caption: "in / on / at chỉ thời gian",
        headers: ["Giới từ", "Dùng khi", "Ví dụ"],
        rows: [
          ["in", "tháng, năm, mùa, buổi (sáng/chiều)", "in 2024, in summer, in the morning"],
          ["on", "ngày cụ thể, thứ trong tuần, ngày lễ", "on Friday, on May 1st, on Christmas Day"],
          ["at", "giờ cụ thể, mốc cố định", "at 7 o'clock, at night, at noon"],
        ],
      },
      {
        caption: "in / on / at chỉ nơi chốn",
        headers: ["Giới từ", "Dùng khi", "Ví dụ"],
        rows: [
          ["in", "không gian bao quanh (phòng, thành phố, nước)", "in the kitchen, in Vietnam"],
          ["on", "bề mặt (bàn, tường, tầng, phố)", "on the wall, on the second floor"],
          ["at", "một điểm/địa điểm cụ thể", "at the door, at the station, at home"],
        ],
      },
    ],
    commonMistakes: [
      "❌ I will see you in Monday. → ✅ I will see you on Monday. (ngày trong tuần dùng 'on')",
      "❌ She lives at London. → ✅ She lives in London. (thành phố dùng 'in')",
      "❌ He arrived to the airport. → ✅ He arrived at the airport. ('arrive at/in', không dùng 'arrive to')",
      "❌ I am good in English. → ✅ I am good at English. (cụm cố định 'good at').",
    ],
  },
  {
    id: "verbs",
    level: "A",
    name: "Verbs",
    nameVi: "Động từ",
    icon: "⚡",
    summary: "Động từ diễn tả hành động hoặc trạng thái; gồm động từ thường, to be, khuyết thiếu, nội/ngoại động từ và các dạng V-ing, to-V.",
    rules: [
      {
        title: "Phân loại động từ",
        explanation:
          "Động từ được chia thành nhiều nhóm: động từ thường (action verbs: run, eat), động từ 'to be' (am/is/are/was/were), động từ khuyết thiếu (modal verbs: can, must), nội động từ (intransitive: không cần tân ngữ) và ngoại động từ (transitive: cần tân ngữ).",
        examples: [
          { en: "She runs every morning. (action verb)", vi: "Cô ấy chạy mỗi sáng. (động từ thường)" },
          { en: "He is a teacher. (to be)", vi: "Anh ấy là giáo viên. (động từ to be)" },
          { en: "I bought a book. (transitive — needs object)", vi: "Tôi đã mua một quyển sách. (ngoại động từ — cần tân ngữ)" },
        ],
      },
      {
        title: "Nội động từ và ngoại động từ",
        explanation:
          "Ngoại động từ (transitive) cần một tân ngữ đứng sau để hoàn chỉnh nghĩa (read a book). Nội động từ (intransitive) không cần tân ngữ (sleep, arrive). Một số động từ có thể vừa nội vừa ngoại tùy ngữ cảnh.",
        formula: "Ngoại động từ: S + V + O · Nội động từ: S + V",
        examples: [
          { en: "She reads a novel. (transitive)", vi: "Cô ấy đọc một cuốn tiểu thuyết. (ngoại động từ)" },
          { en: "The baby is sleeping. (intransitive)", vi: "Em bé đang ngủ. (nội động từ)" },
          { en: "They arrived early. (intransitive)", vi: "Họ đến sớm. (nội động từ)" },
        ],
      },
      {
        title: "Động từ thường và trợ động từ",
        explanation:
          "Trợ động từ (auxiliary verbs: do/does/did, have/has/had, will, be) giúp tạo câu hỏi, câu phủ định và các thì. Động từ thường mang nghĩa chính. Trong câu phủ định và nghi vấn ở thì hiện tại/quá khứ đơn, ta dùng trợ động từ 'do/does/did'.",
        formula: "S + do/does/did + not + V(nguyên mẫu)",
        examples: [
          { en: "Do you like coffee?", vi: "Bạn có thích cà phê không?" },
          { en: "She does not eat meat.", vi: "Cô ấy không ăn thịt." },
          { en: "They have finished the work.", vi: "Họ đã hoàn thành công việc." },
        ],
      },
      {
        title: "Gerund (V-ing) và to-infinitive",
        explanation:
          "Sau một số động từ ta dùng danh động từ V-ing (enjoy, finish, avoid); sau một số động từ khác ta dùng to-infinitive (want, decide, hope). V-ing cũng dùng sau giới từ.",
        formula: "enjoy/finish/avoid + V-ing · want/decide/hope + to V",
        examples: [
          { en: "I enjoy reading books.", vi: "Tôi thích đọc sách. (sau 'enjoy' dùng V-ing)" },
          { en: "She wants to travel abroad.", vi: "Cô ấy muốn đi du lịch nước ngoài. (sau 'want' dùng to-V)" },
          { en: "He is good at cooking.", vi: "Anh ấy giỏi nấu ăn. (sau giới từ dùng V-ing)" },
        ],
      },
      {
        title: "Động từ bất quy tắc (V1 - V2 - V3)",
        explanation:
          "Động từ bất quy tắc không thêm '-ed' ở dạng quá khứ (V2) và quá khứ phân từ (V3) mà biến đổi theo cách riêng. Cần học thuộc bảng động từ bất quy tắc vì chúng rất thông dụng.",
        formula: "V1 (nguyên mẫu) - V2 (quá khứ) - V3 (quá khứ phân từ)",
        examples: [
          { en: "go - went - gone: She went home.", vi: "đi: Cô ấy đã về nhà." },
          { en: "see - saw - seen: I have seen that film.", vi: "thấy: Tôi đã xem bộ phim đó." },
          { en: "eat - ate - eaten: He has eaten lunch.", vi: "ăn: Anh ấy đã ăn trưa." },
        ],
      },
    ],
    tables: [
      {
        caption: "Một số động từ bất quy tắc thông dụng",
        headers: ["V1", "V2", "V3", "Nghĩa"],
        rows: [
          ["go", "went", "gone", "đi"],
          ["see", "saw", "seen", "nhìn thấy"],
          ["eat", "ate", "eaten", "ăn"],
          ["take", "took", "taken", "lấy, cầm"],
          ["give", "gave", "given", "cho, đưa"],
          ["write", "wrote", "written", "viết"],
          ["come", "came", "come", "đến"],
          ["buy", "bought", "bought", "mua"],
        ],
      },
    ],
    commonMistakes: [
      "❌ She don't like tea. → ✅ She doesn't like tea. (ngôi thứ ba số ít dùng 'does')",
      "❌ I enjoy to read. → ✅ I enjoy reading. (sau 'enjoy' dùng V-ing)",
      "❌ He goed to school. → ✅ He went to school. (động từ bất quy tắc 'go-went-gone')",
      "❌ They wants to play. → ✅ They want to play. (chủ ngữ số nhiều, không thêm 's').",
    ],
  },
  {
    id: "modal-verbs",
    level: "B",
    name: "Modal verbs",
    nameVi: "Động từ khuyết thiếu",
    icon: "🔑",
    summary: "Động từ khuyết thiếu (can, may, must, should...) bổ nghĩa cho động từ chính, diễn tả khả năng, sự cho phép, bắt buộc và lời khuyên.",
    rules: [
      {
        title: "Đặc điểm chung của động từ khuyết thiếu",
        explanation:
          "Động từ khuyết thiếu (modal verbs) luôn theo sau bởi động từ nguyên mẫu không 'to', không chia theo ngôi (không thêm '-s' ở ngôi thứ ba số ít), và tạo câu hỏi/phủ định trực tiếp mà không cần trợ động từ 'do'.",
        formula: "S + modal + V(nguyên mẫu) · phủ định: S + modal + not + V",
        examples: [
          { en: "She can swim very well.", vi: "Cô ấy có thể bơi rất giỏi. (không phải 'cans')" },
          { en: "You must not be late.", vi: "Bạn không được đến muộn." },
          { en: "Can he drive a car?", vi: "Anh ấy có biết lái xe không? (không cần 'do')" },
        ],
      },
      {
        title: "Can / Could — khả năng và xin phép",
        explanation:
          "'Can' diễn tả khả năng ở hiện tại hoặc xin phép thân mật. 'Could' là dạng quá khứ của 'can' (khả năng trong quá khứ) hoặc dùng để xin phép/đề nghị lịch sự hơn.",
        formula: "S + can/could + V",
        examples: [
          { en: "I can speak three languages.", vi: "Tôi có thể nói ba thứ tiếng." },
          { en: "Could you help me, please?", vi: "Bạn có thể giúp tôi được không? (lịch sự)" },
          { en: "She could read at the age of four.", vi: "Cô ấy đã biết đọc khi lên bốn tuổi. (quá khứ)" },
        ],
      },
      {
        title: "May / Might — khả năng và xin phép",
        explanation:
          "'May' và 'might' diễn tả khả năng/điều có thể xảy ra (might thường chỉ khả năng thấp hơn). 'May' cũng dùng để xin phép trang trọng.",
        formula: "S + may/might + V",
        examples: [
          { en: "It may rain tonight.", vi: "Tối nay trời có thể mưa." },
          { en: "She might come to the party.", vi: "Có thể cô ấy sẽ đến bữa tiệc. (khả năng thấp hơn)" },
          { en: "May I leave early?", vi: "Tôi có thể về sớm được không ạ? (xin phép trang trọng)" },
        ],
      },
      {
        title: "Must / Have to — sự bắt buộc",
        explanation:
          "'Must' diễn tả sự bắt buộc xuất phát từ người nói (mệnh lệnh, quy tắc nội tại). 'Have to' diễn tả sự bắt buộc từ bên ngoài (luật lệ, hoàn cảnh). Lưu ý: 'must not' = cấm; 'don't have to' = không cần thiết.",
        formula: "S + must + V · S + have/has to + V",
        examples: [
          { en: "You must wear a seatbelt.", vi: "Bạn phải thắt dây an toàn." },
          { en: "I have to work on Saturday.", vi: "Tôi phải làm việc vào thứ Bảy." },
          { en: "You don't have to come if you're busy.", vi: "Bạn không cần phải đến nếu bạn bận." },
        ],
      },
      {
        title: "Should / Ought to và các modal khác",
        explanation:
          "'Should' và 'ought to' đưa ra lời khuyên hoặc bổn phận. 'Shall' dùng đề nghị (Shall we...?). 'Will' diễn tả ý định/tương lai. 'Had better' khuyên mạnh kèm cảnh báo. 'Need' có thể là modal hoặc động từ thường.",
        formula: "S + should/ought to + V · S + had better + V",
        examples: [
          { en: "You should see a doctor.", vi: "Bạn nên đi khám bác sĩ." },
          { en: "We ought to save more money.", vi: "Chúng ta nên tiết kiệm tiền hơn." },
          { en: "You had better hurry, or you'll miss the bus.", vi: "Bạn nên nhanh lên, kẻo lỡ xe buýt." },
        ],
      },
    ],
    tables: [
      {
        caption: "Tổng hợp động từ khuyết thiếu thông dụng",
        headers: ["Modal", "Cách dùng", "Ví dụ"],
        rows: [
          ["can", "khả năng, xin phép thân mật", "I can swim."],
          ["could", "khả năng quá khứ, lịch sự", "Could you open the door?"],
          ["may", "khả năng, xin phép trang trọng", "It may snow."],
          ["might", "khả năng thấp", "She might be at home."],
          ["must", "bắt buộc, suy luận chắc chắn", "You must stop here."],
          ["have to", "bắt buộc từ bên ngoài", "I have to go now."],
          ["should / ought to", "lời khuyên, bổn phận", "You should rest."],
          ["had better", "khuyên mạnh kèm cảnh báo", "You'd better leave now."],
        ],
      },
    ],
    commonMistakes: [
      "❌ She can to swim. → ✅ She can swim. (sau modal dùng động từ nguyên mẫu không 'to')",
      "❌ He cans drive. → ✅ He can drive. (modal không thêm '-s' ở ngôi thứ ba)",
      "❌ You must not to be late. → ✅ You must not be late. (sau 'must not' là V nguyên mẫu)",
      "❌ Do you can help me? → ✅ Can you help me? (modal tự tạo câu hỏi, không cần 'do').",
    ],
  },
];
