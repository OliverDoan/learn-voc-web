import { PrismaClient } from "@prisma/client";
import { extractWords } from "../lib/story-parser";

const prisma = new PrismaClient();

// Mỗi truyện dùng ĐÚNG card.word trong markup [[word|nghĩa]] để link đủ thẻ.
// Mạch truyện xuyên suốt 20 unit: Unit 1–5 là hành trình của Naruto (du học →
// đi học → quê hương/biệt danh → nghề nghiệp → tìm việc); Unit 6 trở đi chuyển
// sang Hinata rồi ngôi thứ nhất "tôi" & bạn gái (chi tiêu → thủ đô → căn hộ →
// khu phố → du lịch → lễ hội → văn hoá → thời tiết → ẩm thực → ăn uống lành mạnh).
//
// NGUYÊN TẮC VIẾT: giữ ĐỦ toàn bộ từ/unit, nhưng ưu tiên câu văn xuôi tự nhiên,
// có từ nối, đọc trôi chảy dễ hiểu (thay cho lối chêm từ san sát trước đây).
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
