import { PrismaClient } from "@prisma/client";
import { extractWords } from "../lib/story-parser";

const prisma = new PrismaClient();

// Mỗi truyện dùng ĐÚNG card.word trong markup [[word|nghĩa]] để link đủ thẻ.
// Ưu tiên: ngắn gọn, đủ từ (cover cả 24 từ/unit), câu đơn giản dễ học.
const STORIES: Array<{ deckName: string; title: string; content: string }> = [
  {
    deckName: "Unit 10",
    title: "Khu phố mới",
    content: `Bạn tôi [[inform|thông báo]] rằng cô ấy vừa mua một căn hộ trong một [[block|khu nhà]] mới [[develop|phát triển]]. Đây là một [[area|khu vực]] rất [[safe|an toàn]] và [[vibrant|sôi động]], với những người hàng xóm [[friendly|thân thiện]]. Cô ấy [[invite|mời]] tôi đến chơi.

Đường vào hơi [[complicated|phức tạp]] vì có một con đường [[one-way|một chiều]], nhưng [[mostly|hầu hết]] là dễ đi. Ngay tầng trệt trên mặt [[ground|mặt đất]] có một [[clinic|phòng khám]] và một [[gym|phòng tập thể hình]].

Buổi tối khu này không [[noisy|ồn ào]], [[always|luôn luôn]] mang [[vibe|bầu không khí]] [[chilled|thư giãn]]. Căn hộ — [[property|tài sản]] mới của cô ấy — vừa [[comfy|dễ chịu]] vừa [[cosy|ấm cúng]].

Cho trẻ em có [[playground|sân chơi]] và một [[pool|bể bơi]]. Cây xanh ở [[everywhere|khắp mọi nơi]]. Tôi nghĩ đây là nơi tuyệt vời để sống.`,
  },
  {
    deckName: "Unit 11",
    title: "Chuyến du lịch đầu tiên",
    content: `[[nowadays|ngày nay]], [[travelling|du lịch]] trở nên dễ dàng hơn. Tôi rất [[excited|hào hứng]] khi chọn được một [[destination|điểm đến]] mới cho kì nghỉ. Tôi xin [[visa|thị thực]] và đặt một [[reservation|sự đặt chỗ]] khách sạn.

[[flight|chuyến bay]] bị [[delay|sự trì hoãn]] hai tiếng nên tôi hơi [[disappointed|thất vọng]], nhưng đó cũng là một phần của [[journey|cuộc hành trình]]. Đây là [[chance|cơ hội]] để [[escape|thoát khỏi]] công việc bận rộn.

Tại [[reception|quầy tiếp tân]], người ta chào tôi thân thiện. Kì [[stay|quãng thời gian ở đây]] của tôi là một [[experience|trải nghiệm]] [[amazing|đáng kinh ngạc]]. Mỗi ngày là một [[adventure|cuộc phiêu lưu]] để [[discover|khám phá]] điều mới.

Tôi tham gia một [[tour|chuyến tham quan]] cùng nhiều [[tourist|khách du lịch]] khác. Thành phố [[huge|khổng lồ]] này khiến mỗi [[moment|khoảnh khắc]] đều đẹp. Tôi gửi một [[postcard|bưu thiếp]] về nhà để lưu giữ [[memory|kỉ niệm]] này.`,
  },
  {
    deckName: "Unit 12",
    title: "Một ngày tham quan",
    content: `Cuối tuần tôi đi [[sightseeing|ngắm cảnh]] cùng một [[guide|hướng dẫn viên]] địa phương. Anh ấy chọn một [[route|tuyến đường]] đẹp, đi qua nhiều nơi giàu [[history|lịch sử]].

Chúng tôi thăm một [[mausoleum|lăng tẩm]], một ngôi [[church|nhà thờ]] cổ, một [[temple|đền]] và một [[pagoda|chùa]] yên tĩnh. Có cả một bảo tàng [[war|chiến tranh]]. Vài nơi quá [[touristy|đông khách du lịch]], nhưng cũng có góc [[hidden|bị ẩn giấu]] rất [[lovely|đáng yêu]] cho các cặp [[lover|tình nhân]].

Hướng dẫn viên [[recommend|gợi ý]] tôi [[try|thử]] và [[taste|nếm thử]] món ăn [[local|địa phương]] ở khu [[market|chợ]]. Đó là [[option|sự lựa chọn]] tuyệt vời cho thời gian [[leisure|thời gian rảnh]].

Để nghỉ ngơi, bạn có nhiều lựa chọn: một [[resort|khu nghỉ dưỡng]] sang trọng, một [[campsite|khu cắm trại]] gần rừng, hay một [[homestay|dịch vụ nghỉ tại nhà dân]] ấm cúng. Sáng hôm sau, chúng tôi cùng [[hike|đi bộ đường dài]] lên núi.`,
  },
  {
    deckName: "Unit 13",
    title: "Mùa lễ hội",
    content: `[[generally|nhìn chung]], người Việt rất thích các [[celebration|sự ăn mừng]]. Vào mỗi [[occasion|dịp đặc biệt]], gia đình sum họp.

Trong một [[wedding|lễ cưới]], nhiều [[guest|khách]] và [[relative|họ hàng]] đến chung vui. Mọi người nói [[congratulations|chúc mừng]] và [[welcome|hoan nghênh]] cô dâu chú rể. Một bữa [[party|tiệc tùng]] lớn được tổ chức để chúc [[luck|vận may]].

Vào dịp [[festival|lễ hội]] [[national|toàn quốc]], đường phố treo [[lantern|đèn lồng]]. Người ta [[pray|cầu nguyện]] và chuẩn bị [[offering|lễ vật]]. Vị [[priest|linh mục]] đọc lời chúc [[peace|sự bình yên]]. Buổi tối có [[firework|pháo hoa]] ở nơi [[public|công chúng]].

Trước [[holiday|ngày lễ]], cả nhà cùng [[tidy|dọn dẹp]] nhà cửa. Mọi người [[exchange|trao đổi]] quà cho [[loved one|người thân yêu]]. Đó cũng là [[anniversary|ngày kỉ niệm]] đáng nhớ của gia đình.`,
  },
  {
    deckName: "Unit 14",
    title: "Khác biệt văn hoá",
    content: `Mỗi nền văn hoá có [[difference|sự khác biệt]] riêng. Điều [[normal|bình thường]] ở nước này có thể [[strange|kì lạ]] ở nước khác, vì vậy ta cần [[respect|tôn trọng]] lẫn nhau.

Trong [[marriage|hôn nhân]], hai gia đình thường [[expect|mong đợi]] nhiều điều. Có những [[rule|quy tắc]] và cả [[taboo|điều cấm kỵ]] mà ta nên [[avoid|tránh]]. Nếu không [[familiar|quen thuộc]], bạn có thể làm ai đó [[angry|tức giận]] mà không [[mean|có ý định]] điều đó.

Người Việt [[proud|tự hào]] về nét [[traditional|truyền thống]]. Nhiều người theo [[religion|tôn giáo]], là [[Buddhist|Phật tử]], có bàn [[shrine|miếu thờ]] trong nhà bên cây [[pillar|cột nhà]] chạm khắc đẹp. Họ [[believe|tin tưởng]] vào sự tử tế và [[care|sự quan tâm]].

Đừng cố [[control|điều khiển]] hay [[persuade|thuyết phục]] người khác thay đổi. Hãy [[fair|công bằng]] và cởi mở — điều đó sẽ [[surprise|làm bất ngờ]] bạn theo cách tích cực.`,
  },
  {
    deckName: "Unit 15",
    title: "Thời tiết quê tôi",
    content: `Việt Nam có [[climate|khí hậu]] nhiệt đới với hai [[season|mùa]] rõ rệt. Vào [[beginning|sự khởi đầu]] mùa hè, trời thường [[sunny|nhiều nắng]] và [[humid|ẩm]].

[[forecast|dự báo]] thời tiết nói rằng [[temperature|nhiệt độ]] có thể lên tới 35 độ [[Celsius|độ C]]. Một cơn [[breeze|cơn gió nhẹ]] buổi chiều khiến mọi thứ [[pleasant|dễ chịu]] hơn. Đó là kiểu thời tiết [[typical|điển hình]].

Mùa [[rainy|nhiều mưa]] thì khác. Đôi khi chỉ là [[drizzle|mưa phùn]] nhẹ, nhưng đôi khi một cơn [[shower|mưa rào]] lớn [[approach|tiếp cận]] rất nhanh. [[cloud|đám mây]] đen kéo đến, và thời tiết trở nên [[nasty|gây khó chịu]].

Vào [[middle|giữa]] mùa, một cơn [[typhoon|bão nhiệt đới]] có thể gây [[flood|lũ lụt]]. Thật [[awful|kinh khủng]]! Mưa có thể [[last|kéo dài]] cả một [[period|khoảng thời gian]] dài. Đến [[end|sự kết thúc]] mùa, trời lại quang đãng.`,
  },
];

async function main() {
  for (const { deckName, title, content } of STORIES) {
    const deck = await prisma.deck.findFirst({ where: { name: deckName } });
    if (!deck) {
      console.warn(`⚠️  Không tìm thấy deck "${deckName}"`);
      continue;
    }

    const existing = await prisma.story.count({ where: { deckId: deck.id } });
    if (existing > 0) {
      console.log(`⏭️  "${deckName}" đã có truyện — bỏ qua`);
      continue;
    }

    const cards = await prisma.card.findMany({ where: { deckId: deck.id } });
    const wordToCard = new Map(cards.map((c) => [c.word.trim().toLowerCase(), c.id]));

    const tokens = extractWords(content);
    const links = tokens
      .map((t, idx) => {
        const cardId = wordToCard.get(t.word.toLowerCase());
        return cardId ? { cardId, order: idx } : null;
      })
      .filter((x): x is { cardId: string; order: number } => x !== null)
      .filter((x, idx, arr) => arr.findIndex((y) => y.cardId === x.cardId) === idx);

    // Cảnh báo nếu còn thẻ chưa được chêm vào truyện
    const usedWords = new Set(tokens.map((t) => t.word.toLowerCase()));
    const missing = cards.filter((c) => !usedWords.has(c.word.trim().toLowerCase()));
    // Cảnh báo nếu markup có từ không khớp thẻ nào
    const unmatched = tokens.filter((t) => !wordToCard.has(t.word.toLowerCase()));

    await prisma.story.create({
      data: {
        deckId: deck.id,
        title,
        content,
        storyCards: { create: links },
      },
    });

    console.log(
      `✅ "${deckName}" → "${title}": link ${links.length}/${cards.length} thẻ` +
        (missing.length ? ` | thiếu: ${missing.map((c) => c.word).join(", ")}` : "") +
        (unmatched.length ? ` | không khớp: ${unmatched.map((t) => t.word).join(", ")}` : ""),
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
