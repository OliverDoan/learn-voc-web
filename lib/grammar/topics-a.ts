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
  {
    id: "adjectives",
    level: "A",
    name: "Adjectives",
    nameVi: "Tính từ",
    icon: "🎨",
    summary:
      "Tính từ mô tả/bổ nghĩa cho danh từ. Đứng TRƯỚC danh từ hoặc SAU động từ nối (be, seem, look...). Tính từ không bao giờ thêm 's' số nhiều.",
    rules: [
      {
        title: "Vị trí của tính từ",
        explanation:
          "Tính từ đứng TRƯỚC danh từ (a red car) hoặc SAU động từ nối be/seem/look/feel/become/get (The car is red). Tính từ không đổi theo số nhiều.",
        examples: [
          { en: "She has a red car.", vi: "Cô ấy có một chiếc xe màu đỏ." },
          { en: "The flowers are beautiful.", vi: "Những bông hoa thật đẹp." },
        ],
      },
      {
        title: "Dấu hiệu nhận biết tính từ (đuôi từ)",
        explanation:
          "Nhiều tính từ có đuôi đặc trưng: -ful (useful), -less (careless), -ous (famous), -al (natural), -ive (active), -able/-ible (comfortable, possible), -y (happy), -ic (basic), -ent/-ant (different, important), -ed/-ing (tired, exciting), -ish (childish), -like (childlike).",
        examples: [
          { en: "This is a useful tool.", vi: "Đây là một công cụ hữu ích." },
          { en: "He is famous and successful.", vi: "Anh ấy nổi tiếng và thành đạt." },
        ],
      },
      {
        title: "Phân loại tính từ",
        explanation:
          "Tính từ gồm nhiều loại: (1) Mô tả/tính chất: beautiful, tall, happy; (2) Sở hữu: my, your, his, her, our, their; (3) Chỉ định: this, that, these, those; (4) Số lượng: some, many, few, three; (5) Nghi vấn: which, what, whose; (6) Phân phối: each, every, either, neither.",
        examples: [
          { en: "These red apples are mine.", vi: "Những quả táo đỏ này là của tôi." },
          { en: "Each student has some books.", vi: "Mỗi học sinh có một vài cuốn sách." },
        ],
      },
      {
        title: "Trật tự nhiều tính từ (OSASCOMP)",
        explanation:
          "Khi có nhiều tính từ, sắp theo thứ tự: Ý kiến → Kích cỡ → Tuổi → Hình dạng → Màu sắc → Nguồn gốc → Chất liệu → Mục đích, rồi mới đến danh từ.",
        examples: [
          { en: "a lovely little old house", vi: "một ngôi nhà nhỏ cũ đáng yêu" },
          { en: "a big black leather bag", vi: "một chiếc túi da đen to" },
        ],
      },
      {
        title: "Tính từ đuôi -ed và -ing",
        explanation:
          "Đuôi -ed mô tả CẢM XÚC của người (I'm bored = tôi thấy chán). Đuôi -ing mô tả TÍNH CHẤT của vật/sự việc gây ra cảm xúc đó (The film is boring = bộ phim nhàm chán).",
        examples: [
          { en: "I am interested in art.", vi: "Tôi thấy hứng thú với nghệ thuật." },
          { en: "The book is interesting.", vi: "Cuốn sách thật thú vị." },
        ],
      },
      {
        title: "Tính từ vs trạng từ",
        explanation:
          "Tính từ bổ nghĩa cho DANH TỪ; trạng từ (thường thêm -ly) bổ nghĩa cho ĐỘNG TỪ/tính từ. He is a careful driver (tính từ) ↔ He drives carefully (trạng từ).",
        examples: [
          { en: "She is a quick runner.", vi: "Cô ấy là một người chạy nhanh." },
          { en: "She runs quickly.", vi: "Cô ấy chạy nhanh." },
        ],
      },
    ],
    commonMistakes: [
      "Thêm 's' vào tính từ số nhiều: 'two beautifuls girls' ❌ → 'two beautiful girls' ✅.",
      "Nhầm -ed/-ing: nói 'I am boring' khi ý là 'tôi thấy chán' ❌ → 'I am bored' ✅.",
      "Đặt tính từ sau danh từ kiểu tiếng Việt: 'a car red' ❌ → 'a red car' ✅.",
      "Dùng tính từ thay trạng từ sau động từ: 'He runs quick' ❌ → 'He runs quickly' ✅.",
    ],
    exercises: [
      {
        id: "adj-1",
        type: "mc",
        prompt: "She bought a ___.",
        options: [
          "red beautiful dress",
          "beautiful red dress",
          "dress beautiful red",
          "red dress beautiful",
        ],
        answer: "beautiful red dress",
        explanation: "Trật tự: ý kiến (beautiful) đứng trước màu sắc (red), rồi đến danh từ.",
      },
      {
        id: "adj-2",
        type: "mc",
        prompt: "The lesson was so ___ that I almost fell asleep.",
        options: ["bored", "boring", "bore", "boredom"],
        answer: "boring",
        explanation: "Bài học GÂY ra cảm giác chán → dùng -ing (boring).",
      },
      {
        id: "adj-3",
        type: "mc",
        prompt: "I'm really ___ in learning English.",
        options: ["interesting", "interest", "interested", "interestingly"],
        answer: "interested",
        explanation: "Chủ thể là người CẢM THẤY hứng thú → dùng -ed (interested).",
      },
      {
        id: "adj-4",
        type: "mc",
        prompt: "He speaks English very ___.",
        options: ["good", "well", "goodly", "best"],
        answer: "well",
        explanation: "Bổ nghĩa cho động từ 'speaks' cần trạng từ; trạng từ của 'good' là 'well'.",
      },
      {
        id: "adj-5",
        type: "fill",
        prompt: "Sắp xếp đúng trật tự: (Japanese / a / old / nice) car → ___ car",
        answer: "a nice old Japanese",
        accept: ["nice old Japanese", "a nice old japanese", "nice old japanese"],
        explanation: "Trật tự: ý kiến (nice) → tuổi (old) → nguồn gốc (Japanese): a nice old Japanese car.",
      },
      {
        id: "adj-6",
        type: "mc",
        prompt: "Từ nào dưới đây là TÍNH TỪ (dựa vào đuôi từ)?",
        options: ["beauty", "beautiful", "beautify", "beautifully"],
        answer: "beautiful",
        explanation: "Đuôi -ful là dấu hiệu của tính từ. (beauty: danh từ, beautify: động từ, beautifully: trạng từ).",
      },
      {
        id: "adj-7",
        type: "mc",
        prompt: "Trong câu 'These books are interesting', 'These' là loại tính từ nào?",
        options: ["Chỉ định", "Sở hữu", "Số lượng", "Nghi vấn"],
        answer: "Chỉ định",
        explanation: "this/that/these/those là tính từ CHỈ ĐỊNH (demonstrative), xác định danh từ ở gần/xa.",
      },
    ],
  },
  {
    id: "nouns",
    level: "A",
    name: "Nouns",
    nameVi: "Danh từ",
    icon: "📦",
    summary:
      "Danh từ là từ chỉ người (person), sự vật (thing), địa điểm (place), khái niệm (idea), động vật (animal). Phân loại theo: số ít / số nhiều, riêng / chung, đếm được / không đếm được.",
    rules: [
      {
        title: "Định nghĩa",
        explanation:
          "Danh từ là từ dùng để gọi tên: NGƯỜI (person), SỰ VẬT (thing), ĐỊA ĐIỂM (place), KHÁI NIỆM (idea), ĐỘNG VẬT (animal).",
        examples: [
          { en: "teacher, table, London, freedom, lion", vi: "người, vật, nơi chốn, khái niệm, động vật" },
          { en: "Happiness is important.", vi: "Hạnh phúc thì quan trọng." },
        ],
      },
      {
        title: "Danh từ số ít (Singular nouns)",
        explanation:
          "Chỉ MỘT người/vật. Thường đi với a/an: 'a' trước phụ âm, 'an' trước nguyên âm (a, e, i, o, u).",
        examples: [
          { en: "a lion", vi: "một con sư tử" },
          { en: "an orange", vi: "một quả cam" },
        ],
      },
      {
        title: "Danh từ số nhiều (Plural nouns)",
        explanation:
          "Chỉ HAI người/vật trở lên. Quy tắc thêm đuôi: + s (thông thường); + es (sau s, x, ch, sh, o); f/fe → -ves.",
        examples: [
          { en: "pen → pens", vi: "+ s: cây bút" },
          { en: "bus → buses, tomato → tomatoes, dish → dishes", vi: "+ es" },
          { en: "wife → wives, wolf → wolves", vi: "+ ves (f/fe → ves)" },
        ],
      },
      {
        title: "Trường hợp danh từ kết thúc bằng 'y'",
        explanation:
          "NGUYÊN ÂM + y → chỉ thêm -s (a, e, i, o, u trước y). PHỤ ÂM + y → đổi y thành -ies.",
        examples: [
          { en: "boy → boys, day → days", vi: "nguyên âm + y → + s" },
          { en: "lorry → lorries, city → cities", vi: "phụ âm + y → -ies" },
        ],
      },
      {
        title: "Một số ngoại lệ về số nhiều",
        explanation:
          "Một vài danh từ f/fe CHỈ thêm -s (roof → roofs, dwarf → dwarfs). Một số có HAI hình thái (scarf → scarfs/scarves, hoof → hoofs/hooves).",
        examples: [
          { en: "roof → roofs, dwarf → dwarfs", vi: "chỉ thêm -s" },
          { en: "scarf → scarfs / scarves", vi: "khăn quàng (hai dạng)" },
          { en: "hoof → hoofs / hooves", vi: "móng guốc (hai dạng)" },
        ],
      },
      {
        title: "Danh từ luôn ở dạng số nhiều",
        explanation:
          "Những danh từ chỉ vật có hai phần (đồ vật đôi) luôn dùng ở dạng số nhiều, đi với động từ số nhiều.",
        examples: [
          { en: "jeans (quần bò), trousers (quần dài)", vi: "luôn số nhiều" },
          { en: "glasses (kính), pliers (kìm), noodles (mì sợi)", vi: "luôn số nhiều" },
        ],
      },
      {
        title: "Danh từ số nhiều bất quy tắc (Irregular plural nouns)",
        explanation:
          "Một số danh từ KHÔNG theo quy tắc thêm -s: đổi nguyên âm hoặc giữ nguyên hình thức.",
        examples: [
          { en: "fish → fish", vi: "giữ nguyên: con cá" },
          { en: "tooth → teeth", vi: "đổi: cái răng" },
          { en: "man → men, child → children, foot → feet", vi: "đàn ông, trẻ em, bàn chân" },
        ],
      },
      {
        title: "Danh từ riêng & danh từ chung (Proper & Common nouns)",
        explanation:
          "Danh từ RIÊNG gọi tên riêng của người/nơi chốn/tháng — luôn VIẾT HOA. Danh từ CHUNG gọi tên chung của một loại — viết thường.",
        examples: [
          { en: "Jack, Paris, August", vi: "danh từ riêng (viết hoa)" },
          { en: "grape, tiger, milk", vi: "danh từ chung (viết thường)" },
        ],
      },
      {
        title: "Danh từ đếm được & không đếm được (Countable & Uncountable nouns)",
        explanation:
          "ĐẾM ĐƯỢC: có 2 hình thái số ít/số nhiều, đi với a/an và số đếm (a dog, two books). KHÔNG ĐẾM ĐƯỢC: luôn ở dạng số ít, KHÔNG dùng a/an — thường là chất lỏng, đồ ăn, đồ uống, khái niệm trừu tượng.",
        examples: [
          { en: "an orange → three oranges", vi: "đếm được: có số ít & số nhiều" },
          { en: "a baby, two cats, three books", vi: "đếm được, đi với số đếm" },
          { en: "water, milk, gold, rice, meat", vi: "không đếm được (chất lỏng/đồ ăn)" },
          { en: "happiness, money", vi: "không đếm được (trừu tượng)" },
        ],
      },
      {
        title: "Danh từ đếm được có số ít = số nhiều",
        explanation:
          "Một số danh từ đếm được có dạng số ít và số nhiều GIỐNG NHAU, chỉ phân biệt bằng có 'a/an' (số ít) hay không (số nhiều).",
        examples: [
          { en: "a sheep → sheep", vi: "một con cừu → nhiều con cừu" },
          { en: "a fish → fish", vi: "một con cá → nhiều con cá" },
        ],
      },
    ],
    tables: [
      {
        caption: "Quy tắc tạo danh từ số nhiều",
        headers: ["Quy tắc", "Áp dụng khi", "Ví dụ"],
        rows: [
          ["+ s", "Hầu hết danh từ", "pen → pens"],
          ["+ es", "Kết thúc s, x, ch, sh, o", "bus → buses, dish → dishes, tomato → tomatoes"],
          ["+ s", "Nguyên âm + y", "boy → boys, day → days"],
          ["+ ies", "Phụ âm + y", "lorry → lorries, city → cities"],
          ["+ ves", "Kết thúc f / fe", "wife → wives, wolf → wolves"],
          ["+ s (ngoại lệ)", "Một số f/fe", "roof → roofs, dwarf → dwarfs"],
          ["Bất quy tắc", "Không theo quy tắc", "tooth → teeth, fish → fish, child → children"],
        ],
      },
    ],
    commonMistakes: [
      "Thêm 's' cho danh từ không đếm được: 'informations', 'advices' ❌ → 'information', 'advice' ✅.",
      "Dùng a/an với danh từ không đếm được: 'a money' ❌ → 'some money' ✅.",
      "Quên đổi danh từ bất quy tắc: 'childs', 'foots', 'tooths' ❌ → 'children', 'feet', 'teeth' ✅.",
      "Không viết hoa danh từ riêng: 'paris', 'august' ❌ → 'Paris', 'August' ✅.",
      "Đổi nhầm 'y' sau nguyên âm: 'boies', 'daies' ❌ → 'boys', 'days' ✅ (chỉ phụ âm + y mới thành -ies).",
      "Dùng động từ số ít với danh từ luôn số nhiều: 'my jeans is...' ❌ → 'my jeans are...' ✅.",
    ],
    exercises: [
      {
        id: "noun-1",
        type: "mc",
        prompt: "Dạng số nhiều của 'child' là ___.",
        options: ["childs", "children", "childes", "child"],
        answer: "children",
        explanation: "child là danh từ bất quy tắc: child → children.",
      },
      {
        id: "noun-2",
        type: "mc",
        prompt: "I need some ___ about this topic.",
        options: ["information", "informations", "an information", "a information"],
        answer: "information",
        explanation: "information là danh từ không đếm được → không thêm 's', không dùng a/an.",
      },
      {
        id: "noun-3",
        type: "mc",
        prompt: "Danh từ nào dưới đây KHÔNG đếm được?",
        options: ["book", "car", "water", "apple"],
        answer: "water",
        explanation: "water (nước) là danh từ không đếm được.",
      },
      {
        id: "noun-4",
        type: "mc",
        prompt: "Dạng số nhiều của 'wolf' là ___.",
        options: ["wolfs", "wolfes", "wolves", "wol"],
        answer: "wolves",
        explanation: "Danh từ kết thúc bằng f/fe → bỏ f/fe thêm -ves: wolf → wolves.",
      },
      {
        id: "noun-5",
        type: "fill",
        prompt: "Viết dạng số nhiều của 'lorry': ___",
        answer: "lorries",
        explanation: "Phụ âm + y → đổi y thành -ies: lorry → lorries.",
      },
      {
        id: "noun-6",
        type: "mc",
        prompt: "Danh từ nào là danh từ RIÊNG (proper noun)?",
        options: ["tiger", "milk", "Paris", "grape"],
        answer: "Paris",
        explanation: "Paris là tên riêng của một địa điểm → danh từ riêng, luôn viết hoa.",
      },
      {
        id: "noun-7",
        type: "fill",
        prompt: "Viết dạng số nhiều của 'boy': ___",
        answer: "boys",
        explanation: "Nguyên âm (o) + y → chỉ thêm -s: boy → boys (không thành 'boies').",
      },
      {
        id: "noun-8",
        type: "mc",
        prompt: "My new ___ very nice. (jeans)",
        options: ["jeans is", "jeans are", "jean is", "jean are"],
        answer: "jeans are",
        explanation: "jeans luôn ở dạng số nhiều → đi với động từ số nhiều 'are'.",
      },
    ],
  },
  {
    id: "pronouns",
    level: "A",
    name: "Pronouns",
    nameVi: "Đại từ",
    icon: "🙋",
    summary:
      "Đại từ là từ được dùng để thay thế cho danh từ trong câu (tránh lặp). Gồm: chủ ngữ, tân ngữ, tính từ sở hữu, đại từ sở hữu, phản thân, nghi vấn, chỉ định và bất định.",
    rules: [
      {
        title: "Định nghĩa",
        explanation:
          "Đại từ là từ được dùng để THAY THẾ cho danh từ trong câu, giúp tránh lặp lại danh từ đã nhắc tới.",
        examples: [
          { en: "Tom is tall. He is a student.", vi: "Tom cao. Cậu ấy là học sinh. (He thay Tom)" },
          { en: "I bought a book. It is interesting.", vi: "Tôi mua một quyển sách. Nó thú vị." },
        ],
      },
      {
        title: "Đại từ chủ ngữ (Subject pronouns)",
        explanation:
          "Làm CHỦ NGỮ, đứng TRƯỚC động từ. Ngôi 1: I (số ít), we (số nhiều). Ngôi 2: you. Ngôi 3: he, she, it (số ít), they (số nhiều).",
        examples: [
          { en: "I, we, you, he, she, it, they", vi: "đại từ chủ ngữ" },
          { en: "They are my friends.", vi: "Họ là bạn của tôi." },
        ],
      },
      {
        title: "Đại từ tân ngữ (Object pronouns)",
        explanation:
          "Làm TÂN NGỮ, đứng SAU động từ hoặc giới từ. Ngôi 1: me, us. Ngôi 2: you. Ngôi 3: him, her, it, them.",
        examples: [
          { en: "me, us, you, him, her, it, them", vi: "đại từ tân ngữ" },
          { en: "They invited us to the party.", vi: "Họ mời chúng tôi đến bữa tiệc." },
        ],
      },
      {
        title: "Tính từ sở hữu (Possessive adjectives)",
        explanation:
          "Đi KÈM danh từ phía sau (my + book). Gồm: my, your, his, her, its, our, their.",
        examples: [
          { en: "my, your, his, her, its, our, their", vi: "tính từ sở hữu + danh từ" },
          { en: "This is my car.", vi: "Đây là xe của tôi." },
        ],
      },
      {
        title: "Đại từ sở hữu (Possessive pronouns)",
        explanation:
          "ĐỨNG MỘT MÌNH, thay cho 'tính từ sở hữu + danh từ'. Gồm: mine, yours, his, hers, its, ours, theirs.",
        examples: [
          { en: "mine, yours, his, hers, its, ours, theirs", vi: "đại từ sở hữu (đứng một mình)" },
          { en: "That car is mine.", vi: "Chiếc xe đó là của tôi." },
        ],
      },
      {
        title: "Đại từ phản thân (Reflexive pronouns)",
        explanation:
          "myself, yourself, himself, herself, itself, ourselves, yourselves, themselves — dùng khi chủ ngữ và tân ngữ là CÙNG một người/vật.",
        examples: [
          { en: "She taught herself English.", vi: "Cô ấy tự học tiếng Anh." },
          { en: "Don't hurt yourself.", vi: "Đừng làm mình bị thương." },
        ],
      },
      {
        title: "Đại từ nghi vấn (Interrogative pronouns)",
        explanation:
          "Dùng để ĐẶT CÂU HỎI: what (cái gì), which (cái nào), who (ai - chủ ngữ), whom (ai - tân ngữ), whose (của ai).",
        examples: [
          { en: "what, which, who, whom, whose", vi: "đại từ nghi vấn" },
          { en: "Who is at the door?", vi: "Ai ở cửa vậy?" },
        ],
      },
      {
        title: "Đại từ chỉ định (Demonstrative pronouns)",
        explanation:
          "Chỉ vào người/vật: this (này - số ít, ở gần), that (kia - số ít, ở xa), these (này - số nhiều), those (kia - số nhiều).",
        examples: [
          { en: "this, that, these, those", vi: "đại từ chỉ định" },
          { en: "This is my book; those are yours.", vi: "Đây là sách của tôi; những cái kia là của bạn." },
        ],
      },
      {
        title: "Đại từ bất định (Indefinite pronouns)",
        explanation:
          "Chỉ người/vật/nơi chốn KHÔNG xác định: somebody/something/somewhere, anybody/anything/anywhere, nobody/nothing/nowhere, everybody/everything/everywhere.",
        examples: [
          { en: "somebody, anything, nowhere, everyone", vi: "đại từ bất định" },
          { en: "Somebody is waiting for you.", vi: "Có ai đó đang đợi bạn." },
        ],
      },
    ],
    tables: [
      {
        caption: "Bảng tổng hợp đại từ nhân xưng",
        headers: ["Chủ ngữ", "Tân ngữ", "Tính từ sở hữu", "Đại từ sở hữu", "Phản thân"],
        rows: [
          ["I", "me", "my", "mine", "myself"],
          ["you", "you", "your", "yours", "yourself"],
          ["he", "him", "his", "his", "himself"],
          ["she", "her", "her", "hers", "herself"],
          ["it", "it", "its", "its", "itself"],
          ["we", "us", "our", "ours", "ourselves"],
          ["you", "you", "your", "yours", "yourselves"],
          ["they", "them", "their", "theirs", "themselves"],
        ],
      },
    ],
    commonMistakes: [
      "Dùng đại từ chủ ngữ sau giới từ: 'between you and I' ❌ → 'between you and me' ✅.",
      "Nhầm tính từ sở hữu với đại từ sở hữu: 'This book is my' ❌ → 'This book is mine' ✅.",
      "its (sở hữu) vs it's (= it is): 'The cat licks it's paw' ❌ → 'its paw' ✅.",
      "Nhầm đại từ chỉ định số ít/số nhiều: 'this books' ❌ → 'these books' ✅.",
    ],
    exercises: [
      {
        id: "pro-1",
        type: "mc",
        prompt: "She gave the keys to ___.",
        options: ["I", "me", "my", "mine"],
        answer: "me",
        explanation: "Sau giới từ 'to' dùng đại từ tân ngữ → me.",
      },
      {
        id: "pro-2",
        type: "mc",
        prompt: "That umbrella is ___ (của tôi).",
        options: ["my", "mine", "me", "myself"],
        answer: "mine",
        explanation: "Đứng một mình thay danh từ → đại từ sở hữu 'mine'.",
      },
      {
        id: "pro-3",
        type: "mc",
        prompt: "He cut ___ while shaving.",
        options: ["him", "his", "himself", "he"],
        answer: "himself",
        explanation: "Chủ ngữ và tân ngữ cùng là 'he' → đại từ phản thân 'himself'.",
      },
      {
        id: "pro-4",
        type: "mc",
        prompt: "___ books on the shelf are very old. (những quyển ở xa)",
        options: ["This", "That", "These", "Those"],
        answer: "Those",
        explanation: "Số nhiều (books) + ở xa → đại từ/từ chỉ định 'those'.",
      },
      {
        id: "pro-5",
        type: "mc",
        prompt: "___ is this bag? (hỏi của ai)",
        options: ["Who", "Whom", "Whose", "Which"],
        answer: "Whose",
        explanation: "Hỏi quyền sở hữu 'của ai' → đại từ nghi vấn 'whose'.",
      },
      {
        id: "pro-6",
        type: "fill",
        prompt: "Điền đại từ bất định: There is ___ in the room — it's completely empty. (không có ai)",
        answer: "nobody",
        explanation: "Phòng trống rỗng → 'nobody' (không có ai). 'no one' cũng đúng.",
        accept: ["no one", "no-one"],
      },
    ],
  },
  {
    id: "quantifiers",
    level: "A",
    name: "Quantifiers",
    nameVi: "Từ định lượng",
    icon: "🔢",
    summary:
      "Từ định lượng cho biết số lượng của danh từ: some/any, many/much/a lot of, (a) few/(a) little, how many/how much.",
    rules: [
      {
        title: "some / any",
        explanation:
          "some dùng trong câu KHẲNG ĐỊNH và lời mời/đề nghị; any dùng trong câu PHỦ ĐỊNH và NGHI VẤN.",
        examples: [
          { en: "I have some money.", vi: "Tôi có một ít tiền." },
          { en: "Do you have any questions?", vi: "Bạn có câu hỏi nào không?" },
        ],
      },
      {
        title: "many / much / a lot of",
        explanation:
          "many + danh từ ĐẾM ĐƯỢC số nhiều (many books); much + danh từ KHÔNG đếm được (much water); a lot of / lots of dùng được cho CẢ HAI.",
        examples: [
          { en: "There isn't much time.", vi: "Không còn nhiều thời gian." },
          { en: "She has a lot of friends.", vi: "Cô ấy có nhiều bạn." },
        ],
      },
      {
        title: "(a) few / (a) little",
        explanation:
          "a few + đếm được (một vài, đủ dùng); few + đếm được (rất ít, không đủ). a little + không đếm được (một ít); little + không đếm được (rất ít, gần như không).",
        examples: [
          { en: "I have a few questions.", vi: "Tôi có một vài câu hỏi." },
          { en: "There is little hope.", vi: "Có rất ít hy vọng." },
        ],
      },
      {
        title: "how many / how much",
        explanation:
          "how many + danh từ đếm được số nhiều (How many books?); how much + danh từ không đếm được, và dùng để HỎI GIÁ (How much is it?).",
        examples: [
          { en: "How many people came?", vi: "Bao nhiêu người đã đến?" },
          { en: "How much sugar do you need?", vi: "Bạn cần bao nhiêu đường?" },
        ],
      },
    ],
    commonMistakes: [
      "much + danh từ đếm được: 'much books' ❌ → 'many books' ✅.",
      "many + danh từ không đếm được: 'many money' ❌ → 'much money' ✅.",
      "Nhầm nghĩa: 'a little' (một ít, đủ dùng) khác 'little' (rất ít, gần như không có).",
    ],
    exercises: [
      {
        id: "qt-1",
        type: "mc",
        prompt: "How ___ money do you need?",
        options: ["many", "much", "few", "a lot"],
        answer: "much",
        explanation: "money là danh từ không đếm được → how much.",
      },
      {
        id: "qt-2",
        type: "mc",
        prompt: "There aren't ___ seats left.",
        options: ["some", "any", "much", "a little"],
        answer: "any",
        explanation: "Câu phủ định → dùng 'any'.",
      },
      {
        id: "qt-3",
        type: "mc",
        prompt: "I have ___ friends here, so I'm not lonely. (một vài)",
        options: ["a few", "a little", "much", "little"],
        answer: "a few",
        explanation: "friends đếm được + nghĩa 'một vài, đủ' → a few.",
      },
    ],
  },
];
