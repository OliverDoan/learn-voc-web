// Nội dung tham khảo IELTS — nguồn: ielts.org, British Council, Cambridge IELTS guidelines
// Mục tiêu band 5.0 – 6.5 (academic/general training)

export interface IeltsSkillInfo {
  id: "listening" | "reading" | "writing" | "speaking";
  name: string;
  nameVi: string;
  icon: string;
  duration: string;
  questionCount: string;
  format: string;
  description: string;
  parts: Array<{ title: string; detail: string }>;
  questionTypes: string[];
  tips: string[];
  weeklyPlan: Array<{ week: string; goal: string; tasks: string[] }>;
}

export const IELTS_SKILLS: Record<IeltsSkillInfo["id"], IeltsSkillInfo> = {
  listening: {
    id: "listening",
    name: "Listening",
    nameVi: "Nghe",
    icon: "🎧",
    duration: "30 phút (+10 phút chuyển đáp án vào answer sheet ở paper-based)",
    questionCount: "40 câu",
    format: "4 sections, độ khó tăng dần. Mỗi đoạn audio chỉ phát MỘT lần.",
    description:
      "Bài Listening kiểm tra khả năng nghe hiểu nhiều giọng (Anh, Mỹ, Úc, NZ) trong các tình huống đời sống và học thuật.",
    parts: [
      {
        title: "Part 1 — Hội thoại đời sống",
        detail: "2 người, ngữ cảnh xã hội (đặt phòng, đăng ký dịch vụ). Form/Note completion.",
      },
      {
        title: "Part 2 — Độc thoại đời sống",
        detail: "1 người, thông tin chung (giới thiệu sự kiện, hướng dẫn tour). Map labelling phổ biến.",
      },
      {
        title: "Part 3 — Hội thoại học thuật",
        detail: "2–4 người thảo luận bài tập, dự án. Multiple choice + matching nhiều.",
      },
      {
        title: "Part 4 — Bài giảng học thuật",
        detail: "1 giảng viên độc thoại về chủ đề chuyên môn. Summary completion.",
      },
    ],
    questionTypes: [
      "Multiple choice (1 hoặc nhiều đáp án)",
      "Matching (ghép thông tin với người/địa điểm)",
      "Plan/Map/Diagram labelling",
      "Form/Note/Table/Flow-chart/Summary completion",
      "Sentence completion",
      "Short-answer questions",
    ],
    tips: [
      "Đọc câu hỏi TRƯỚC khi audio bắt đầu — gạch chân từ khoá",
      "Chú ý paraphrasing: audio nói khác từ trong câu hỏi (synonyms)",
      "Cẩn thận với bẫy: người nói thay đổi ý ('Actually...', 'On second thought...')",
      "Spelling và số/ngày tháng phải chính xác 100% — sai chính tả = sai câu",
      "Đừng để mất Part 1: dễ kiếm 8–9/10 câu cho band cao",
      "Luyện nghe BBC 6 Minute English, TED-Ed mỗi ngày 15 phút",
    ],
    weeklyPlan: [
      {
        week: "Tuần 1–2",
        goal: "Làm quen format + accent",
        tasks: [
          "Cambridge IELTS 15, làm Part 1 + Part 2 mỗi ngày",
          "Học 30 từ vựng topic 'travel, accommodation, services'",
          "Chép chính tả 5 phút audio mỗi ngày",
        ],
      },
      {
        week: "Tuần 3–4",
        goal: "Tăng tốc + Part 3, 4",
        tasks: [
          "Làm trọn 1 test Cambridge IELTS 16 (full 4 parts)",
          "Học map labelling — học từ chỉ phương hướng (next to, opposite, between)",
          "Nghe TED Talks 1 video/ngày, ghi note",
        ],
      },
      {
        week: "Tuần 5–6",
        goal: "Bẫy + paraphrasing",
        tasks: [
          "Phân tích lý do sai của 5 test gần nhất",
          "Học 50 cặp synonym thường gặp (decrease/decline, increase/rise)",
          "Tăng tốc độ x1.25 khi luyện",
        ],
      },
      {
        week: "Tuần 7–8",
        goal: "Mock test + tinh chỉnh",
        tasks: [
          "Mock 1 test/ngày, target 30/40 (band 6.5)",
          "Review lỗi spelling/grammar trong answer",
          "Nghỉ 1 ngày trước thi thật",
        ],
      },
    ],
  },
  reading: {
    id: "reading",
    name: "Reading",
    nameVi: "Đọc",
    icon: "📖",
    duration: "60 phút (không có thời gian chuyển đáp án riêng)",
    questionCount: "40 câu",
    format: "3 passages dài 700–900 từ. Academic: bài học thuật. General: bài đời sống + công việc.",
    description:
      "Bài Reading kiểm tra skimming, scanning, suy luận và hiểu ý chính/chi tiết. Quản lý thời gian là yếu tố sống còn.",
    parts: [
      {
        title: "Passage 1 — Dễ nhất",
        detail: "Topic phổ thông (lịch sử, văn hoá, du lịch). Mục tiêu: 18 phút, 12–13 câu đúng.",
      },
      {
        title: "Passage 2 — Trung bình",
        detail: "Khoa học xã hội, kinh tế, giáo dục. Mục tiêu: 20 phút.",
      },
      {
        title: "Passage 3 — Khó nhất",
        detail: "Khoa học, công nghệ, bài học thuật phức tạp. Mục tiêu: 22 phút.",
      },
    ],
    questionTypes: [
      "Multiple choice",
      "Identifying information (True/False/Not Given)",
      "Identifying writer's views (Yes/No/Not Given)",
      "Matching information / headings / features / sentence endings",
      "Sentence completion / Summary completion / Note completion",
      "Diagram label completion",
      "Short-answer questions",
    ],
    tips: [
      "ĐỪNG đọc cả bài trước — đọc câu hỏi trước, scan từ khoá trong bài",
      "Bẫy True/False/Not Given: NG = thông tin KHÔNG có trong bài (không phải sai)",
      "Matching headings: đọc câu đầu + câu cuối mỗi đoạn",
      "Quản lý thời gian: tối đa 20 phút/passage, không được vượt",
      "Skip câu khó, quay lại sau — không bỏ trống câu nào (không trừ điểm sai)",
      "Tăng vocabulary 'academic word list (AWL)' 570 từ — band 6.5 cần biết ~80%",
    ],
    weeklyPlan: [
      {
        week: "Tuần 1–2",
        goal: "Nắm dạng câu hỏi cơ bản",
        tasks: [
          "Học 50 từ AWL/tuần",
          "Mỗi ngày 1 passage Cambridge IELTS, làm True/False/NG",
          "Đọc Wikipedia Simple English 1 bài/ngày",
        ],
      },
      {
        week: "Tuần 3–4",
        goal: "Matching headings + completion",
        tasks: [
          "1 full test/3 ngày (3 passages × 60 phút)",
          "Học 100 collocations academic (conduct research, raise awareness)",
          "Đọc The Guardian / BBC News mỗi ngày",
        ],
      },
      {
        week: "Tuần 5–6",
        goal: "Tăng tốc đọc",
        tasks: [
          "Mục tiêu: 250 từ/phút khi skim",
          "Luyện scan số/tên riêng trong 30 giây",
          "Phân tích 5 bài Passage 3 (khó nhất)",
        ],
      },
      {
        week: "Tuần 7–8",
        goal: "Mock test áp lực thời gian",
        tasks: [
          "Full test/ngày, timing đúng 60 phút",
          "Target: 27/40 (band 6.5)",
          "Review lỗi, làm flashcard từ vựng chưa biết",
        ],
      },
    ],
  },
  writing: {
    id: "writing",
    name: "Writing",
    nameVi: "Viết",
    icon: "✍️",
    duration: "60 phút",
    questionCount: "2 task",
    format: "Task 1 (150 từ, 20 phút) + Task 2 (250 từ, 40 phút). Task 2 chiếm 2/3 điểm.",
    description:
      "Đánh giá theo 4 tiêu chí: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.",
    parts: [
      {
        title: "Task 1 — Academic",
        detail:
          "Mô tả biểu đồ (line, bar, pie, table), process, map. Không đưa ý kiến cá nhân. Cần overview rõ ràng.",
      },
      {
        title: "Task 1 — General",
        detail:
          "Viết thư (formal/semi-formal/informal). 3 bullet points bắt buộc nêu. Greeting + closing phù hợp tone.",
      },
      {
        title: "Task 2 — Essay",
        detail:
          "5 dạng chính: Opinion / Discussion / Problem-Solution / Advantages-Disadvantages / Two-part question. Cần introduction + 2 body + conclusion.",
      },
    ],
    questionTypes: [
      "Task 1 Academic: Line graph, Bar chart, Pie chart, Table, Process diagram, Map",
      "Task 1 General: Complaint letter, Request letter, Personal letter",
      "Task 2: Opinion (Agree/Disagree), Discussion (Discuss both views), Problem & Solution, Advantages vs Disadvantages, Two-part question",
    ],
    tips: [
      "Task 1: dành 3 phút phân tích biểu đồ, 2 phút outline trước khi viết",
      "Task 1: overview phải nêu 2–3 xu hướng nổi bật, KHÔNG có số liệu",
      "Task 2: thesis statement rõ trong introduction (1–2 câu cuối)",
      "Mỗi body paragraph = 1 topic sentence + giải thích + ví dụ",
      "Tránh từ phi học thuật: 'a lot of' → 'a significant amount of'",
      "Đa dạng cấu trúc câu: simple + compound + complex (mệnh đề if/relative)",
      "Đếm từ: Task 1 ≥ 150, Task 2 ≥ 250 — thiếu sẽ trừ điểm",
      "Chừa 5 phút cuối để check grammar (article, S-V agreement, tense)",
    ],
    weeklyPlan: [
      {
        week: "Tuần 1–2",
        goal: "Task 1 — nắm cấu trúc",
        tasks: [
          "Học 50 từ describe trend (rise, decline, fluctuate, plateau)",
          "Viết 3 Task 1/tuần, mỗi bài có overview + 2 body",
          "Học structure: Introduction (paraphrase đề) + Overview + Body 1 + Body 2",
        ],
      },
      {
        week: "Tuần 3–4",
        goal: "Task 2 — Opinion + Discussion",
        tasks: [
          "Học 30 cohesive devices (however, furthermore, on the other hand)",
          "Viết 2 Task 2/tuần dạng Opinion",
          "Học 5 chủ đề: Education, Technology, Environment, Health, Society",
        ],
      },
      {
        week: "Tuần 5–6",
        goal: "Task 2 — các dạng khác",
        tasks: [
          "Viết Problem-Solution + Advantages-Disadvantages",
          "Học collocations theo topic (environmental degradation, sustainable development)",
          "Submit bài lên forum để được sửa (r/IELTS, IELTS Liz)",
        ],
      },
      {
        week: "Tuần 7–8",
        goal: "Mock test + tinh chỉnh",
        tasks: [
          "Viết 1 full test/ngày (Task 1 + Task 2 trong 60 phút)",
          "Target: band 6.0–6.5 mỗi tiêu chí",
          "Học thuộc 20 idiom/phrase nâng cao band Lexical Resource",
        ],
      },
    ],
  },
  speaking: {
    id: "speaking",
    name: "Speaking",
    nameVi: "Nói",
    icon: "🗣️",
    duration: "11–14 phút",
    questionCount: "3 parts",
    format: "Phỏng vấn 1-1 với examiner. Được ghi âm để chấm.",
    description:
      "Đánh giá: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation. Tự nhiên quan trọng hơn 'cao siêu'.",
    parts: [
      {
        title: "Part 1 — Introduction (4–5 phút)",
        detail:
          "Hỏi về bản thân, gia đình, công việc, sở thích, quê hương. Câu trả lời 2–3 câu mỗi câu hỏi.",
      },
      {
        title: "Part 2 — Long turn / Cue card (3–4 phút)",
        detail:
          "Cho topic + 4 bullet points. 1 phút chuẩn bị, nói 1–2 phút không ngắt. Examiner có thể hỏi 1–2 câu follow-up.",
      },
      {
        title: "Part 3 — Discussion (4–5 phút)",
        detail:
          "Câu hỏi trừu tượng liên quan topic Part 2. Cần phân tích, so sánh, đưa ý kiến với lý do.",
      },
    ],
    questionTypes: [
      "Part 1: Personal info — Hometown, Work/Study, Hobbies, Food, Weather, Music",
      "Part 2: Describe a person / place / object / event / experience",
      "Part 3: Compare, Contrast, Predict future, Evaluate causes-effects",
    ],
    tips: [
      "Đừng học thuộc lòng câu trả lời — examiner phát hiện được, trừ điểm",
      "Part 1: trả lời + lý do/ví dụ ngắn, ĐỪNG quá dài (2-3 câu)",
      "Part 2: dùng 1 phút note 5–6 keywords, không viết câu đầy đủ",
      "Part 2: bám cue card theo thứ tự, mỗi bullet 20–30 giây",
      "Part 3: dùng phrase 'It depends...', 'In my view...', 'For instance...'",
      "Speak naturally — pause nhẹ OK, hơn là 'um... ah...' liên tục",
      "Phát âm: chú ý word stress + intonation hơn là 'giọng Anh/Mỹ'",
      "Mở rộng từ vựng theo topic: 30 topic thường gặp Part 2",
    ],
    weeklyPlan: [
      {
        week: "Tuần 1–2",
        goal: "Part 1 — phản xạ nhanh",
        tasks: [
          "Trả lời 10 câu hỏi Part 1/ngày, ghi âm tự nghe lại",
          "Học 30 collocations về hometown, hobbies, work",
          "Shadowing 10 phút/ngày (TED Talks)",
        ],
      },
      {
        week: "Tuần 3–4",
        goal: "Part 2 — Cue card",
        tasks: [
          "1 cue card/ngày, nói đúng 2 phút",
          "Học framework PEEL (Point-Example-Explanation-Link)",
          "Học 20 cue card mẫu phổ biến (person, place, object, event)",
        ],
      },
      {
        week: "Tuần 5–6",
        goal: "Part 3 — Discussion",
        tasks: [
          "Luyện trả lời câu hỏi trừu tượng, mỗi câu 30–45 giây",
          "Học 30 idioms tự nhiên cho band 6.5+ (a piece of cake, hit the books)",
          "Tìm partner conversation hoặc dùng AI (ChatGPT voice mode)",
        ],
      },
      {
        week: "Tuần 7–8",
        goal: "Mock test + fluency",
        tasks: [
          "Full mock 1 lần/ngày, ghi âm 11–14 phút",
          "Self-review: đếm filler words ('um', 'uh', 'like')",
          "Mục tiêu: nói 130–150 từ/phút",
        ],
      },
    ],
  },
};

export const IELTS_OVERVIEW = {
  totalDuration: "2 giờ 45 phút (không tính Speaking — thi ngày khác)",
  scoring:
    "Mỗi skill chấm 0–9 band (theo bước 0.5). Overall = trung bình 4 skill, làm tròn 0.5.",
  bandGuide: [
    { band: "9.0", level: "Expert — gần native" },
    { band: "8.0", level: "Very good — sai sót không hệ thống" },
    { band: "7.0", level: "Good — kiểm soát tốt, sai sót đôi chỗ" },
    { band: "6.5", level: "Competent — đủ học đại học (mục tiêu của bạn ✓)" },
    { band: "6.0", level: "Competent — sai sót nhưng truyền đạt được" },
    { band: "5.0", level: "Modest — hiểu/diễn đạt một phần" },
  ],
  testFormats: [
    {
      type: "Academic",
      purpose: "Du học đại học, đăng ký nghề (bác sĩ, kế toán)",
      diffs: "Reading + Writing dùng đề học thuật. Listening + Speaking giống GT.",
    },
    {
      type: "General Training",
      purpose: "Định cư (Úc, NZ, Canada, UK), làm việc, học nghề",
      diffs: "Reading dễ hơn (đời sống + công việc). Writing Task 1 là viết thư.",
    },
  ],
};
