/**
 * Bổ sung ví dụ thủ công (soạn sẵn) cho 91 thẻ Unit 10–15 mà Free Dictionary
 * không có. Mỗi câu chứa CHÍNH XÁC từ vựng (dùng được cho bài gap-fill) kèm
 * bản dịch tiếng Việt. Cập nhật theo id, chỉ ghi khi thẻ đang trống ví dụ.
 *
 * Chạy: npx tsx scripts/seed-examples-manual.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Item {
  id: string;
  example: string;
  exampleTranslation: string;
}

const ITEMS: Item[] = [
  // Unit 10
  { id: "cmqhiwput0002o9zkkuebg0bg", example: "Please inform me if the meeting time changes tomorrow.", exampleTranslation: "Hãy thông báo cho tôi nếu giờ họp thay đổi vào ngày mai." },
  { id: "cmqhiwpv1000ko9zkxmcqlgys", example: "She works as a nurse at a small clinic.", exampleTranslation: "Cô ấy làm y tá tại một phòng khám nhỏ." },
  { id: "cmqhiwpv7000wo9zkul0lt526", example: "This little café has a really relaxing vibe.", exampleTranslation: "Quán cà phê nhỏ này có bầu không khí rất thư giãn." },
  { id: "cmqhiwpve0014o9zkr9vht91g", example: "Their living room feels warm and cosy in winter.", exampleTranslation: "Phòng khách của họ ấm áp và ấm cúng vào mùa đông." },
  // Unit 11
  { id: "cmqhiwpvm001fo9zka84dybcs", example: "Da Nang is a popular destination for summer holidays.", exampleTranslation: "Đà Nẵng là điểm đến nổi tiếng cho kỳ nghỉ hè." },
  { id: "cmqhiwpvo001ho9zkmu4sebw2", example: "I want to experience local food on every trip.", exampleTranslation: "Tôi muốn trải nghiệm món ăn địa phương trong mỗi chuyến đi." },
  { id: "cmqhiwpvp001jo9zkwijoixyf", example: "The children were excited about the long train trip.", exampleTranslation: "Bọn trẻ rất hào hứng về chuyến tàu dài." },
  { id: "cmqhiwpvr001lo9zklosgmw6k", example: "Our flight to Tokyo leaves early in the morning.", exampleTranslation: "Chuyến bay tới Tokyo của chúng tôi cất cánh sáng sớm." },
  { id: "cmqhiwpvt001no9zk70duq8nm", example: "That holiday gave me a wonderful memory to keep.", exampleTranslation: "Kỳ nghỉ đó cho tôi một kỉ niệm tuyệt vời để giữ." },
  { id: "cmqhiwpvu001po9zk7t0aorwu", example: "We felt disappointed when the museum was closed.", exampleTranslation: "Chúng tôi thấy thất vọng khi bảo tàng đóng cửa." },
  { id: "cmqhiwpvu001ro9zk812s68r1", example: "We enjoyed our short stay at the beach hotel.", exampleTranslation: "Chúng tôi thích quãng thời gian ngắn ở khách sạn bãi biển." },
  { id: "cmqhiwpvw001to9zkrallm1n2", example: "There was a long delay before the bus arrived.", exampleTranslation: "Có một sự trì hoãn lâu trước khi xe buýt đến." },
  { id: "cmqhiwpvx001vo9zky9hnprc0", example: "She sent me a postcard from Paris last week.", exampleTranslation: "Cô ấy gửi tôi một tấm bưu thiếp từ Paris tuần trước." },
  { id: "cmqhiwpvz001xo9zkurzkg67g", example: "Nowadays many people book their trips online.", exampleTranslation: "Ngày nay nhiều người đặt chuyến đi trực tuyến." },
  { id: "cmqhiwpw0001zo9zknmrpw7nw", example: "We love to discover new places on our travels.", exampleTranslation: "Chúng tôi thích khám phá những nơi mới khi đi du lịch." },
  { id: "cmqhiwpw10021o9zky2wgi4li", example: "The journey to the mountain took six long hours.", exampleTranslation: "Cuộc hành trình lên núi mất sáu tiếng đồng hồ." },
  { id: "cmqhiwpw30023o9zkxy72ew77", example: "I made a reservation for dinner at eight o'clock.", exampleTranslation: "Tôi đã đặt chỗ ăn tối lúc tám giờ." },
  { id: "cmqhiwpw40025o9zkvefg8vr1", example: "You need a valid visa to enter that country.", exampleTranslation: "Bạn cần thị thực hợp lệ để nhập cảnh nước đó." },
  { id: "cmqhiwpw50027o9zkyttvt4lc", example: "Please wait a moment while I find your room.", exampleTranslation: "Xin chờ một khoảnh khắc trong khi tôi tìm phòng cho bạn." },
  { id: "cmqhiwpw60029o9zkhrp2z4d6", example: "Leave your key at the reception before you go.", exampleTranslation: "Hãy để chìa khóa ở quầy tiếp tân trước khi đi." },
  { id: "cmqhiwpw6002bo9zkk276gu3u", example: "Travelling by train is comfortable and quite cheap.", exampleTranslation: "Du lịch bằng tàu hỏa thoải mái và khá rẻ." },
  { id: "cmqhiwpw8002do9zkx6x80o6i", example: "Many people travel to escape the busy city life.", exampleTranslation: "Nhiều người đi du lịch để trốn khỏi cuộc sống thành phố bận rộn." },
  { id: "cmqhiwpw9002fo9zkx4pma5yz", example: "The view from the top was simply amazing.", exampleTranslation: "Khung cảnh từ trên đỉnh thật đáng kinh ngạc." },
  { id: "cmqhiwpwa002ho9zkt61vw1j5", example: "Our trip to the jungle was a real adventure.", exampleTranslation: "Chuyến đi rừng của chúng tôi là một cuộc phiêu lưu thực sự." },
  { id: "cmqhiwpwb002jo9zkdoprwfu1", example: "The hotel had a huge swimming pool outside.", exampleTranslation: "Khách sạn có một hồ bơi khổng lồ bên ngoài." },
  { id: "cmqhiwpwc002lo9zklhtr16za", example: "Every tourist wants to take a photo here.", exampleTranslation: "Mỗi khách du lịch đều muốn chụp ảnh ở đây." },
  { id: "cmqhiwpwd002no9zkg9umfxr8", example: "This trip is a great chance to relax.", exampleTranslation: "Chuyến đi này là cơ hội tuyệt vời để thư giãn." },
  { id: "cmqhiwpwe002po9zky09qrk2e", example: "We joined a city tour on our first day.", exampleTranslation: "Chúng tôi tham gia một chuyến tham quan thành phố vào ngày đầu." },
  // Unit 12
  { id: "cmqhiwpwh002so9zk73ex3pst", example: "The bus takes a scenic route along the coast.", exampleTranslation: "Xe buýt đi theo tuyến đường ven biển đẹp như tranh." },
  { id: "cmqhiwpwi002uo9zkhkf485fu", example: "Many visitors come to see the old mausoleum daily.", exampleTranslation: "Nhiều du khách đến xem lăng tẩm cổ kính mỗi ngày." },
  { id: "cmqhiwpwk002wo9zk8in1so08", example: "This city has a long and rich history.", exampleTranslation: "Thành phố này có một lịch sử lâu đời và phong phú." },
  { id: "cmqhiwpwn002yo9zkp3q5bbv8", example: "We found a hidden beach behind the rocks.", exampleTranslation: "Chúng tôi tìm thấy một bãi biển ẩn giấu sau những tảng đá." },
  { id: "cmqhiwpwp0030o9zkm4zo59y4", example: "Our guide showed us the way to the temple.", exampleTranslation: "Hướng dẫn viên chỉ cho chúng tôi đường tới ngôi đền." },
  { id: "cmqhiwpws0032o9zka3tpby4j", example: "The old church stands in the middle of town.", exampleTranslation: "Nhà thờ cổ nằm giữa trung tâm thị trấn." },
  { id: "cmqhiwpwt0034o9zkdpxwej8d", example: "People light incense at the temple every morning.", exampleTranslation: "Người ta thắp hương tại ngôi đền mỗi sáng." },
  { id: "cmqhiwpww0036o9zk2dpe5rdb", example: "The ancient pagoda sits quietly on the green hill.", exampleTranslation: "Ngôi chùa cổ nằm yên tĩnh trên ngọn đồi xanh." },
  { id: "cmqhiwpwx0038o9zk7hn7nt9q", example: "The museum shows photos from the long war.", exampleTranslation: "Bảo tàng trưng bày những bức ảnh từ cuộc chiến tranh dài." },
  { id: "cmqhiwpwz003ao9zk8eq5cszp", example: "This area is very touristy and always crowded.", exampleTranslation: "Khu này rất đông khách du lịch và lúc nào cũng đông đúc." },
  { id: "cmqhiwpx1003co9zkh5aviwb1", example: "The young lover bought red roses for his girlfriend.", exampleTranslation: "Chàng người yêu trẻ mua hoa hồng đỏ cho bạn gái." },
  { id: "cmqhiwpxd003oo9zkz3s5603r", example: "Taking the night bus is a cheaper option.", exampleTranslation: "Đi xe buýt đêm là một sự lựa chọn rẻ hơn." },
  { id: "cmqhiwpxm003wo9zkjaq4nmjo", example: "We set up our tent at a quiet campsite.", exampleTranslation: "Chúng tôi dựng lều tại một khu cắm trại yên tĩnh." },
  { id: "cmqhiwpxn003yo9zkn5vsb0qm", example: "Staying at a homestay helped us meet local families.", exampleTranslation: "Ở homestay giúp chúng tôi gặp gỡ các gia đình địa phương." },
  { id: "cmqhiwpxo0040o9zkjjbb5xhg", example: "She reads travel books in her leisure time.", exampleTranslation: "Cô ấy đọc sách du lịch trong thời gian rảnh." },
  // Unit 13
  { id: "cmqhiwpxs0045o9zkr5neqaqh", example: "The priest welcomed everyone into the small church.", exampleTranslation: "Vị linh mục chào đón mọi người vào nhà thờ nhỏ." },
  { id: "cmqhiwpxu0049o9zkxp3jmj3s", example: "There was a big celebration after the wedding.", exampleTranslation: "Có một buổi ăn mừng lớn sau đám cưới." },
  { id: "cmqhiwpy1004no9zkcveqc9xm", example: "The spring festival brings the whole village together.", exampleTranslation: "Lễ hội mùa xuân gắn kết cả ngôi làng." },
  { id: "cmqhiwpy3004ro9zkpwtvv53n", example: "People light candles to remember a loved one.", exampleTranslation: "Người ta thắp nến để tưởng nhớ một người thân yêu." },
  { id: "cmqhiwpy4004to9zkquv7pk1w", example: "They placed fruit as an offering on the altar.", exampleTranslation: "Họ đặt trái cây làm lễ vật trên bàn thờ." },
  { id: "cmqhiwpy8004zo9zkgk8074ap", example: "Tet is the most important holiday in Vietnam.", exampleTranslation: "Tết là ngày lễ quan trọng nhất ở Việt Nam." },
  { id: "cmqhiwpy90051o9zk56px5p8a", example: "Independence Day is a national day for everyone.", exampleTranslation: "Ngày Quốc khánh là một ngày lễ toàn quốc cho mọi người." },
  { id: "cmqhiwpyb0053o9zkfm698e4d", example: "Everyone shouted congratulations to the happy couple.", exampleTranslation: "Mọi người hô vang lời chúc mừng đôi vợ chồng hạnh phúc." },
  { id: "cmqhiwpyc0055o9zkxyla4964", example: "We must tidy the house before the guests arrive.", exampleTranslation: "Chúng tôi phải dọn dẹp nhà trước khi khách đến." },
  { id: "cmqhiwpyd0057o9zkm8f0cer3", example: "The two families exchange gifts during the new year.", exampleTranslation: "Hai gia đình trao đổi quà trong dịp năm mới." },
  { id: "cmqhiwpyf0059o9zk3sq5xk5q", example: "The garden is now open to the public.", exampleTranslation: "Khu vườn giờ đã mở cửa cho công chúng." },
  { id: "cmqhiwpyh005bo9zk58m6a7mf", example: "They celebrate their wedding anniversary every single year.", exampleTranslation: "Họ tổ chức ngày kỉ niệm đám cưới mỗi năm." },
  { id: "cmqhiwpyj005do9zkq22hchbx", example: "Children carry a bright lantern during the festival.", exampleTranslation: "Trẻ em cầm một chiếc đèn lồng sáng trong lễ hội." },
  { id: "cmqhiwpyk005fo9zkhzlfzuu2", example: "The quiet temple gives me a sense of peace.", exampleTranslation: "Ngôi đền yên tĩnh cho tôi cảm giác bình yên." },
  // Unit 14
  { id: "cmqhiwpyo005io9zk2k5xsl1e", example: "A happy marriage needs trust and a lot of patience.", exampleTranslation: "Một cuộc hôn nhân hạnh phúc cần sự tin tưởng và nhiều kiên nhẫn." },
  { id: "cmqhiwpyp005ko9zk34z5g9mx", example: "My parents expect me to call them every week.", exampleTranslation: "Bố mẹ tôi mong đợi tôi gọi điện mỗi tuần." },
  { id: "cmqhiwpyq005mo9zk2hq3r8dm", example: "Every family has its own rule about meals.", exampleTranslation: "Mỗi gia đình có quy tắc riêng về bữa ăn." },
  { id: "cmqhiwpyr005oo9zkyf79mtgh", example: "She treats her old parents with great care.", exampleTranslation: "Cô ấy chăm sóc bố mẹ già với sự quan tâm lớn." },
  { id: "cmqhiwpys005qo9zk6g0yzqd7", example: "It is normal to feel nervous before a wedding.", exampleTranslation: "Cảm thấy lo lắng trước đám cưới là điều bình thường." },
  { id: "cmqhiwpyt005so9zkre0sps99", example: "Children should respect their grandparents and elders.", exampleTranslation: "Trẻ em nên tôn trọng ông bà và người lớn tuổi." },
  { id: "cmqhiwpyu005uo9zkhczp1e92", example: "The parents tried to be fair to both children.", exampleTranslation: "Bố mẹ cố gắng công bằng với cả hai đứa con." },
  { id: "cmqhiwpyv005wo9zkpcg1pqph", example: "It felt strange to live so far from home.", exampleTranslation: "Sống xa nhà như vậy cảm thấy thật kì lạ." },
  { id: "cmqhiwpyv005yo9zko3kibbls", example: "Many people believe that family always comes first.", exampleTranslation: "Nhiều người tin rằng gia đình luôn là trên hết." },
  { id: "cmqhiwpyw0060o9zk99lbggkb", example: "My father got angry when I came home late.", exampleTranslation: "Bố tôi tức giận khi tôi về nhà muộn." },
  { id: "cmqhiwpyx0062o9zkybj1hv97", example: "In some cultures, that topic is a real taboo.", exampleTranslation: "Ở một số nền văn hóa, chủ đề đó là một điều cấm kỵ thực sự." },
  { id: "cmqhiwpyz0064o9zks6q8bf60", example: "There is a big difference between the two customs.", exampleTranslation: "Có một sự khác biệt lớn giữa hai phong tục." },
  { id: "cmqhiwpz00066o9zk7g1vuww9", example: "I didn't mean to upset your whole family.", exampleTranslation: "Tôi không có ý định làm cả gia đình bạn buồn." },
  { id: "cmqhiwpz10068o9zkikv9olz0", example: "The old wooden pillar supports the family house.", exampleTranslation: "Cây cột nhà gỗ cũ chống đỡ ngôi nhà của gia đình." },
  { id: "cmqhiwpz2006ao9zkzfbzal0s", example: "Every home has a small shrine for the ancestors.", exampleTranslation: "Mỗi nhà có một miếu thờ nhỏ cho tổ tiên." },
  { id: "cmqhiwpz2006co9zk9gj1c8f1", example: "Religion plays an important part in their daily life.", exampleTranslation: "Tôn giáo đóng vai trò quan trọng trong cuộc sống hằng ngày của họ." },
  { id: "cmqhiwpz3006eo9zklxfhlenm", example: "My grandmother is a devout Buddhist.", exampleTranslation: "Bà tôi là một Phật tử mộ đạo." },
  { id: "cmqhiwpz4006go9zkc054tzs8", example: "His parents are very proud of his success.", exampleTranslation: "Bố mẹ anh ấy rất tự hào về thành công của anh." },
  { id: "cmqhiwpz6006io9zkemb0t3hc", example: "We wear traditional clothes during family festivals.", exampleTranslation: "Chúng tôi mặc trang phục truyền thống trong các lễ hội gia đình." },
  { id: "cmqhiwpz7006ko9zkq8z0s6kd", example: "They wanted to surprise their mother on her birthday.", exampleTranslation: "Họ muốn làm bất ngờ mẹ vào ngày sinh nhật bà." },
  { id: "cmqhiwpz8006mo9zktn4t92ff", example: "Parents cannot control every choice their children make.", exampleTranslation: "Bố mẹ không thể điều khiển mọi lựa chọn của con cái." },
  { id: "cmqhiwpz8006oo9zkc9hmxl51", example: "We try to avoid arguments during family dinners.", exampleTranslation: "Chúng tôi cố gắng tránh cãi vã trong bữa cơm gia đình." },
  { id: "cmqhiwpz9006qo9zk2rz41601", example: "These old customs are familiar to every villager.", exampleTranslation: "Những phong tục cũ này quen thuộc với mọi người dân làng." },
  { id: "cmqhiwpza006so9zku0dvmxv5", example: "She tried to persuade her father to agree.", exampleTranslation: "Cô ấy cố gắng thuyết phục bố mình đồng ý." },
  // Unit 15
  { id: "cmqhiwpzd006vo9zkbm2dvhd6", example: "Spring is the beginning of the farming year.", exampleTranslation: "Mùa xuân là sự khởi đầu của năm canh tác." },
  { id: "cmqhiwpze006xo9zkz8z9yafm", example: "We rarely go out on a cold, rainy day.", exampleTranslation: "Chúng tôi hiếm khi ra ngoài vào một ngày lạnh và nhiều mưa." },
  { id: "cmqhiwpzf006zo9zkalymuj26", example: "The wet season usually lasts for three months.", exampleTranslation: "Mùa mưa thường kéo dài ba tháng." },
  { id: "cmqhiwpzg0071o9zkh0u6imah", example: "Autumn brings cool and pleasant weather here.", exampleTranslation: "Mùa thu mang đến thời tiết mát mẻ và dễ chịu ở đây." },
  { id: "cmqhiwpzi0077o9zkwwi1wbn2", example: "A dark cloud covered the sun this afternoon.", exampleTranslation: "Một đám mây đen che khuất mặt trời chiều nay." },
  { id: "cmqhiwpzl007do9zkh2cdzc44", example: "We had really nasty weather during our trip.", exampleTranslation: "Chúng tôi gặp thời tiết khó chịu trong chuyến đi." },
  { id: "cmqhiwpzt007ro9zky22sy5p7", example: "Hot summers are typical in the south.", exampleTranslation: "Mùa hè nóng là điển hình ở miền nam." },
  { id: "cmqhiwpzx007xo9zkvvqccy4b", example: "The climate here is hot and humid all year.", exampleTranslation: "Khí hậu ở đây nóng và ẩm quanh năm." },
  { id: "cmqhiwpzz007zo9zkfce83usa", example: "A strong typhoon hit the coast last night.", exampleTranslation: "Một cơn bão nhiệt đới mạnh đổ bộ vào bờ biển đêm qua." },
  { id: "cmqhiwq020085o9zk5eie0243", example: "Today the temperature reached forty degrees Celsius.", exampleTranslation: "Hôm nay nhiệt độ lên tới bốn mươi độ C." },
];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  let updated = 0;
  let skipped = 0;
  let mismatch = 0;

  for (const item of ITEMS) {
    const card = await prisma.card.findUnique({ where: { id: item.id } });
    if (!card) {
      console.warn(`   • Không tìm thấy card id=${item.id}`);
      continue;
    }
    if (card.example && card.example.trim()) {
      skipped++;
      continue; // đã có ví dụ — không ghi đè
    }
    // Kiểm tra câu chứa đúng từ (an toàn cho gap-fill)
    const re = new RegExp(`\\b${escapeRegExp(card.word)}\\b`, "i");
    if (!re.test(item.example)) {
      mismatch++;
      console.warn(`   ⚠️  Câu không chứa "${card.word}": ${item.example}`);
    }
    await prisma.card.update({
      where: { id: card.id },
      data: { example: item.example, exampleTranslation: item.exampleTranslation },
    });
    updated++;
  }

  console.log(
    `\n✅ Đã cập nhật ${updated} thẻ, bỏ qua ${skipped} (đã có ví dụ)` +
      (mismatch ? `, ${mismatch} câu cần rà lại` : ""),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
