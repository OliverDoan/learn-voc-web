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
  {
    deckName: "Unit 1:",
    title: "Giấc mơ du học",
    content: `Naruto ấp ủ một [[idea|ý tưởng]]: đi du học [[abroad|ở nước ngoài]] để khám phá một nền [[culture|văn hoá]] mới. Thế nhưng [[language|ngôn ngữ]] lại là rào cản lớn nhất — anh mới chỉ là một [[beginner|người mới bắt đầu]], nên mỗi lần gặp [[foreigner|người nước ngoài]] là anh đâm ra [[shy|nhút nhát]] và [[scared|sợ hãi]].

Để vượt qua [[difficulty|khó khăn]], Naruto đăng ký một [[course|khoá học]] tiếng Anh. Trên lớp, một [[speaker|diễn giả]] bản xứ thường mở những [[conversation|cuộc trò chuyện]] xoay quanh nhiều [[topic|chủ đề]] khác nhau; ban đầu anh rất khó [[follow|theo dõi]] và [[understand|hiểu]] hết.

Quyết tâm [[improve|cải thiện]], anh chăm chỉ học [[vocabulary|từ vựng]] và luyện từng [[skill|kỹ năng]], nhờ vậy ngày càng [[confident|tự tin]] hơn. Sự [[progress|tiến bộ]] thấy rõ: anh đã có thể [[communicate|giao tiếp]] thật tự nhiên với một [[visitor|du khách]] — điều mà phiên bản [[original|ban đầu]] của anh chẳng bao giờ dám làm — và cuối khoá còn nhận được một tấm [[certificate|chứng chỉ]].`,
  },
  {
    deckName: "Unit 2:",
    title: "Hành trình đi học của Naruto",
    content: `Hành trình của Naruto bắt đầu từ những ngày còn ngồi trên ghế nhà trường. Sau khi học [[kindergarten|mẫu giáo]] rồi [[primary|tiểu học]], anh lên bậc [[secondary|trung học]]. Mẹ anh dạy [[mathematics|toán học]], còn bố làm trong ngành [[engineering|kỹ thuật]]; riêng anh lại mê nhất hai [[subject|môn học]] là [[science|khoa học]] và [[art|nghệ thuật]].

Ngày đầu tiên, Naruto khá [[nervous|hồi hộp]] khi thầy cô [[announce|thông báo]] danh sách xếp [[grade|lớp]]. Anh luôn [[attend|đi học]] đầy đủ và hiếm khi [[absent|vắng mặt]]; chỉ ngay trong [[term|học kỳ]] đầu, anh đã trở nên [[popular|được yêu thích]] vì hay giúp đỡ bạn bè.

Mỗi tối, anh đều [[revise|ôn tập]], [[memorise|ghi nhớ]] từ mới và làm cho xong hết [[assignment|bài tập]]. Anh còn [[enroll|đăng ký]] thêm vài lớp để [[continue|tiếp tục]] nâng cao và [[succeed|thành công]]. Dù [[curriculum|chương trình học]] rất nặng và ngày nào cũng phải mặc [[uniform|đồng phục]], anh chưa một lần nghĩ đến chuyện [[drop out|bỏ học]].`,
  },
  {
    deckName: "Unit 3:",
    title: "Naruto và biệt danh Sunny",
    content: `Naruto có một [[nickname|biệt danh]] [[special|đặc biệt]] là "Sunny" — bà ngoại hay [[call|gọi]] anh như thế từ bé. Hồi nhỏ anh ấy không [[know|biết]] [[meaning|ý nghĩa]], mãi sau mẹ mới [[tell|kể]] rằng nó tượng trưng cho niềm vui, và cái tên ấy theo anh suốt cả những lần chuyển nhà.

Lần này, Naruto [[live|sống]] ở một [[town|thị trấn]] [[beautiful|đẹp]] và [[peaceful|yên bình]] gần [[centre|trung tâm]]. Phố khá [[crowded|đông đúc]] — điều [[common|phổ biến]] ở đây — nhưng anh nhanh chóng thấy quen. Chỉ có điều [[hometown|quê hương]] anh ở tận phía [[north|bắc]], còn giờ anh sống ở phía [[south|nam]], nên [[distance|khoảng cách]] về thăm nhà khá xa.

Sống ổn định rồi, việc đầu tiên là tới trường mới. Ngày đầu đến lớp, anh ấy [[spell|đánh vần]] tên và [[surname|họ]] cho cô giáo, để lại [[contact|thông tin liên lạc]] cùng [[address|địa chỉ]], [[sign|ký tên]] vào sổ, rồi vui vẻ [[describe|mô tả]] sở thích [[favourite|yêu thích]] của mình: nghe nhạc và đọc sách — đúng chất một cậu bé "Sunny".`,
  },
  {
    deckName: "Unit 4:",
    title: "Ngày hội nghề nghiệp",
    content: `Naruto tìm đến một ngày hội nghề nghiệp. Ở đó, một [[company|công ty]] lớn đang [[open|mở]] đợt tuyển dụng; [[owner|chủ sở hữu]] giao cho [[employer|nhà tuyển dụng]] nhiệm vụ tìm thêm [[employee|nhân viên]] mới. Một [[assistant|trợ lý]] đã [[design|thiết kế]] sẵn một [[form|mẫu đơn]] với những tiêu chí [[acceptable|chấp nhận được]]: chế độ [[offer|đãi ngộ]] tốt, tác phong [[punctual|đúng giờ]] và công việc đủ [[challenging|thử thách]].

Trong tờ đơn liệt kê đủ mọi ngành nghề để ứng viên lựa chọn: từ [[journalist|nhà báo]], [[accountant|kế toán]], [[cook|đầu bếp]], [[lawyer|luật sư]], [[architect|kiến trúc sư]], [[engineer|kỹ sư]], cho đến [[manager|quản lý]], [[pilot|phi công]], [[salesperson|nhân viên bán hàng]], [[housewife|nội trợ]], [[receptionist|lễ tân]] và cả [[hairdresser|thợ làm tóc]].

Nhìn qua, Naruto thấy có rất nhiều vị trí vừa đầy thử thách lại vừa thú vị, nên anh quyết định nộp đơn ngay.`,
  },
  {
    deckName: "Unit 5:",
    title: "Hành trình tìm việc của Naruto",
    content: `Ra trường còn [[jobless|thất nghiệp]], Naruto nghĩ về [[career|sự nghiệp]]: [[prepare|chuẩn bị]] hồ sơ, [[arrange|sắp xếp]] [[document|tài liệu]] vào [[file|hồ sơ]] rồi gửi [[application|đơn xin việc]] nhiều nơi.

Trong buổi [[interview|phỏng vấn]], anh ấy gặp đủ ứng viên: [[secretary|thư ký]], [[bank teller|giao dịch viên ngân hàng]], [[nurse|y tá]]. Anh ấy từng mơ làm [[film maker|nhà làm phim]], [[musician|nhạc sĩ]], [[reporter|phóng viên]], [[photographer|nhiếp ảnh gia]], nhưng thích nhất nghề [[designer|nhà thiết kế]].

Vì đủ [[qualified|tiêu chuẩn]], anh ấy được nhận vào làm thiết kế. Những ngày đầu, anh học dùng nhiều [[tool|công cụ]] mới, được một [[expert|chuyên gia]] kỳ cựu chỉ bảo, và lần đầu gặp [[customer|khách hàng]] để nghe yêu cầu; văn phòng lúc ấy đang sửa nên anh còn thấy cả [[builder|thợ xây]] ra vào mỗi ngày. Sau khi được [[employed|tuyển dụng]] chính thức và ký [[contract|hợp đồng]], anh ấy quyết định thành [[freelancer|người làm tự do]] để tự do sáng tạo.`,
  },
  {
    deckName: "Unit 6:",
    title: "Bài học chi tiêu của Hinata",
    content: `Khi bắt đầu có thu nhập, Hinata thấy mình như [[rich|giàu có]] hẳn lên và tập sống [[luxury|xa hoa]]. Cô mua toàn đồ [[expensive|đắt đỏ]] mà chẳng buồn nhìn [[price|giá cả]], cứ thế [[spend|tiêu]] tiền một cách [[wasteful|lãng phí]] vì quá [[generous|hào phóng]] với bản thân và bạn bè, hoàn toàn quên mất việc [[save|tiết kiệm]].

Đến cuối tháng, hàng loạt [[bill|hóa đơn]] đồng loạt [[due|đến hạn]]: nào là [[rent|tiền thuê nhà]], nào là đủ thứ [[fee|phí]], lại thêm cả một tờ [[note|giấy nhắc nợ]]. Tổng [[cost|chi phí]] lớn đến mức khiến Hinata [[broke|cháy túi]]. Cô đành [[borrow|vay]] một người bạn tốt bụng chịu [[lend|cho vay]], và thế là bắt đầu mang [[owe|nợ]].

Sau lần đó, Hinata học cách [[manage|quản lý]] tiền bạc: ghi lại từng [[expense|khoản chi tiêu]], ưu tiên đồ [[cheap|rẻ]] và chi tiêu [[reasonable|hợp lý]] hơn. Khi được [[raise|tăng lương]], cô càng [[decrease|giảm]] bớt những khoản thừa và dần trả hết nợ.`,
  },
  {
    deckName: "Unit 7:",
    title: "Hinata khám phá thủ đô",
    content: `Sau khi đã biết quản lý tiền, Hinata quyết định chuyển lên [[capital|thủ đô]] sinh sống. Xe chạy bon bon trên [[highway|đường cao tốc]] mới, hai bên là những [[skyscraper|tòa nhà chọc trời]] và [[tower|tháp]] cao vút, khiến cô thấy mọi thứ thật [[exciting|thú vị]].

Khu [[central|trung tâm]] của [[district|quận]] mang một [[atmosphere|bầu không khí]] vừa [[lively|sống động]] vừa [[bustling|nhộn nhịp]]. Cả [[neighbourhood|khu phố]] san sát cửa hàng [[various|đa dạng]], [[quality|chất lượng]] tốt và [[service|dịch vụ]] rất thân thiện. [[system|Hệ thống]] giao thông ở đây [[modern|hiện đại]] và [[convenient|tiện lợi]]; [[pavement|vỉa hè]] sạch sẽ, đến cả [[alley|con hẻm]] nhỏ trông cũng [[appealing|hấp dẫn]].

Tối đến, Hinata ghé một [[square|quảng trường]] đông vui để tìm hiểu [[culture|văn hóa]] bản địa, rồi khám phá [[nightlife|cuộc sống về đêm]] tại một [[nightclub|hộp đêm]] sôi động. Với cô, thủ đô là nơi mở ra biết bao [[opportunity|cơ hội]] mới.`,
  },
  {
    deckName: "Unit 8:",
    title: "Sự thật về thủ đô",
    content: `Ở lâu hơn một chút, Hinata mới nhận ra thủ đô khá [[pricey|đắt đỏ]]: [[accommodation|chỗ ở]] thì chật chội, thiếu [[room|không gian]] sinh hoạt. Mỗi lần đi làm [[daily|hàng ngày]], cô lại ngợp trong [[pollution|sự ô nhiễm]] — khói từ đủ loại [[vehicle|phương tiện giao thông]], [[rubbish|rác]] bị người ta [[throw|vứt]] bừa bãi, khiến không khí trở nên [[unhealthy|có hại cho sức khỏe]].

Khu trung tâm thì [[overpopulated|quá đông dân]], [[population|dân số]] tăng quá nhanh trong khi lại [[lack|thiếu]] [[facility|cơ sở vật chất]], đến mức phải [[build|xây]] thêm cả một cây [[bridge|cầu]] mới. Trên phố có những [[beggar|người ăn xin]] [[poor|nghèo]] co ro, lại không ít kẻ [[selfish|ích kỷ]]; có lần Hinata suýt bị một [[pickpocket|kẻ móc túi]] lấy mất ví. [[crime|tội phạm]] ngày một tăng, [[security|an ninh]] lại mỏng, và cô còn nghe kể về đủ loại [[scam|trò lừa đảo]].

Cuối cùng, Hinata quyết định tìm một nơi [[affordable|giá phải chăng]] hơn, vừa đủ đáp ứng [[demand|nhu cầu]] của mình lại vừa bình yên.`,
  },
  {
    deckName: "Unit 9:",
    title: "Căn hộ mới của Hinata",
    content: `Hinata [[drive|lái]] xe rời [[away|xa]] thủ đô để tìm một [[place|nơi]] ở mới ngoài ngoại ô, rồi dừng lại trước một [[building|tòa nhà]] sạch sẽ. Căn [[flat|căn hộ]] ở tầng 10 có cửa sổ [[face|hướng]] về phía đông nên lúc nào cũng ngập tràn [[light|ánh sáng]]; chỉ cần bước ra [[balcony|ban công]] là thấy ngay một [[view|khung cảnh]] tuyệt đẹp.

Bên trong, nhà đã có [[fully|đầy đủ]] [[furniture|đồ nội thất]]: một chiếc [[bookshelf|kệ sách]] gỗ, bộ [[curtain|rèm cửa]] màu kem, một chiếc [[air conditioner|máy điều hòa]] còn mới, sàn trải [[carpet|thảm]] êm ái và một tấm [[rug|thảm nhỏ]] xinh xắn đặt trước sofa.

Để tiết kiệm, Hinata [[share|dùng chung]] căn hộ với một [[housemate|người ở chung nhà]] — một cô gái cũng làm [[roommate|người ở chung phòng]] với cô. Hinata còn [[decorate|trang trí]] thật [[beautifully|đẹp đẽ]] bằng vài món [[antique|đồ cổ]], khiến nơi ở trở nên [[comfortable|thoải mái]] hơn hẳn căn phòng [[cramped|chật chội]] ngày xưa.`,
  },
  {
    deckName: "Unit 10:",
    title: "Khu phố mới của Hinata",
    content: `Hinata vừa chuyển đến một [[area|khu vực]] mới, sống trong một [[block|dãy nhà]] khang trang vừa được [[develop|phát triển]]. Ngày đầu tiên, người hàng xóm [[friendly|thân thiện]] đã sang [[inform|thông báo]] cho cô về giờ giấc sinh hoạt chung, rồi [[invite|mời]] cô qua nhà chơi.

Đi dạo một vòng, Hinata thấy khu phố vừa [[safe|an toàn]] vừa [[vibrant|sôi động]]. Đường sá hơi [[complicated|phức tạp]] vì có nhiều lối [[one-way|một chiều]], nhưng [[mostly|hầu hết]] đều dễ đi. Ngay tầng [[ground|mặt đất]] của toà nhà có cả một [[clinic|phòng khám]] lẫn một [[gym|phòng tập thể hình]], nên gần như thứ gì cần cũng có [[everywhere|khắp mọi nơi]] xung quanh.

Buổi tối, khu này không hề [[noisy|ồn ào]]; không khí [[always|luôn luôn]] [[chilled|thư giãn]], tạo nên một [[vibe|bầu không khí]] dễ chịu. Căn hộ của cô tuy nhỏ nhưng [[comfy|dễ chịu]] và [[cosy|ấm cúng]] — đây là [[property|tài sản]] đầu tiên cô tự mua được. Dưới sân chung còn có [[playground|sân chơi]] cho trẻ nhỏ và một [[pool|bể bơi]] mát lành. Nhìn quanh, Hinata mỉm cười.`,
  },
  {
    deckName: "Unit 11:",
    title: "Chuyến du lịch đầu tiên của hai người",
    content: `[[nowadays|Ngày nay]], việc [[travelling|du lịch]] đã dễ dàng hơn xưa rất nhiều. Hai đứa vô cùng [[excited|hào hứng]] khi cùng nhau chọn một [[destination|điểm đến]] mới toanh. Cả hai xin [[visa|thị thực]], đặt vé [[flight|chuyến bay]] và [[reservation|đặt chỗ]] khách sạn từ sớm.

Nhưng chuyến đi khởi đầu không suôn sẻ: chuyến bay bị [[delay|trì hoãn]] mấy tiếng khiến cô ấy khá [[disappointed|thất vọng]]. Bọn mình tự nhủ rằng trục trặc cũng là một phần của [[journey|cuộc hành trình]], và đây chính là [[chance|cơ hội]] để [[escape|thoát khỏi]] công việc bận rộn thường ngày.

Đến nơi, nhân viên ở [[reception|quầy tiếp tân]] đón bọn mình rất niềm nở. Kì [[stay|nghỉ]] này thật sự là một [[experience|trải nghiệm]] [[amazing|đáng kinh ngạc]]. Điểm đến [[huge|khổng lồ]], mỗi ngày lại là một [[adventure|cuộc phiêu lưu]] mới để [[discover|khám phá]].

Bọn mình tham gia một [[tour|chuyến tham quan]] chung với nhiều [[tourist|khách du lịch]] khác, và mỗi [[moment|khoảnh khắc]] bên nhau đều trở thành một [[memory|kỉ niệm]] đẹp. Trước khi về, cô ấy còn mua một tấm [[postcard|bưu thiếp]] gửi cho gia đình.`,
  },
  {
    deckName: "Unit 12:",
    title: "Một ngày tham quan cùng nhau",
    content: `Nhân một ngày [[leisure|rảnh rỗi]], hai đứa rủ nhau đi [[sightseeing|ngắm cảnh]] cùng một [[guide|hướng dẫn viên]] người [[local|địa phương]]. Anh ấy chọn cho bọn mình một [[route|tuyến đường]] giàu [[history|lịch sử]].

Cả nhóm lần lượt ghé thăm một [[mausoleum|lăng tẩm]] cổ, vài ngôi [[church|nhà thờ]], một ngôi [[temple|đền]] và một ngôi [[pagoda|chùa]] trầm mặc, rồi cả bảo tàng [[war|chiến tranh]]. Có những nơi khá [[touristy|đông khách du lịch]], nhưng cũng có nhiều góc [[hidden|kín đáo]] rất [[lovely|đáng yêu]], hợp cho các cặp [[lover|tình nhân]].

Đến trưa, [[guide|hướng dẫn viên]] [[recommend|gợi ý]] bọn mình ghé khu [[market|chợ]] để [[try|thử]] và [[taste|nếm thử]] vài món ăn — quả là một [[option|lựa chọn]] tuyệt vời.

Nói về chỗ nghỉ, ở đây có đủ lựa chọn: một [[resort|khu nghỉ dưỡng]] sang trọng, một [[campsite|khu cắm trại]] ngoài trời, hay một [[homestay|nhà nghỉ tại nhà dân]] ấm cúng. Sáng hôm sau, hai đứa còn dậy sớm cùng nhau [[hike|đi bộ đường dài]] lên núi.`,
  },
  {
    deckName: "Unit 13:",
    title: "Mùa cưới và lễ hội",
    content: `[[generally|Nhìn chung]], người Việt rất thích những dịp [[celebration|ăn mừng]]; mỗi [[occasion|dịp đặc biệt]] là một lần cả nhà được sum họp.

Mùa này, bọn mình được mời dự một [[wedding|lễ cưới]] đông [[guest|khách mời]] và [[relative|họ hàng]]. Ai cũng nói lời [[congratulations|chúc mừng]], [[welcome|chào đón]] cô dâu chú rể và mở một bữa [[party|tiệc]] thật lớn để chúc đôi trẻ nhiều [[luck|may mắn]].

Đúng dịp lại có một [[festival|lễ hội]] mang tầm [[national|toàn quốc]]. Khắp phố treo đèn [[lantern|lồng]] và bắn [[firework|pháo hoa]] rực rỡ ở nơi [[public|công cộng]]. Người người kéo đến [[pray|cầu nguyện]], dâng [[offering|lễ vật]]; một vị [[priest|linh mục]] cầu chúc [[peace|bình yên]] cho tất cả mọi người.

Trước [[holiday|ngày lễ]], hai đứa cùng nhau [[tidy|dọn dẹp]] nhà cửa và [[exchange|trao đổi]] quà với những [[loved one|người thân yêu]]. Hôm đó cũng tình cờ là [[anniversary|ngày kỉ niệm]] ngày hai đứa quen nhau.`,
  },
  {
    deckName: "Unit 14:",
    title: "Khác biệt văn hoá của tôi và bạn gái",
    content: `Giữa tôi và bạn gái có khá nhiều [[difference|sự khác biệt]] về văn hoá. Một điều [[normal|bình thường]] ở nơi này đôi khi lại [[strange|kì lạ]] ở nơi khác, nên cả hai luôn cố gắng [[respect|tôn trọng]] và đối xử [[fair|công bằng]] với nhau.

Khi bàn đến chuyện [[marriage|hôn nhân]], hai bên gia đình [[expect|mong đợi]] rất nhiều. Mỗi nhà lại có những [[rule|quy tắc]] và [[taboo|điều cấm kỵ]] riêng mà mình phải [[avoid|tránh]]. Lúc chưa [[familiar|quen thuộc]], tôi dễ vô tình làm ai đó [[angry|tức giận]] mà thật ra không hề [[mean|có ý định]] như vậy.

Tôi khá [[proud|tự hào]] về nét [[traditional|truyền thống]] của gia đình mình: nhà tôi theo [[religion|tôn giáo]], là [[Buddhist|Phật tử]], có một [[shrine|miếu thờ]] nhỏ đặt cạnh chiếc [[pillar|cột nhà]] chạm khắc. Mọi người [[believe|tin tưởng]] vào sự [[care|quan tâm]], chở che của tổ tiên.

Dần dần tôi hiểu rằng đừng nên [[control|điều khiển]] hay cố [[persuade|thuyết phục]] người kia thay đổi. Chỉ cần cởi mở đón nhận, những điều mới mẻ trong một nền văn hoá khác sẽ khiến bạn [[surprise|bất ngờ]] một cách thú vị.`,
  },
  {
    deckName: "Unit 15:",
    title: "Bạn gái và thời tiết quê tôi",
    content: `Tôi kể cho bạn gái nghe về quê mình, nơi có kiểu [[climate|khí hậu]] với hai [[season|mùa]] rất [[typical|điển hình]].

Vào [[beginning|đầu]] mùa hè, trời [[sunny|nhiều nắng]] và [[humid|ẩm]]. Bản [[forecast|dự báo]] thời tiết nói [[temperature|nhiệt độ]] có thể lên tới 35 [[Celsius|độ C]], nhưng buổi chiều thường có một [[breeze|cơn gió nhẹ]] [[pleasant|dễ chịu]] làm dịu bớt cái nóng.

Mùa [[rainy|mưa]] thì lại khác hẳn. Có khi chỉ là [[drizzle|mưa phùn]] lất phất, nhưng cũng có lúc đổ [[shower|mưa rào]] nặng hạt. Những đám [[cloud|mây]] đen kéo [[approach|đến gần]], khiến thời tiết trở nên [[nasty|khó chịu]] và [[awful|kinh khủng]].

Vào [[middle|giữa]] mùa, một cơn [[typhoon|bão nhiệt đới]] có thể gây ra [[flood|lũ lụt]], và mưa [[last|kéo dài]] suốt một [[period|khoảng thời gian]] dài. Nhưng đến [[end|cuối]] mùa, bầu trời lại trong xanh trở lại.`,
  },
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
    content: "Dạo này tôi làm việc [[hard|chăm chỉ]] nên [[quite|khá]] [[stressful|căng thẳng]], đầu óc lúc nào cũng như một [[detective|thám tử]] đi soi từng lỗi sai. Tôi [[obsess|ám ảnh]] với công việc đến mức [[forget|quên]] ăn trưa, [[waste|lãng phí]] cả những giờ [[free|rảnh rỗi]] hiếm hoi. Bạn gái nhắc tôi phải nghỉ ngơi cho [[proper|đúng cách]], đừng để cơ thể bị [[defeat|đánh bại]] vì mệt mỏi. Đến [[noon|buổi trưa]], cô ấy kéo tôi rời bàn làm việc để có một [[break|giờ nghỉ]] thật sự.\n\nCô ấy bảo tôi [[lie|nằm]] xuống, nhắm mắt và [[imagine|tưởng tượng]] một bãi biển [[silent|im lặng]]. Tôi hít thở chậm, thấy lòng dần [[calm|bình tĩnh]] hơn khi cùng cô ấy [[meditate|thiền]] vài phút. Cô ấy nói thư giãn không phải là [[lazy|lười biếng]], mà giúp ta [[active|năng động]] hơn, và [[relaxation|sự thư giãn]] nên được giữ [[through|xuyên suốt]] cả ngày. Tối đó tôi [[sleep|ngủ]] rất sâu, có một [[dream|giấc mơ]] đẹp, và sáng dậy thấy mình đã được [[rest|nghỉ ngơi]] đầy đủ.",
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
