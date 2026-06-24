import type { GrammarTopic } from "./types";

// Nhóm chủ đề: liên từ, câu hỏi, câu hỏi đuôi, câu ước.
export const GRAMMAR_TOPICS_CLAUSES: GrammarTopic[] = [
  {
    id: "conjunctions",
    level: "B",
    name: "Conjunctions",
    nameVi: "Liên từ",
    icon: "🔗",
    summary:
      "Từ nối các từ, cụm từ hoặc mệnh đề: liên từ kết hợp (FANBOYS), liên từ phụ thuộc và cặp liên từ tương quan.",
    rules: [
      {
        title: "Liên từ kết hợp (FANBOYS)",
        explanation:
          "Nối hai thành phần ngang hàng nhau (hai từ, hai cụm, hai mệnh đề độc lập). Gồm 7 từ ghi nhớ theo chữ FANBOYS: for, and, nor, but, or, yet, so.",
        formula: "Mệnh đề 1, FANBOYS Mệnh đề 2",
        examples: [
          {
            en: "She was tired, but she finished the report.",
            vi: "Cô ấy mệt, nhưng cô ấy đã hoàn thành báo cáo.",
          },
          {
            en: "I like tea and coffee.",
            vi: "Tôi thích trà và cà phê.",
          },
          {
            en: "Hurry up, or we will miss the bus.",
            vi: "Nhanh lên, không thì chúng ta sẽ lỡ xe buýt.",
          },
        ],
      },
      {
        title: "Liên từ phụ thuộc",
        explanation:
          "Mở đầu một mệnh đề phụ và nối nó với mệnh đề chính, diễn tả quan hệ về nguyên nhân, thời gian, điều kiện, nhượng bộ... Ví dụ: because, although, when, if, while, since, before, after.",
        formula: "Mệnh đề chính + liên từ phụ thuộc + mệnh đề phụ",
        examples: [
          {
            en: "I stayed home because it was raining.",
            vi: "Tôi ở nhà vì trời đang mưa.",
          },
          {
            en: "Although he is rich, he is not happy.",
            vi: "Mặc dù anh ấy giàu, nhưng anh ấy không hạnh phúc.",
          },
          {
            en: "Call me when you arrive.",
            vi: "Hãy gọi cho tôi khi bạn đến nơi.",
          },
        ],
      },
      {
        title: "Cặp liên từ tương quan",
        explanation:
          "Đi thành cặp để nối hai thành phần ngang hàng: both...and, either...or, neither...nor, not only...but also. Hai vế sau mỗi từ phải có dạng song song nhau.",
        formula: "both A and B / either A or B / neither A nor B / not only A but also B",
        examples: [
          {
            en: "She speaks both English and French.",
            vi: "Cô ấy nói được cả tiếng Anh và tiếng Pháp.",
          },
          {
            en: "You can either stay or leave.",
            vi: "Bạn có thể ở lại hoặc rời đi.",
          },
          {
            en: "He is not only smart but also kind.",
            vi: "Anh ấy không chỉ thông minh mà còn tốt bụng.",
          },
        ],
      },
      {
        title: "Dấu phẩy khi dùng liên từ",
        explanation:
          "Khi liên từ kết hợp nối hai mệnh đề độc lập, đặt dấu phẩy trước liên từ. Khi mệnh đề phụ (bắt đầu bằng liên từ phụ thuộc) đứng trước mệnh đề chính, đặt dấu phẩy sau mệnh đề phụ; nếu mệnh đề chính đứng trước thì thường không cần dấu phẩy.",
        formula: "Mệnh đề phụ, mệnh đề chính. / Mệnh đề chính mệnh đề phụ.",
        examples: [
          {
            en: "If it rains, we will stay home.",
            vi: "Nếu trời mưa, chúng ta sẽ ở nhà.",
          },
          {
            en: "We will stay home if it rains.",
            vi: "Chúng ta sẽ ở nhà nếu trời mưa.",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Một số liên từ phổ biến",
        headers: ["Liên từ", "Ý nghĩa", "Ví dụ"],
        rows: [
          ["and", "và (thêm thông tin)", "Tom and Mary are here."],
          ["but", "nhưng (tương phản)", "It's cheap but good."],
          ["or", "hoặc (lựa chọn)", "Tea or coffee?"],
          ["so", "nên (kết quả)", "It was late, so I left."],
          ["because", "bởi vì (nguyên nhân)", "I'm happy because I passed."],
          ["although", "mặc dù (nhượng bộ)", "Although tired, she ran."],
          ["when", "khi (thời gian)", "Call me when you're free."],
          ["if", "nếu (điều kiện)", "If you ask, I'll help."],
          ["while", "trong khi (đồng thời)", "He read while she cooked."],
          ["since", "kể từ khi / vì", "Since he left, it's quiet."],
        ],
      },
    ],
    commonMistakes: [
      "❌ Although it was raining, but we went out. ✅ Although it was raining, we went out. (không dùng 'although' và 'but' cùng lúc)",
      "❌ She likes both tea and to coffee. ✅ She likes both tea and coffee. (hai vế phải song song)",
      "❌ Neither John or Mary came. ✅ Neither John nor Mary came. ('neither' đi với 'nor')",
      "❌ I was tired so that I slept. ✅ I was tired, so I slept. (dùng 'so' với dấu phẩy để chỉ kết quả)",
    ],
  },
  {
    id: "questions",
    level: "A",
    name: "Questions",
    nameVi: "Câu hỏi",
    icon: "❓",
    summary:
      "Cách tạo câu hỏi Yes/No, câu hỏi Wh-, câu hỏi với động từ thường (do/does/did) và trật tự từ chuẩn trong câu hỏi.",
    rules: [
      {
        title: "Câu hỏi Yes/No",
        explanation:
          "Đưa trợ động từ hoặc động từ to be lên đầu câu, trước chủ ngữ. Câu trả lời thường là Yes hoặc No.",
        formula: "(To be / Trợ động từ) + S + V?",
        examples: [
          {
            en: "Are you a student?",
            vi: "Bạn có phải là sinh viên không?",
          },
          {
            en: "Can she swim?",
            vi: "Cô ấy có biết bơi không?",
          },
          {
            en: "Have you finished?",
            vi: "Bạn đã làm xong chưa?",
          },
        ],
      },
      {
        title: "Câu hỏi Wh-",
        explanation:
          "Dùng từ để hỏi (what, where, when, why, who, whose, which, how) ở đầu câu để hỏi thông tin cụ thể. Có thể thêm danh từ/tính từ sau how: how much, how many, how long, how often.",
        formula: "Wh- + (trợ động từ) + S + V?",
        examples: [
          {
            en: "Where do you live?",
            vi: "Bạn sống ở đâu?",
          },
          {
            en: "How often do you exercise?",
            vi: "Bạn tập thể dục thường xuyên như thế nào?",
          },
          {
            en: "Whose book is this?",
            vi: "Đây là sách của ai?",
          },
        ],
      },
      {
        title: "Câu hỏi với động từ thường (do/does/did)",
        explanation:
          "Với động từ thường ở hiện tại đơn và quá khứ đơn, mượn trợ động từ do/does/did đặt trước chủ ngữ; động từ chính trở về dạng nguyên thể (không chia, không thêm -s/-ed).",
        formula: "Do/Does/Did + S + V(nguyên thể)?",
        examples: [
          {
            en: "Do you like coffee?",
            vi: "Bạn có thích cà phê không?",
          },
          {
            en: "Does he work here?",
            vi: "Anh ấy có làm việc ở đây không?",
          },
          {
            en: "Did they win the game?",
            vi: "Họ có thắng trận đấu không?",
          },
        ],
      },
      {
        title: "Trật tự từ trong câu hỏi",
        explanation:
          "Trật tự chuẩn là: (Từ hỏi) + trợ động từ + chủ ngữ + động từ chính + phần còn lại. Lưu ý không dùng trật tự câu trần thuật khi đặt câu hỏi.",
        formula: "(Wh-) + Trợ động từ + S + V + ...?",
        examples: [
          {
            en: "What time does the train leave?",
            vi: "Chuyến tàu khởi hành lúc mấy giờ?",
          },
          {
            en: "Why are you late?",
            vi: "Tại sao bạn lại đến muộn?",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Từ để hỏi Wh-",
        headers: ["Từ hỏi", "Hỏi về", "Ví dụ"],
        rows: [
          ["What", "Vật, sự việc, thông tin", "What is your name?"],
          ["Where", "Nơi chốn", "Where do you work?"],
          ["When", "Thời gian", "When did it happen?"],
          ["Why", "Lý do", "Why are you sad?"],
          ["Who", "Người (chủ ngữ/tân ngữ)", "Who called you?"],
          ["Whose", "Sự sở hữu", "Whose car is that?"],
          ["Which", "Lựa chọn trong một nhóm", "Which one do you want?"],
          ["How", "Cách thức, tình trạng", "How are you?"],
          ["How much", "Lượng (không đếm được) / giá", "How much is it?"],
          ["How many", "Số lượng (đếm được)", "How many books do you have?"],
          ["How long", "Khoảng thời gian / độ dài", "How long is the film?"],
          ["How often", "Mức độ thường xuyên", "How often do you read?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ You are a teacher? ✅ Are you a teacher? (đảo to be lên trước chủ ngữ)",
      "❌ Does he plays football? ✅ Does he play football? (sau does, động từ về nguyên thể)",
      "❌ Where you live? ✅ Where do you live? (cần trợ động từ do với động từ thường)",
      "❌ What time the train leaves? ✅ What time does the train leave? (cần đảo trợ động từ)",
    ],
  },
  {
    id: "tag-questions",
    level: "B",
    name: "Tag questions",
    nameVi: "Câu hỏi đuôi",
    icon: "↩️",
    summary:
      "Phần hỏi ngắn thêm vào cuối câu trần thuật để xác nhận thông tin. Quy tắc đối nghịch về dấu và dùng cùng trợ động từ với mệnh đề chính.",
    rules: [
      {
        title: "Quy tắc đối nghịch",
        explanation:
          "Nếu mệnh đề chính khẳng định thì câu hỏi đuôi ở dạng phủ định, và ngược lại. Câu hỏi đuôi luôn dùng dạng rút gọn khi phủ định (isn't, don't, won't...).",
        formula: "Khẳng định, đuôi phủ định? / Phủ định, đuôi khẳng định?",
        examples: [
          {
            en: "You are a doctor, aren't you?",
            vi: "Bạn là bác sĩ, phải không?",
          },
          {
            en: "She doesn't smoke, does she?",
            vi: "Cô ấy không hút thuốc, phải không?",
          },
          {
            en: "They will come, won't they?",
            vi: "Họ sẽ đến, phải không?",
          },
        ],
      },
      {
        title: "Dùng cùng trợ động từ / to be",
        explanation:
          "Câu hỏi đuôi lặp lại trợ động từ (do/does/did, have, will, can...) hoặc động từ to be của mệnh đề chính. Nếu mệnh đề chính dùng động từ thường mà không có trợ động từ, mượn do/does/did tương ứng thì.",
        formula: "Mệnh đề chính + trợ động từ (cùng loại) + đại từ chủ ngữ?",
        examples: [
          {
            en: "He plays tennis, doesn't he?",
            vi: "Anh ấy chơi quần vợt, phải không?",
          },
          {
            en: "You have finished, haven't you?",
            vi: "Bạn đã làm xong rồi, phải không?",
          },
          {
            en: "It was cold, wasn't it?",
            vi: "Trời đã lạnh, phải không?",
          },
        ],
      },
      {
        title: "Đại từ chủ ngữ ở phần đuôi",
        explanation:
          "Phần đuôi luôn dùng đại từ nhân xưng (I, you, he, she, it, we, they) tương ứng với chủ ngữ, không lặp lại danh từ.",
        formula: "Tom is here, isn't he? (Tom → he)",
        examples: [
          {
            en: "Mary is your sister, isn't she?",
            vi: "Mary là chị/em gái của bạn, phải không?",
          },
          {
            en: "The dogs are hungry, aren't they?",
            vi: "Mấy con chó đang đói, phải không?",
          },
        ],
      },
      {
        title: "Các trường hợp đặc biệt",
        explanation:
          "Một số cấu trúc có câu hỏi đuôi không theo công thức thông thường, cần ghi nhớ riêng: I am → aren't I, let's → shall we, câu mệnh lệnh → will you, there is/are → isn't there / aren't there, this/that → it, everyone/someone → they.",
        formula: "I am right, aren't I? / Let's go, shall we?",
        examples: [
          {
            en: "I am late, aren't I?",
            vi: "Tôi đến muộn, phải không?",
          },
          {
            en: "Let's have lunch, shall we?",
            vi: "Chúng ta ăn trưa nhé, được chứ?",
          },
          {
            en: "Open the door, will you?",
            vi: "Mở cửa giúp tôi nhé?",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Các trường hợp đặc biệt của câu hỏi đuôi",
        headers: ["Mệnh đề chính", "Câu hỏi đuôi", "Ví dụ"],
        rows: [
          ["I am ...", "aren't I?", "I am right, aren't I?"],
          ["Let's ...", "shall we?", "Let's start, shall we?"],
          ["Câu mệnh lệnh", "will you?", "Close the window, will you?"],
          ["There is/are ...", "isn't/aren't there?", "There is a problem, isn't there?"],
          ["This/That is ...", "isn't it?", "This is good, isn't it?"],
          ["Everyone/Someone ...", "they?", "Everyone agrees, don't they?"],
          ["Nobody/Nothing ... (mang nghĩa phủ định)", "đuôi khẳng định", "Nobody knows, do they?"],
        ],
      },
    ],
    commonMistakes: [
      "❌ You are tired, are you? ✅ You are tired, aren't you? (phần đuôi phải đối nghịch về dấu)",
      "❌ I am late, amn't I? ✅ I am late, aren't I? (với 'I am' dùng 'aren't I')",
      "❌ He likes coffee, doesn't it? ✅ He likes coffee, doesn't he? (đại từ phải khớp chủ ngữ)",
      "❌ Let's go, will we? ✅ Let's go, shall we? ('Let's' đi với 'shall we')",
    ],
  },
  {
    id: "wishes",
    level: "C",
    name: "Wishes",
    nameVi: "Câu ước",
    icon: "🌠",
    summary:
      "Diễn tả mong muốn về điều không có thật hoặc khó xảy ra ở hiện tại, tương lai hoặc tiếc nuối về quá khứ; cấu trúc If only tương đương nhưng nhấn mạnh hơn.",
    rules: [
      {
        title: "Wish ở hiện tại",
        explanation:
          "Diễn tả mong ước về điều trái với thực tế ở hiện tại. Động từ sau wish chia ở quá khứ đơn; với to be dùng 'were' cho mọi ngôi.",
        formula: "S + wish(es) + S + V(quá khứ) / were",
        examples: [
          {
            en: "I wish I had more money.",
            vi: "Tôi ước mình có nhiều tiền hơn. (thực tế là không có)",
          },
          {
            en: "She wishes she were taller.",
            vi: "Cô ấy ước mình cao hơn.",
          },
          {
            en: "I wish I knew the answer.",
            vi: "Tôi ước mình biết câu trả lời.",
          },
        ],
      },
      {
        title: "Wish ở tương lai",
        explanation:
          "Diễn tả mong muốn ai đó/điều gì đó thay đổi trong tương lai, thường kèm sự phàn nàn hoặc mong mỏi. Dùng would cho hành động/ý chí, could cho khả năng.",
        formula: "S + wish(es) + S + would / could + V(nguyên thể)",
        examples: [
          {
            en: "I wish it would stop raining.",
            vi: "Tôi ước trời ngừng mưa.",
          },
          {
            en: "I wish you would listen to me.",
            vi: "Tôi ước gì bạn chịu lắng nghe tôi.",
          },
          {
            en: "He wishes he could travel next year.",
            vi: "Anh ấy ước mình có thể đi du lịch vào năm tới.",
          },
        ],
      },
      {
        title: "Wish ở quá khứ",
        explanation:
          "Diễn tả sự tiếc nuối về điều đã (không) xảy ra trong quá khứ. Dùng quá khứ hoàn thành (had + V3) sau wish.",
        formula: "S + wish(es) + S + had + V3 (quá khứ hoàn thành)",
        examples: [
          {
            en: "I wish I had studied harder.",
            vi: "Tôi ước mình đã học chăm chỉ hơn. (nhưng đã không học)",
          },
          {
            en: "She wishes she hadn't said that.",
            vi: "Cô ấy ước mình đã không nói điều đó.",
          },
          {
            en: "They wish they had taken the earlier train.",
            vi: "Họ ước mình đã đi chuyến tàu sớm hơn.",
          },
        ],
      },
      {
        title: "Cấu trúc If only",
        explanation:
          "If only mang nghĩa tương đương wish nhưng nhấn mạnh, thể hiện cảm xúc mạnh hơn. Cách chia thì giống hệt câu wish ở từng thời điểm.",
        formula: "If only + S + V(quá khứ) / would-could + V / had + V3",
        examples: [
          {
            en: "If only I were rich!",
            vi: "Giá mà tôi giàu! (hiện tại)",
          },
          {
            en: "If only he would call me.",
            vi: "Giá mà anh ấy gọi cho tôi. (tương lai)",
          },
          {
            en: "If only we had left earlier.",
            vi: "Giá mà chúng tôi đã đi sớm hơn. (quá khứ)",
          },
        ],
      },
    ],
    tables: [
      {
        caption: "Ba loại câu ước với wish",
        headers: ["Loại", "Công thức", "Ví dụ", "Ý nghĩa"],
        rows: [
          [
            "Hiện tại",
            "wish + S + V(quá khứ) / were",
            "I wish I were rich.",
            "Ước trái thực tế ở hiện tại",
          ],
          [
            "Tương lai",
            "wish + S + would/could + V",
            "I wish it would stop.",
            "Mong điều gì thay đổi ở tương lai",
          ],
          [
            "Quá khứ",
            "wish + S + had + V3",
            "I wish I had gone.",
            "Tiếc nuối về quá khứ",
          ],
        ],
      },
    ],
    commonMistakes: [
      "❌ I wish I have a car. ✅ I wish I had a car. (wish hiện tại dùng quá khứ đơn)",
      "❌ I wish I was younger. ✅ I wish I were younger. (sau wish dùng 'were' cho mọi ngôi)",
      "❌ I wish I studied harder yesterday. ✅ I wish I had studied harder yesterday. (tiếc nuối quá khứ dùng had + V3)",
      "❌ I wish you will help me. ✅ I wish you would help me. (mong tương lai dùng would, không dùng will)",
    ],
  },
];
