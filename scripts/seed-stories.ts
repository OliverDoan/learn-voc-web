import { PrismaClient } from "@prisma/client";
import { extractWords } from "../lib/story-parser";

const prisma = new PrismaClient();

// Mỗi truyện dùng ĐÚNG card.word trong markup [[word|nghĩa]] để link đủ thẻ.
// Mạch truyện chia theo TOPIC (mỗi topic = 5 unit), mỗi topic một nhân vật riêng:
//   Topic 1 (Unit 1–5):   Naruto  (nam, ngôi 3) — học tập & sự nghiệp
//   Topic 2 (Unit 6–10):  Hinata  (nữ, ngôi 3)  — chi tiêu, thủ đô & nơi ở
//   Topic 3 (Unit 11–15): tôi & bạn gái (ngôi 1) — du lịch, văn hoá, thời tiết
//   Topic 4 (Unit 16–20): Sakura  (nữ, ngôi 3)  — hành trình đầu bếp (ẩm thực → sống xanh)
//   Topic 5 (Unit 21–25): Naruto tái xuất (nam, ngôi 3) — burnout, về quê chữa lành (thiên nhiên → sức khỏe)
//   Topic 6 (Unit 26–30): tôi & bạn gái (ngôi 1) — thư giãn, thể thao & giao thông
//
// NGUYÊN TẮC VIẾT: giữ ĐỦ toàn bộ từ/unit, ưu tiên câu văn xuôi tự nhiên, có từ nối,
// đọc trôi chảy (mỗi truyện ~2 đoạn). Bản tiếng Anh (contentEn) lưu ở prisma/seed-data.json,
// KHÔNG set trong script này (seed-stories chỉ ghi title + content + link thẻ).
const STORIES: Array<{ deckName: string; title: string; content: string }> = [
  // Unit 1–15 KHÔNG còn ở đây: mỗi deck chỉ 1 truyện, nguồn duy nhất là prisma/story-data/unit-01..15.json
  // (đánh dấu "exclusive", nạp bằng pnpm stories:load). Chạy lại script này sẽ không tạo lại truyện cũ.
  {
    deckName: "Unit 16:",
    title: "Bữa tối đầu tiên của Sakura",
    content: "Lần đầu tiên, Sakura quyết định tự tay [[prepare|chuẩn bị]] một bữa tối để đãi cả gia đình. Sáng sớm cô ra chợ mua [[groceries|thực phẩm tạp hóa]], lỉnh kỉnh nào là [[beef|thịt bò]], [[pork|thịt lợn]] và cả vài lát [[bacon|thịt ba chỉ xông khói]]. Vì mẹ cô [[vegetarian|ăn chay]], Sakura không quên nhặt thêm một rổ rau xanh để làm riêng một phần. Về đến nhà, cô bật [[stove|bếp]] lên, buộc tạp dề và hít một hơi thật sâu. Trong lòng cô vừa hồi hộp vừa háo hức, bởi đây là bữa ăn đầu tiên do chính tay cô nấu.\n\nSakura bắt đầu [[boil|luộc]] rau trong nồi nước sôi, rồi [[grill|nướng]] thịt bò cho thật [[crispy|giòn]]. Cô [[stir-fry|xào]] thịt lợn với ít [[chilli|ớt]] khiến món ăn dậy mùi [[spicy|cay]] nồng, đồng thời bắc một nồi [[hotpot|lẩu]] và múc thêm một bát [[soup|canh]] nóng. Loay hoay nêm nếm, cô pha một loại [[sauce|nước sốt]] vừa [[sweet|ngọt]] vừa [[savoury|đậm đà]], cẩn thận để món không quá [[oily|nhiều dầu mỡ]] mà cũng đừng bị [[dry|khô]]. Có đĩa thịt hơi cháy và bát canh hơi mặn, nhưng cô chỉ cười xòa cho qua. Đến lúc này bụng đói cồn cào, [[stomach|dạ dày]] réo òng ọc khiến cô suýt [[hangry|cáu vì đói]]. Nhưng khi cô [[serve|phục vụ]] tất cả lên bàn, cả nhà quây quần khen mọi thứ thật [[yummy|ngon]], và bữa tối đầu tiên ấy bỗng ấm áp hơn bao giờ hết.",
  },
  {
    deckName: "Unit 17:",
    title: "Sakura và bài học sau tối vui ở quán",
    content: "Tối thứ Bảy, Sakura cùng nhóm bạn kéo nhau tới một [[pub|quán rượu]] để mừng cô bạn thân vừa thăng chức. Vừa ngồi xuống, cô đã thấy [[thirsty|khát nước]] nên gọi ngay một [[bottle|chai]] [[beer|bia]] mát lạnh và rót đầy chiếc [[glass|cốc thủy tinh]] cao. Một người bạn [[pour|rót]] thêm [[wine|rượu vang]] cho cả bàn, rồi tất cả nâng ly hô \"[[cheers|chúc mừng]]!\" và cùng uống cạn một [[shot|chén rượu nhỏ]]. Càng về khuya, [[drinking|việc uống rượu]] càng hăng khiến Sakura dần thấy [[tipsy|ngà ngà say]]. Cô nhận ra mình đã nạp quá nhiều [[alcohol|cồn]], và cảm giác choáng váng ấy thật [[useless|vô dụng]].\n\nSáng hôm sau, Sakura tỉnh dậy với cơn [[hangover|dư âm sau cơn say]] nặng nề, đầu đau nhức và người thiếu hẳn [[energy|năng lượng]]. Cô cố uống một tách [[coffee|cà phê]] pha chút [[cream|kem sữa]] nhưng vẫn mệt, nên chuyển sang một ly [[smoothie|sinh tố]] trái cây mát lạnh. Quyết tâm [[detox|thải độc]], cô [[stir|khuấy]] một [[litre|lít]] nước [[sparkling|có ga]] với lát chanh tươi rồi thả vào một [[bucket|xô]] đá nhỏ. Nhấp từng ngụm mát lành, Sakura tự hứa sẽ bỏ [[habit|thói quen]] uống quá đà, xem tối qua là một bài học nhớ đời.",
  },
  {
    deckName: "Unit 18:",
    title: "Sakura học nấu ăn theo công thức",
    content: "Sakura quyết học [[cooking|nấu ăn]] một cách bài bản, nên cô tìm đến một [[chef|đầu bếp]] giàu kinh nghiệm để xin theo học. Ông đưa cho cô một [[recipe|công thức]] cùng vài [[secret|bí mật]] nhỏ về [[seasoning|gia vị]] mà chỉ người trong nghề mới biết. Ông giải thích rằng chỉ cần nêm đúng, [[flavour|hương vị]] của cả món ăn sẽ thay đổi hoàn toàn. Nhưng những buổi đầu thật [[terrible|tồi tệ]]: có món [[plain|nhạt]] đến vô vị, có món lại [[strong|nồng]] gắt vì cô [[add|thêm]] quá tay. Tệ hơn, phần [[seafood|hải sản]] cô chế biến vẫn còn [[raw|sống]] và [[undercooked|chưa nấu chín]], làm cô nản lòng.\n\nĐược vị đầu bếp kiên nhẫn chỉ dạy, Sakura học cách phân biệt nguyên liệu [[fresh|tươi]] với đồ [[frozen|đông lạnh]], rồi tập [[roast|nướng]] thịt và vắt [[lemon|chanh vàng]] để món dậy mùi. Dần dần, các đĩa thức ăn của cô trở nên [[delicious|ngon miệng]] và [[tasty|ngon]] hơn hẳn ngày mới bắt đầu. Mỗi tối, vì [[hunger|cơn đói]] sau một ngày dài, cô cùng bạn cầm [[chopstick|đũa]] ăn ngon lành đến mức chẳng còn chút [[leftovers|đồ ăn thừa]] nào. Những hôm quá bận, cô đành gọi [[takeaway|đồ ăn mang đi]] cho nhanh. Nhưng qua từng công thức, cô nhận ra mình đang dần yêu cả nền [[cuisine|ẩm thực]] mà mình theo đuổi.",
  },
  {
    deckName: "Unit 19:",
    title: "Sakura và hành trình ăn uống lành mạnh",
    content: "Sau nhiều năm ăn ngoài, Sakura quyết định [[follow|tuân theo]] một [[diet|chế độ ăn]] thật [[strict|nghiêm ngặt]] để [[stay|giữ]] cơ thể khỏe mạnh. Cô nhận ra đồ ăn nhanh chứa quá nhiều [[sugar|đường]], vừa [[crappy|tồi tệ]] cho sức khỏe vừa [[tiring|gây mệt mỏi]] mỗi lần ăn xong. Vì thế, trước khi mua bất cứ thứ gì, cô đều đọc kỹ từng [[ingredient|nguyên liệu]] và tính toán [[amount|lượng]] calo có trong đó. Sakura tin rằng những bữa [[home-cooked|nấu tại nhà]] vừa [[efficient|hiệu quả]] về chi phí, vừa [[useful|hữu ích]] cho việc kiểm soát khẩu phần.\n\nCàng tìm hiểu, cô càng thấy nhiều [[benefit|lợi ích]] khác của việc ăn sạch, chẳng hạn như làm chậm [[ageing|sự lão hóa]] của làn da. Vì [[allergic|bị dị ứng]] với [[peanut|đậu phộng]], Sakura luôn chọn những món [[snack|ăn vặt]] lành mạnh và tập [[breathe|hít thở]] sâu mỗi khi cảm thấy thèm đồ ngọt. Trong bếp, cô thích [[mix|trộn]] nhiều loại [[crop|cây trồng]] khác nhau để bữa ăn có đủ [[variety|sự đa dạng]]. Đĩa salad của cô lúc nào cũng đầy màu sắc với [[pea|đậu Hà Lan]], những chiếc [[leaf|lá]] rau xanh mướt, và cô không bao giờ quên [[peel|gọt vỏ]] thật sạch trước khi chế biến.",
  },
  {
    deckName: "Unit 20:",
    title: "Vườn rau trái sau nhà của Sakura",
    content: "Muốn có nguyên liệu sạch cho gian bếp của mình, Sakura quyết định [[plant|trồng]] một vườn nhỏ sau nhà và kiên nhẫn chờ ngày [[harvest|thu hoạch]]. Chỉ sau vài tuần, những hạt giống đầu tiên đã [[sprout|nảy mầm]], rồi lần lượt lớn thành [[cabbage|bắp cải]], [[lettuce|rau xà lách]], [[onion|hành tây]] và cả một luống [[mushroom|nấm]] mọc trong bóng râm. Cô còn dành một góc riêng cho các loại [[herb|rau thơm]], mà cô yêu nhất là mấy khóm [[basil|húng quế]] thơm nồng. Mỗi sáng, Sakura hái rau vào, [[slice|thái lát]] thật mỏng rồi xếp gọn trong một chiếc [[bowl|bát]] sứ trắng. Số [[cucumber|dưa chuột]] ăn không hết, cô đem [[pickle|muối chua]] để dành cho những bữa cơm bận rộn.\n\nQua bên kia hàng rào là khu cây ăn trái mà Sakura chăm chút nhất, nơi mọi thứ đều mọng nước và [[juicy|mọng nước]] đến khó cưỡng. Cô trồng [[grapefruit|bưởi]] to tròn, những chùm [[mandarin|quýt]] vàng ươm và cả cây [[kumquat|quả quất]] nhỏ với vị hơi [[sour|chua]] dùng để pha nước chấm. Xa hơn một chút, cô ưu ái dành đất cho ba loại quả đặc sản: [[durian|sầu riêng]] béo ngậy, [[jackfruit|mít]] ngọt lịm và [[mangosteen|măng cụt]] tím thẫm. Sakura cũng thích ngồi nhâm nhi vài chùm nho [[seedless|không hạt]] cùng dăm quả [[olive|ô liu]] mằn mặn sau giờ nấu bếp. Cô luôn nhắc mình phải chế biến thật khéo, kẻo bao công gieo trồng lại uổng phí khi trái cây [[spoil|bị hỏng]].",
  },
  {
    deckName: "Unit 21:",
    title: "Naruto về làng",
    content: "Sau nhiều tháng vắt kiệt sức với công việc ở thành phố, Naruto quyết định tạm gác sự nghiệp để trở về ngôi làng tuổi thơ, nơi anh có thể hòa mình vào [[nature|thiên nhiên]]. Ngôi làng nằm lọt giữa một [[valley|thung lũng]] [[quiet|yên tĩnh]], phía sau là cả một [[range|dãy (núi)]] với những sườn [[steep|dốc]] và những ngọn [[hill|đồi]] xanh mướt. Anh đi bộ [[leisurely|thong thả]] khắp [[part|vùng/khu vực]] này để [[explore|khám phá]] lại từng lối mòn quen thuộc. Bác [[neighbour|hàng xóm]] già bên cạnh nhà vui vẻ kể cho anh nghe về các [[custom|phong tục]] xưa và lối [[architecture|kiến trúc]] nhà gỗ mộc mạc của làng.\n\nNaruto thấy dân làng [[grow|trồng]] lúa, làm [[handicraft|đồ thủ công]] và [[rely|dựa vào]] chính đôi tay mình để sống bình dị. Sau khi xin [[permission|sự cho phép]] của một bác nông dân, anh còn được ngồi lên lưng một con [[buffalo|con trâu]] ngoài đồng. Chiều đến, anh men theo bìa khu [[rainforest|rừng nhiệt đới]] rậm rạp, nơi [[hardly|hầu như không]] có bóng người, chỉ nghe tiếng [[bug|côn trùng]] kêu râm ran. Con đường khá [[dangerous|nguy hiểm]], nhưng vốn [[brave|dũng cảm]], anh chẳng hề sợ hãi và luôn cẩn thận để [[protect|bảo vệ]] chính mình khỏi rắn rết. Khi trở về, Naruto thấy lòng [[satisfied|hài lòng]] và bình yên đã trở lại sau bao ngày mệt mỏi.",
  },
  {
    deckName: "Unit 22:",
    title: "Naruto tìm lại bình yên giữa thiên nhiên",
    content: "Sau chuỗi ngày kiệt sức, Naruto trải tấm [[map|bản đồ]] cũ ra rồi một mình rong ruổi dọc theo [[coast|bờ biển]] để ngắm [[scenery|phong cảnh]] quê nhà. Cả một vùng [[bay|vịnh]] hiện ra [[gorgeous|tuyệt đẹp]], với những [[island|hòn đảo]] xanh mướt và dãy [[mountain|núi]] [[surround|bao quanh]] phía chân trời. Cậu thầm nghĩ nơi này xứng đáng là một [[wonder|kỳ quan]] mà bấy lâu mình bỏ quên. Naruto nằm dài trên cát để [[sunbathe|tắm nắng]], rồi thử ngồi [[fishing|việc câu cá]] cho lòng thư thái hơn.\n\nBuổi chiều, cậu men theo con đường [[rough|gồ ghề]] xuyên qua khu [[forest|rừng]] mọc đầy [[bamboo|tre]] để tìm một [[waterfall|thác nước]] người dân hay nhắc. Lối mòn dẫn vào một [[cave|hang động]] tối om, Naruto phải bật chiếc [[lighter|bật lửa]] soi đường; bên trong không khí [[icy|băng giá]] và có cả một [[spider|con nhện]] to treo lơ lửng trên vách. [[surprisingly|một cách đáng ngạc nhiên]], phía sau hang lại mở ra một [[sanctuary|khu bảo tồn]] tràn ngập [[wildlife|động vật hoang dã]]. Cậu dừng chân bên [[lake|hồ]] nước trong veo, ngước nhìn [[cliff|vách đá]] cao sừng sững, và cảm thấy tinh thần dần hồi phục sau bao mệt mỏi.",
  },
  {
    deckName: "Unit 23:",
    title: "Naruto học cách chăm sóc bản thân",
    content: "Về quê nghỉ ngơi, Naruto quyết định dành nhiều [[care|sự chăm sóc]] hơn cho [[health|sức khỏe]] của mình sau chuỗi ngày [[condition|tình trạng]] sa sút. Cậu từng [[anxious|lo lắng]] rằng những thói quen xấu sẽ [[damage|làm tổn hại]] [[body|cơ thể]], và cũng thấy [[embarrassed|xấu hổ]] khi [[weight|cân nặng]] tăng vọt. Vì thế mỗi sáng cậu dậy sớm để [[exercise|tập thể dục]], rèn cho mình vóc dáng [[muscular|cơ bắp]] hơn và [[prevent|ngăn ngừa]] bệnh tật. Chỉ sau vài tuần, [[obviously|rõ ràng]] Naruto thấy mình [[awake|tỉnh táo]] hơn hẳn, [[heartbeat|nhịp tim]] đều đặn và [[blood|máu]] lưu thông tốt.\n\nKhông dừng lại ở đó, Naruto còn chăm chút cho cả [[mind|tâm trí]] lẫn [[brain|não bộ]] của mình. Mỗi tối cậu ngồi thiền thật [[mindful|chú tâm]] để đầu óc [[remain|vẫn giữ]] bình yên, rồi lại [[curious|tò mò]] đọc thêm những cuốn sách mới. Bạn bè bảo trí nhớ [[extraordinary|phi thường]] của cậu chính là thành quả của việc rèn luyện đều đặn. Cậu cũng chịu khó đi khám tổng quát, kiểm tra [[sight|thị lực]] và ghé [[dentist|nha sĩ]] định kỳ. Nhờ vậy, chuyện ốm nặng giờ đây trở nên [[unlikely|khó xảy ra]] với Naruto.",
  },
  {
    deckName: "Unit 24:",
    title: "Trận cúm bất ngờ của Naruto",
    content: "Sau nhiều ngày tập luyện chăm chỉ, Naruto tưởng mình đã khỏe hẳn thì thời tiết trở lạnh đột ngột khiến cậu dính ngay một trận [[cold|cảm lạnh]] rồi ngã [[ill|ốm]] nặng. Ngay đêm đó cậu [[cough|ho]] không ngớt, [[throat|cổ họng]] rát và [[sore|đau nhức]], kèm theo cơn [[headache|đau đầu]] dồn dập. Một cơn [[ache|đau âm ỉ]] chạy dọc sống lưng, mỗi lần cựa mình lại thấy [[hurt|làm đau]] khắp người. Nghĩ chắc chỉ là [[flu|cúm]] do đổi mùa, nhưng càng về khuya cậu càng thấy dâng lên một [[fear|nỗi sợ]] mơ hồ khó tả.\n\nSáng hôm sau, Naruto vội tới bệnh viện vì lo căn [[disease|bệnh]] này có gì đó [[seriously|nghiêm trọng]], thậm chí thầm sợ đó là [[cancer|ung thư]] nên xin bác sĩ [[check|kiểm tra]] thật kỹ. Bác sĩ khám xong liền trấn an rằng đây chỉ là cúm thường, hoàn toàn [[curable|chữa được]], cậu không phải [[suffer|chịu đựng]] dai dẳng như bệnh [[diabetes|tiểu đường]] hay [[autism|tự kỷ]]. Lúc đứng dậy cậu vô ý trượt chân, [[injure|làm bị thương]] khuỷu tay đến [[bleed|chảy máu]] một chút. Bác sĩ băng lại, kê [[prescription|đơn thuốc]] để [[ease|làm dịu]] cơn [[pain|cơn đau]], rồi dặn nhỏ thêm vài [[drop|giọt (thuốc)]] vào mắt cho đỡ mỏi; Naruto ra về mà lòng nhẹ tênh.",
  },
  {
    deckName: "Unit 25:",
    title: "Naruto ra hiệu thuốc",
    content: "Sau một đêm chỉ toàn [[nightmare|cơn ác mộng]], Naruto tỉnh dậy với cơn đau đầu [[painful|đau đớn]] và cả người [[exhausted|kiệt sức]]. Cậu nhận ra mình [[dehydrated|mất nước]] sau trận sốt cao, tưởng như đây là một tình huống [[emergency|cấp cứu]] và sợ sẽ [[lose|mất]] hết sức lực. Không muốn chần chừ, cậu lê bước ra [[pharmacy|hiệu thuốc]] gần nhà. Ở quầy, một [[chemist|dược sĩ]] ân cần đón cậu như một [[patient|bệnh nhân]] quan trọng nhất. Naruto cố [[explain|giải thích]] thật rõ từng triệu chứng, còn người kia thì kiên nhẫn lắng nghe.\n\nNgười dược sĩ đưa cho cậu một [[packet|gói]] thuốc gồm vài [[pill|viên thuốc]] trắng và một [[capsule|viên nang]] màu xanh. Anh khuyên Naruto nên [[consider|cân nhắc]] uống thêm [[painkiller|thuốc giảm đau]] nếu cơn sốt còn kéo dài, vì mỗi loại [[medicine|thuốc]] có một [[effect|tác dụng]] riêng. Cậu học cách uống thật [[slowly|chậm rãi]] và đúng giờ, để cơ thể kịp [[repair|phục hồi]] và [[remove|loại bỏ]] đám vi khuẩn có hại. Nhờ vậy, Naruto dần [[recover|hồi phục]] mà không phải [[admit|nhập viện]], rồi [[speedy|nhanh chóng]] khỏe lại, [[fit|khỏe mạnh]] và tươi tắn như xưa. Từ trận ốm ấy, cậu tự nhủ phải sống chậm hơn, biết cân bằng và lắng nghe cơ thể mình.",
  },
  {
    deckName: "Unit 26:",
    title: "Học cách thư giãn",
    content: "Dạo gần đây tôi học [[hard|chăm chỉ]] đến mức cuộc sống trở nên [[quite|khá]] [[stressful|căng thẳng]]. Vì quá [[obsess|ám ảnh]] với việc ôn thi, tôi thường [[forget|quên]] mất giờ nghỉ và [[waste|lãng phí]] cả những khoảng thời gian quý giá. Một hôm, tôi đọc được câu chuyện về một [[detective|thám tử]] luôn cố [[defeat|đánh bại]] tội phạm, nhờ đó tôi chợt nhận ra mình cũng cần nghỉ ngơi đúng cách.\n\nĐến ngày [[free|rảnh rỗi]], tôi sắp xếp lại thời gian thật [[proper|đúng cách]]. Đúng [[noon|buổi trưa]], tôi cho mình một [[break|giờ nghỉ]], [[lie|nằm]] dài trên ghế và [[imagine|tưởng tượng]] mình đang lạc vào một khu rừng vừa [[silent|im lặng]] vừa [[calm|bình tĩnh]]. Tôi bắt đầu [[meditate|thiền]] để không còn [[lazy|lười biếng]] mà luôn [[active|năng động]] hơn. Sau khoảng thời gian [[relaxation|sự thư giãn]] ấy, tôi thong thả đi [[through|xuyên qua]] công viên, rồi về nhà [[sleep|ngủ]] một giấc, có một [[dream|giấc mơ]] thật đẹp và thức dậy sau khi đã [[rest|nghỉ ngơi]] đầy đủ, tràn đầy năng lượng.",
  },
  {
    deckName: "Unit 27:",
    title: "Xem giải đấu thể thao",
    content: "Cuối tuần, tôi và bạn gái đến sân xem một [[tournament|giải đấu]] [[badminton|cầu lông]] lớn. Trên sân, một [[athlete|vận động viên]] cầm chắc chiếc [[racquet|vợt]] và trông rất [[strong|mạnh]]. Đây là [[contest|cuộc thi]] gay cấn, hai bên [[compete|thi đấu]] quyết liệt trong từng [[match|trận đấu]]. Bạn gái tôi thành [[supporter|cổ động viên]] nhiệt tình, hò hét cổ vũ mỗi khi anh ấy ghi điểm trước [[competitor|đối thủ]]. Có lúc trọng tài và khán giả [[argue|tranh cãi]] về một pha bóng, nhưng người [[sportsman|vận động viên]] ấy vẫn giữ bình tĩnh.\n\nHôm sau, chúng tôi ở nhà xem [[final|trận chung kết]] bóng đá. Một [[team|đội]] tôi yêu thích có một [[captain|đội trưởng]] giỏi và một [[coach|huấn luyện viên]] tận tâm, cả đội [[practice|luyện tập]] chăm chỉ suốt mùa giải. Mỗi [[footballer|cầu thủ bóng đá]] đều chơi hết mình dù đầu hiệp [[score|tỉ số]] còn thấp và hàng thủ có vẻ hơi [[weak|yếu]]. Cuối cùng họ [[win|thắng]] và nâng cao chiếc [[cup|cúp]] danh giá. Đối thủ trở thành [[loser|người thua]] buồn bã, còn đội tôi là [[winner|người thắng]] xứng đáng.",
  },
  {
    deckName: "Unit 28:",
    title: "Lịch tập luyện của hai đứa",
    content: "Tôi và bạn gái quyết định cùng [[train|rèn luyện]] mỗi ngày để lấy lại [[form|phong độ]]. Cô ấy lập một [[timetable|thời gian biểu]] chi tiết, tin rằng dù đã lớn [[age|tuổi]] thì [[ability|khả năng]] của hai đứa vẫn tiến bộ được. Sáng sớm chúng tôi [[jogging|chạy bộ]] quanh hồ rồi [[running|chạy]] nước rút để [[burn|đốt cháy (calo)]] mỡ thừa, có hôm mệt đến rơm rớm [[tear|nước mắt]]. Vào phòng gym, cô ấy ép tôi tập [[push-up|hít đất]] và [[lift|nâng (tạ)]] cho chắc cơ. Anh [[trainer|huấn luyện viên]] khen tôi tập như một con [[beast|quái vật (khỏe)]], còn dặn muốn [[gain|tăng (cân)]] cơ thì phải ăn đủ. Cuối tuần, hai đứa [[ride|đạp/cưỡi]] xe đạp và [[racing|đua]] xem ai về đích trước.\n\nKỳ nghỉ tới, chúng tôi đổi gió bằng những môn ngoài trời. Tôi mê [[swimming|bơi]] còn cô ấy thích [[hiking|đi bộ đường dài]] lên núi. Ra biển, hai đứa thuê thuyền kayak, thay nhau [[paddle|chèo]] rồi thử [[sailing|chèo thuyền buồm]] khi có gió lớn. Cô ấy rất [[brave|dũng cảm]], dám [[diving|lặn]] xuống sâu ngắm san hô, còn tôi chỉ dám [[snorkel|lặn ống thở]] gần bờ. Buổi chiều, chúng tôi căng [[net|lưới]] chơi bóng chuyền trên cát đến khi mặt trời lặn.",
  },
  {
    deckName: "Unit 29:",
    title: "Một buổi kẹt xe",
    content: "Chiều nay tôi chở bạn gái về nhà thì gặp cảnh [[traffic|giao thông]] kẹt cứng. Đường phố [[heavy|đông đúc]] xe cộ, mỗi khi [[light|đèn (giao thông)]] đỏ bật lên là hàng dài lại đứng im. Nhiều tài xế mất [[patient|kiên nhẫn]] nên cứ [[honk|bấm còi]] inh ỏi, khiến tôi thấy rất [[annoyed|bực mình]]. Bên lề đường, một [[cyclist|người đi xe đạp]] và mấy [[pedestrian|người đi bộ]] phải len qua từng khe hở nhỏ. Bạn gái tôi, một [[passenger|hành khách]] ngồi ghế bên, nhắc tôi tránh cái [[hole|ổ gà]] to trước mặt.\n\nBỗng một chiếc xe máy phóng [[fast|nhanh]], liều lĩnh [[pass|vượt qua]] dòng xe như thể tài xế đang [[crazy|điên rồ]], suýt gây [[accident|tai nạn]]. Tôi vội [[push|đẩy]] tay lái sang bên và phanh lại [[quickly|nhanh chóng]]. Một [[officer|cảnh sát]] gần đó chặn chiếc xe kia vì chạy quá [[speed|tốc độ]] và bắt nộp một khoản [[fine|tiền phạt]] không nhỏ. Tôi lái thật [[carefully|cẩn thận]], ghé [[station|trạm]] xăng đổ thêm [[fuel|nhiên liệu]] rồi mới về [[safely|an toàn]]. Kẹt xe hôm nay còn [[worse|tệ hơn]] hôm qua, nhưng ít ra chúng tôi vẫn bình yên.",
  },
  {
    deckName: "Unit 30:",
    title: "Cơn ác mộng xe hỏng",
    content: "Cuối tuần, tôi và bạn gái rủ nhau đi chơi bằng [[motorbike|xe máy]], sau khi đã đổ [[full|đầy]] bình xăng. Vì hai đứa vẫn [[regularly|thường xuyên]] đi cùng nhau nên tôi tự tin [[navigate|định hướng]] và chọn một [[shortcut|đường tắt]] cho nhanh. Nhưng chuyến đi bỗng thành một [[nightmare|cơn ác mộng]]: tôi [[lost|lạc đường]], cứ [[turn|rẽ]] hết ngã này sang ngã khác. [[suddenly|đột nhiên]] [[smoke|Khói]] bốc ra từ [[engine|động cơ]], tôi bóp [[brake|phanh]] gấp thì suýt bị một chiếc [[truck|xe tải]] phía sau [[hit|đâm]] vào.\n\nXe chết máy giữa đường, chúng tôi đành dắt bộ. Một anh đạp [[bicycle|xe đạp]] tốt bụng chỉ đường, rồi một bác chạy [[tricycle|xe ba bánh]] [[lift|cho đi nhờ xe]] mà chẳng lấy [[fare|tiền vé]]. Bác chở chúng tôi tới [[garage|xưởng sửa xe]] gần bến sông, nơi vài chiếc [[boat|thuyền]] đang neo đậu. Ở đó, một [[mechanic|thợ máy]] kiểm tra [[wheel|bánh xe]] rồi [[fix|sửa]] lại động cơ. Thật may, anh ấy chỉ [[charge|tính phí]] rất nhẹ nhàng.",
  },
];

async function main() {
  // Lọc theo 1 unit khi cần, ví dụ: UNIT="Unit 1:" tsx --env-file=.env scripts/seed-stories.ts
  // Bỏ trống UNIT → seed toàn bộ.
  const only = process.env.UNIT?.trim();
  const stories = only ? STORIES.filter((s) => s.deckName === only) : STORIES;
  if (only && stories.length === 0) {
    console.warn(`⚠️  UNIT="${only}" không khớp deckName nào trong STORIES.`);
    return;
  }

  for (const { deckName, title, content } of stories) {
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

    // Khớp theo TIÊU ĐỀ truyện gốc: deck giờ có nhiều truyện (prisma/story-data) nên
    // không được lấy "truyện đầu tiên" rồi ghi đè — sẽ phá truyện bổ sung.
    const existing = await prisma.story.findFirst({ where: { deckId: deck.id, title } });
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
