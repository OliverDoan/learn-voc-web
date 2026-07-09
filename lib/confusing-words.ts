// Nội dung tĩnh: các cặp từ / từ dễ nhầm lẫn (confusing words).
// Không cần DB — thêm cặp mới chỉ việc bổ sung vào CONFUSING_ENTRIES.

export interface ConfusingExample {
  en: string;
  vi: string;
}

/** Một "vế" trong cặp từ — thường có 2 vế, đôi khi 1 (ghi chú riêng lẻ). */
export interface ConfusingTerm {
  word: string;
  /** Nghĩa / cách dùng ngắn gọn. */
  note: string;
  examples: ConfusingExample[];
}

export interface ConfusingEntry {
  id: string;
  icon: string; // emoji gợi nhớ
  terms: ConfusingTerm[];
  /** Điểm khác nhau cốt lõi — câu chốt để nhớ nhanh. */
  difference: string;
  /** Mẹo nhớ ngắn (tuỳ chọn). */
  tip?: string;
}

export const CONFUSING_ENTRIES: ConfusingEntry[] = [
  {
    id: "nowadays",
    icon: "📅",
    difference: "Trạng từ cố định, LUÔN có -s. Không có dạng “nowaday”.",
    tip: "Nghĩa = “these days / hiện nay”. Viết sai phổ biến: ❌ nowaday → ✅ nowadays.",
    terms: [
      {
        word: "nowadays",
        note: "Ngày nay, hiện nay (trạng từ).",
        examples: [
          { en: "Nowadays, most people shop online.", vi: "Ngày nay, hầu hết mọi người mua sắm online." },
          { en: "Kids spend a lot of time on phones nowadays.", vi: "Bọn trẻ dành nhiều thời gian dùng điện thoại thời nay." },
        ],
      },
    ],
  },
  {
    id: "excited-exciting",
    icon: "🎢",
    difference: "-ed = NGƯỜI cảm thấy; -ing = SỰ VẬT/VIỆC gây ra cảm giác đó.",
    tip: "Áp dụng cho mọi tính từ cảm xúc: bored/boring, tired/tiring, interested/interesting…",
    terms: [
      {
        word: "excited",
        note: "Người cảm thấy háo hức, phấn khích.",
        examples: [
          { en: "I'm so excited about the trip.", vi: "Tôi rất háo hức về chuyến đi." },
          { en: "The children were excited to open their gifts.", vi: "Bọn trẻ háo hức mở quà." },
        ],
      },
      {
        word: "exciting",
        note: "Sự việc/thứ gì đó gây phấn khích, thú vị.",
        examples: [
          { en: "The trip was really exciting.", vi: "Chuyến đi thật sự thú vị." },
          { en: "It's an exciting movie.", vi: "Đó là một bộ phim hấp dẫn." },
        ],
      },
    ],
  },
  {
    id: "book-reservation",
    icon: "🍽️",
    difference: "book = ĐỘNG TỪ (hành động đặt); reservation = DANH TỪ (sự/chỗ đã đặt).",
    tip: "“make a reservation” ≈ “book”. To book → a reservation.",
    terms: [
      {
        word: "book",
        note: "Đặt (chỗ, bàn, vé…) — động từ.",
        examples: [
          { en: "I booked a table for two.", vi: "Tôi đã đặt bàn cho hai người." },
          { en: "Have you booked the flight yet?", vi: "Bạn đặt vé máy bay chưa?" },
        ],
      },
      {
        word: "reservation",
        note: "Sự đặt chỗ, chỗ đã được giữ — danh từ.",
        examples: [
          { en: "I have a reservation under the name Nam.", vi: "Tôi có đặt chỗ dưới tên Nam." },
          { en: "Do you take reservations?", vi: "Nhà hàng có nhận đặt chỗ trước không?" },
        ],
      },
    ],
  },
  {
    id: "chance-opportunity",
    icon: "🎯",
    difference: "chance = cơ hội TÌNH CỜ / may rủi; opportunity = cơ hội TỐT, có chủ đích.",
    tip: "by chance = tình cờ. a great opportunity = cơ hội quý (chủ động nắm bắt).",
    terms: [
      {
        word: "chance",
        note: "Cơ hội đến tình cờ, yếu tố may rủi.",
        examples: [
          { en: "I met her by chance at the station.", vi: "Tôi tình cờ gặp cô ấy ở nhà ga." },
          { en: "There's a chance it will rain today.", vi: "Có khả năng hôm nay trời mưa." },
        ],
      },
      {
        word: "opportunity",
        note: "Cơ hội tốt, thuận lợi, thường chính thức.",
        examples: [
          { en: "This job is a great opportunity for me.", vi: "Công việc này là cơ hội tuyệt vời cho tôi." },
          { en: "Studying abroad is a good opportunity to learn.", vi: "Du học là cơ hội tốt để học hỏi." },
        ],
      },
    ],
  },
  {
    id: "stay-holiday",
    icon: "🏖️",
    difference: "stay = KHOẢNG THỜI GIAN ở (tại khách sạn, nơi nào đó); holiday = KỲ NGHỈ.",
    tip: "Enjoy your stay = chúc lưu trú vui vẻ. On holiday = đang đi nghỉ.",
    terms: [
      {
        word: "stay",
        note: "Thời gian ở lại một nơi.",
        examples: [
          { en: "Enjoy your stay at our hotel!", vi: "Chúc bạn có kỳ lưu trú vui vẻ tại khách sạn!" },
          { en: "It was a short two-night stay.", vi: "Đó là kỳ ở lại ngắn hai đêm." },
        ],
      },
      {
        word: "holiday",
        note: "Kỳ nghỉ (nghỉ lễ, nghỉ mát).",
        examples: [
          { en: "We went to Da Nang on holiday.", vi: "Chúng tôi đi Đà Nẵng nghỉ mát." },
          { en: "The summer holiday starts in June.", vi: "Kỳ nghỉ hè bắt đầu vào tháng Sáu." },
        ],
      },
    ],
  },
  {
    id: "offer-offering",
    icon: "🎁",
    difference: "offer = LỜI đề nghị/mời; offering = THỨ được cung cấp (sản phẩm, dịch vụ).",
    tip: "make an offer = đưa ra lời mời. the offerings = các món/dịch vụ nhà hàng, cửa hàng cung cấp.",
    terms: [
      {
        word: "offer",
        note: "Lời đề nghị, lời mời (danh từ) / đề nghị, mời (động từ).",
        examples: [
          { en: "They made me a job offer.", vi: "Họ đưa cho tôi lời mời làm việc." },
          { en: "Can I offer you a drink?", vi: "Tôi mời bạn một ly nước nhé?" },
        ],
      },
      {
        word: "offering",
        note: "Sản phẩm / dịch vụ được cung cấp.",
        examples: [
          { en: "The café's coffee offerings are excellent.", vi: "Các loại cà phê quán phục vụ rất tuyệt." },
          { en: "The company expanded its product offerings.", vi: "Công ty mở rộng danh mục sản phẩm cung cấp." },
        ],
      },
    ],
  },
  {
    id: "change-exchange",
    icon: "🔄",
    difference: "change = THAY ĐỔI / đổi khác (một chiều); exchange = TRAO ĐỔI qua lại (hai chiều).",
    tip: "change your mind = đổi ý. exchange gifts = trao đổi quà (mỗi bên đưa & nhận).",
    terms: [
      {
        word: "change",
        note: "Thay đổi, đổi sang cái khác.",
        examples: [
          { en: "I need to change my clothes.", vi: "Tôi cần thay quần áo." },
          { en: "The weather changed quickly.", vi: "Thời tiết thay đổi nhanh chóng." },
        ],
      },
      {
        word: "exchange",
        note: "Trao đổi hai chiều (đưa và nhận lại).",
        examples: [
          { en: "We exchanged gifts at Christmas.", vi: "Chúng tôi trao đổi quà vào dịp Giáng sinh." },
          { en: "Where can I exchange money?", vi: "Tôi có thể đổi tiền ở đâu?" },
        ],
      },
    ],
  },
  {
    id: "normal-common",
    icon: "📊",
    difference: "normal = BÌNH THƯỜNG, đúng mức chuẩn; common = PHỔ BIẾN, gặp nhiều.",
    tip: "It's normal = chuyện thường tình. It's common = xảy ra/gặp thường xuyên.",
    terms: [
      {
        word: "normal",
        note: "Bình thường, đúng lẽ thường, không bất thường.",
        examples: [
          { en: "It's normal to feel nervous before an exam.", vi: "Lo lắng trước kỳ thi là chuyện bình thường." },
          { en: "His temperature is back to normal.", vi: "Nhiệt độ của anh ấy đã trở lại bình thường." },
        ],
      },
      {
        word: "common",
        note: "Phổ biến, xuất hiện/gặp nhiều.",
        examples: [
          { en: "Smith is a common surname in England.", vi: "Smith là họ phổ biến ở Anh." },
          { en: "Colds are common in winter.", vi: "Cảm lạnh rất thường gặp vào mùa đông." },
        ],
      },
    ],
  },
];
