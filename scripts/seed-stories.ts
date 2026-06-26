import { PrismaClient } from "@prisma/client";
import { extractWords } from "../lib/story-parser";

const prisma = new PrismaClient();

// Mỗi truyện dùng ĐÚNG card.word trong markup [[word|nghĩa]] để link đủ thẻ.
// Unit 10 trở đi nối tiếp mạch truyện ngôi thứ nhất "tôi" & bạn gái (xuyên suốt Unit 1–9):
// căn hộ mới → khu phố → du lịch → tham quan → đám cưới/lễ hội → khác biệt
// văn hoá → thời tiết quê chồng. Giữ nguyên đủ 24 từ/unit, câu đơn giản dễ học.
//
// MẸO HỌC: các từ tiếng Anh liên quan được đặt CẠNH NHAU theo trật tự tiếng Anh
// (tính từ + danh từ) để tạo thành cụm collocation đọc liền — học 1 lần được 2–3 từ.
const STORIES: Array<{ deckName: string; title: string; content: string }> = [
  {
    deckName: "Unit 10:",
    title: "Khu phố mới của tôi và bạn gái",
    content: `Ở căn hộ mới, một người hàng xóm [[friendly|thân thiện]] sang [[inform|thông báo]] rồi [[invite|mời]] tôi và bạn gái sang chơi. Khu này là một [[safe|an toàn]], [[vibrant|sôi động]] [[area|khu vực]] vừa mới [[develop|phát triển]] — cả một [[block|khu nhà]] khang trang.

Đường vào là một [[complicated|phức tạp]] [[one-way|một chiều]] nhỏ, nhưng [[mostly|hầu hết]] dễ đi. Sát mặt [[ground|mặt đất]] có một [[clinic|phòng khám]] và một [[gym|phòng tập thể hình]].

Buổi tối không [[noisy|ồn ào]], [[always|luôn luôn]] giữ một [[chilled|thư giãn]] [[vibe|bầu không khí]]. Căn hộ là một [[comfy|dễ chịu]], [[cosy|ấm cúng]] [[property|tài sản]] đầu tiên của hai người.

Phía dưới có [[playground|sân chơi]] và [[pool|bể bơi]]; cây xanh [[everywhere|khắp mọi nơi]]. Tôi — biệt danh Sunny — mỉm cười.`,
  },
  {
    deckName: "Unit 11:",
    title: "Chuyến du lịch đầu tiên của hai người",
    content: `Quen nơi ở mới rồi, chúng tôi muốn đi xa. [[nowadays|ngày nay]], [[travelling|du lịch]] dễ hơn nhiều; tôi và bạn gái rất [[excited|hào hứng]] chọn một [[huge|khổng lồ]] [[destination|điểm đến]] mới, xin [[visa|thị thực]] và đặt [[reservation|sự đặt chỗ]].

Một [[flight|chuyến bay]] [[delay|trì hoãn]] khiến cô ấy [[disappointed|thất vọng]], nhưng đó là một phần của [[journey|cuộc hành trình]] — một [[chance|cơ hội]] để [[escape|thoát khỏi]] công việc.

Tại [[reception|quầy tiếp tân]], kì [[stay|kì nghỉ ở đây]] là một [[amazing|tuyệt vời]] [[experience|trải nghiệm]]; mỗi ngày là một [[adventure|cuộc phiêu lưu]] để [[discover|khám phá]].

Họ đi một [[tour|chuyến tham quan]] cùng nhiều [[tourist|khách du lịch]] khác. Mỗi [[moment|khoảnh khắc]] thành một [[memory|kỉ niệm]] đẹp; cô ấy gửi một [[postcard|bưu thiếp]] về cho gia đình.`,
  },
  {
    deckName: "Unit 12:",
    title: "Một ngày tham quan cùng nhau",
    content: `Trong chuyến đi ấy, tôi và bạn gái dành một ngày [[leisure|thời gian rảnh]] đi [[sightseeing|ngắm cảnh]] cùng một [[local|địa phương]] [[guide|hướng dẫn viên]]. Anh chọn một [[route|tuyến đường]] giàu [[history|lịch sử]].

Họ thăm một [[mausoleum|lăng tẩm]], các [[church|nhà thờ]], [[temple|đền]], [[pagoda|chùa]] cổ và một bảo tàng [[war|chiến tranh]]. Vài nơi [[touristy|đông khách du lịch]], nhưng có góc [[hidden|bị ẩn giấu]], [[lovely|đáng yêu]] cho các [[lover|tình nhân]].

Hướng dẫn viên [[recommend|gợi ý]] họ [[try|thử]] và [[taste|nếm thử]] món ăn ở khu [[market|chợ]] — một [[option|sự lựa chọn]] tuyệt vời.

Chỗ nghỉ có nhiều kiểu: một [[resort|khu nghỉ dưỡng]], một [[campsite|khu cắm trại]], hay một [[homestay|dịch vụ nghỉ tại nhà dân]]. Sáng hôm sau, hai người cùng [[hike|đi bộ đường dài]].`,
  },
  {
    deckName: "Unit 13:",
    title: "Mùa cưới và lễ hội",
    content: `Trở về sau chuyến đi, chúng tôi gặp đúng mùa lễ hội. [[generally|nhìn chung]], người Việt rất thích [[celebration|sự ăn mừng]]; mỗi [[occasion|dịp đặc biệt]] là một lần sum họp.

Một [[wedding|lễ cưới]] có rất nhiều [[guest|khách]] và [[relative|họ hàng]]. Mọi người nói [[congratulations|chúc mừng]], [[welcome|hoan nghênh]] cô dâu chú rể, mở một [[party|tiệc tùng]] lớn chúc [[luck|vận may]].

Đúng dịp [[national|toàn quốc]] [[festival|lễ hội]], phố treo [[lantern|đèn lồng]] và bắn [[firework|pháo hoa]]. Người ta [[pray|cầu nguyện]], dâng [[offering|lễ vật]]; một [[priest|linh mục]] chúc [[peace|sự bình yên]] nơi [[public|công chúng]].

Trước [[holiday|ngày lễ]], tôi và bạn gái [[tidy|dọn dẹp]] nhà, [[exchange|trao đổi]] quà cho [[loved one|người thân yêu]] — cũng là [[anniversary|ngày kỉ niệm]] ngày hai người quen nhau.`,
  },
  {
    deckName: "Unit 14:",
    title: "Khác biệt văn hoá của tôi và bạn gái",
    content: `Mùa lễ ấy khiến tôi và bạn gái nghĩ về [[difference|sự khác biệt]] văn hoá: điều [[normal|bình thường]] nơi này có thể [[strange|kì lạ]] nơi khác, nên cần [[respect|tôn trọng]] và [[fair|công bằng]].

Bàn đến [[marriage|hôn nhân]], hai nhà [[expect|mong đợi]] nhiều; có [[rule|quy tắc]] và [[taboo|điều cấm kỵ]] phải [[avoid|tránh]]. Nếu chưa [[familiar|quen thuộc]], dễ làm ai đó [[angry|tức giận]] mà không [[mean|có ý định]].

Tôi [[proud|tự hào]] nét [[traditional|truyền thống]]: gia đình theo [[religion|tôn giáo]], là [[Buddhist|Phật tử]], có bàn [[shrine|miếu thờ]] bên cây [[pillar|cột nhà]] chạm khắc; họ [[believe|tin tưởng]] vào sự [[care|quan tâm]].

Đừng cố [[control|điều khiển]] hay [[persuade|thuyết phục]] ai đổi thay; cởi mở rồi văn hoá mới sẽ [[surprise|làm bất ngờ]] bạn theo cách dễ chịu.`,
  },
  {
    deckName: "Unit 15:",
    title: "Bạn gái và thời tiết quê tôi",
    content: `Sống cùng nhau, tôi kể cho bạn gái nghe về [[climate|khí hậu]] Việt Nam có hai [[season|mùa]] rõ rệt. Vào [[beginning|sự khởi đầu]] mùa hè, trời [[sunny|nhiều nắng]] và [[humid|ẩm]] — thời tiết [[typical|điển hình]].

[[forecast|dự báo]] báo [[temperature|nhiệt độ]] tới 35 độ [[Celsius|độ C]], nhưng một [[pleasant|dễ chịu]] [[breeze|cơn gió nhẹ]] buổi chiều làm dịu đi.

Mùa [[rainy|nhiều mưa]] thì khác: có khi chỉ [[drizzle|mưa phùn]], có khi [[shower|mưa rào]] lớn. [[cloud|đám mây]] đen [[approach|tiếp cận]], trời [[nasty|gây khó chịu]] và [[awful|kinh khủng]].

Vào [[middle|giữa]] mùa, một [[typhoon|bão nhiệt đới]] gây [[flood|lũ lụt]], mưa [[last|kéo dài]] cả một [[period|khoảng thời gian]] dài. Đến [[end|sự kết thúc]] mùa trời lại quang đãng; tôi và cô ấy ngồi bên nhau, ấm cúng.`,
  },
  {
    deckName: "Unit 16",
    title: "Bữa tối tôi và bạn gái cùng nấu",
    content: `Chuyện bếp núc cũng vui. Cuối tuần, tôi và bạn gái cùng [[prepare|chuẩn bị]] bữa tối. Chúng tôi mua [[groceries|thực phẩm tạp hóa]] gồm [[beef|thịt bò]], [[pork|thịt lợn]] và [[bacon|thịt ba chỉ xông khói]].

Trên [[stove|bếp]], tôi [[boil|luộc]] rau, [[grill|nướng]] thịt cho [[crispy|giòn]] và [[stir-fry|xào]] với [[chilli|ớt]] thật [[spicy|cay]]. Cô ấy nấu một nồi [[hotpot|lẩu]] và một bát [[soup|canh]] nóng.

Món có đủ vị [[sweet|ngọt]], [[savoury|đậm đà]] nhờ [[sauce|nước sốt]] đặc biệt — không quá [[oily|nhiều dầu mỡ]] cũng không [[dry|khô]]. Cô ấy vốn [[vegetarian|ăn chay]] nên làm thêm phần rau riêng.

Tôi đói đến mức [[hangry|cáu vì đói]], [[stomach|dạ dày]] kêu òng ọc. Khi cô ấy [[serve|phục vụ]] món lên, mọi thứ thật [[yummy|ngon]]!`,
  },
  {
    deckName: "Unit 17",
    title: "Một tối ở quán và bài học detox",
    content: `Không chỉ nấu ở nhà — một tối, tôi và bạn gái ghé [[pub|quán rượu]] cùng bạn bè; tôi khá [[thirsty|khát nước]]. Chúng tôi gọi vài [[bottle|chai]] [[beer|bia]] và một [[glass|cốc thủy tinh]] [[wine|rượu vang]].

Một người bạn [[pour|rót]] rượu, hô "[[cheers|chúc mừng]]!" rồi uống một [[shot|chén rượu nhỏ]]. [[drinking|việc uống rượu]] nhiều khiến ai cũng [[tipsy|ngà ngà say]]; quá nhiều [[alcohol|cồn]] thật [[useless|vô dụng]].

Sáng hôm sau, tôi bị [[hangover|dư âm sau cơn say]], thiếu [[energy|năng lượng]]. Cô ấy pha cho tôi ly [[coffee|cà phê]] có chút [[cream|kem sữa]] và một [[smoothie|sinh tố]] mát.

Để [[detox|thải độc]], cô ấy [[stir|khuấy]] một [[litre|lít]] nước [[sparkling|có ga]] với chanh, đổ đầy một [[bucket|xô]] đá. Tôi quyết bỏ [[habit|thói quen]] uống nhiều.`,
  },
  {
    deckName: "Unit 18",
    title: "Tôi tập nấu theo công thức",
    content: `Sau hôm ở quán, tôi tập [[cooking|nấu ăn]] tại nhà theo một [[recipe|công thức]] [[secret|bí mật]] của mẹ. Bí quyết là [[seasoning|gia vị]]: [[add|thêm]] một chút để [[flavour|hương vị]] đậm hơn.

Lần đầu thật [[terrible|tồi tệ]]: món [[plain|nhạt]] quá hoặc mùi [[strong|nồng]] quá, [[seafood|hải sản]] còn [[raw|sống]] và [[undercooked|chưa nấu chín]]. Tôi quên dùng đồ [[fresh|tươi]] mà lấy đồ [[frozen|đông lạnh]].

Bạn gái — như một [[chef|đầu bếp]] thật sự — [[roast|nướng]] thịt, vắt [[lemon|chanh vàng]], khiến món trở nên [[delicious|ngon miệng]] và [[tasty|ngon]]. Chúng tôi ăn bằng [[chopstick|đũa]].

Vì [[hunger|cơn đói]], chúng tôi ăn sạch, chẳng còn [[leftovers|đồ ăn thừa]]. Hôm bận thì gọi [[takeaway|đồ ăn mang đi]] — nền [[cuisine|ẩm thực]] Việt có quá nhiều món ngon.`,
  },
  {
    deckName: "Unit 19",
    title: "Chuyển sang ăn uống lành mạnh",
    content: `Ăn ngoài nhiều nên chúng tôi quyết định [[follow|tuân theo]] một [[diet|chế độ ăn]] [[strict|nghiêm ngặt]] hơn để [[stay|giữ]] khoẻ. Đồ ăn nhanh nhiều [[sugar|đường]] vừa [[crappy|tồi tệ]] vừa [[tiring|gây mệt mỏi]].

Bạn gái tôi đọc kỹ từng [[ingredient|nguyên liệu]] và [[amount|lượng]] calo. Đồ [[home-cooked|nấu tại nhà]] [[efficient|hiệu quả]] và [[useful|hữu ích]] hơn, lại nhiều [[benefit|lợi ích]] — kể cả chống [[ageing|sự lão hóa]].

Tôi [[allergic|bị dị ứng]] với [[peanut|đậu phộng]] nên phải tránh; thay vào đó ăn [[snack|ăn vặt]] lành mạnh và tập [[breathe|hít thở]] sâu.

Cô ấy [[mix|trộn]] nhiều loại [[crop|cây trồng]] cho đủ [[variety|sự đa dạng]]: [[pea|đậu Hà Lan]], rau [[leaf|lá]] xanh, và nhớ [[peel|gọt vỏ]] sạch trước khi ăn.`,
  },
  {
    deckName: "Unit 20",
    title: "Khu vườn rau trái sau nhà",
    content: `Để ăn sạch, sau nhà chúng tôi [[plant|trồng]] một vườn nhỏ và chờ ngày [[harvest|thu hoạch]]. Vài hạt đã [[sprout|nảy mầm]]: [[cabbage|bắp cải]], [[lettuce|rau xà lách]], [[onion|hành tây]] và [[mushroom|nấm]].

Bạn gái tôi trồng thêm [[herb|rau thơm]] như [[basil|húng quế]]. Cô ấy [[slice|thái lát]] rau bỏ vào một [[bowl|bát]] lớn, và [[pickle|muối chua]] vài quả [[cucumber|dưa chuột]].

Cây trái rất [[juicy|mọng nước]]: [[grapefruit|bưởi]], [[mandarin|quýt]], [[kumquat|quả quất]] hơi [[sour|chua]], cùng [[durian|sầu riêng]], [[jackfruit|mít]] và [[mangosteen|măng cụt]].

Tôi thích nho [[seedless|không hạt]] và vài quả [[olive|ô liu]]. Phải ăn sớm kẻo trái cây [[spoil|bị hỏng]].`,
  },
];

async function main() {
  for (const { deckName, title, content } of STORIES) {
    // Khớp deck theo tiền tố tên đầy đủ, ví dụ "Unit 10:" → "Unit 10: Khu phố mới"
    const deck = await prisma.deck.findFirst({
      where: { name: { startsWith: deckName } },
    });
    if (!deck) {
      console.warn(`⚠️  Không tìm thấy deck "${deckName}"`);
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

    const existing = await prisma.story.findFirst({ where: { deckId: deck.id } });
    if (existing) {
      // Cập nhật truyện đã có: thay nội dung/tiêu đề và dựng lại liên kết thẻ
      await prisma.$transaction([
        prisma.storyCard.deleteMany({ where: { storyId: existing.id } }),
        prisma.story.update({
          where: { id: existing.id },
          data: { title, content, storyCards: { create: links } },
        }),
      ]);
    } else {
      await prisma.story.create({
        data: { deckId: deck.id, title, content, storyCards: { create: links } },
      });
    }

    // Đồng bộ thứ tự thẻ trong deck theo thứ tự xuất hiện trong truyện:
    // thẻ có trong truyện xếp trước (theo trật tự chêm), thẻ còn lại xếp sau.
    const orderedCardIds = [
      ...links.map((l) => l.cardId),
      ...cards.map((c) => c.id).filter((id) => !links.some((l) => l.cardId === id)),
    ];
    await prisma.$transaction(
      orderedCardIds.map((id, index) =>
        prisma.card.update({ where: { id }, data: { order: index } }),
      ),
    );

    console.log(
      `✅ "${deckName}" → "${title}": link ${links.length}/${cards.length} thẻ` +
        (existing ? " (cập nhật)" : " (tạo mới)") +
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
