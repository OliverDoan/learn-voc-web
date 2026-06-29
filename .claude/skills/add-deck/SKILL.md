---
name: add-deck
description: Tạo một deck từ vựng mới (kèm danh sách thẻ) cho app learn-voc-web. Dùng khi người dùng muốn "thêm deck", "tạo deck mới", "thêm bộ từ vựng", "import từ vựng", hoặc đưa một danh sách từ Anh–Việt để tạo thành deck.
---

# Thêm deck từ vựng mới

Tạo một `Deck` mới + toàn bộ `Card` vào DB (PostgreSQL) của app learn-voc-web,
dùng chung validation Zod với API `/api/decks/import`.

## Quy trình

### 1. Thu thập thông tin từ người dùng
Hỏi (hoặc suy ra từ yêu cầu) các thông tin sau:
- **Tên deck** (bắt buộc, ≤ 80 ký tự). Quy ước hiện tại: `"Unit N: Chủ đề"` (vd `"Unit 16: Sức khoẻ"`).
- **Mô tả** (tuỳ chọn, ≤ 300).
- **Màu** hex `#RRGGBB` (mặc định `#3b82f6`) và **icon** emoji (tuỳ chọn, ≤ 8 ký tự).
- **Danh sách từ vựng**: mỗi từ tối thiểu cần `word` (tiếng Anh) + `meaning` (nghĩa tiếng Việt).

Nếu người dùng chỉ đưa danh sách "word — nghĩa", hãy hỏi xem có muốn mình **tự bổ sung**
`phonetic`, `partOfSpeech`, `example`, `exampleTranslation` không (có thể tự soạn). Đừng bịa
`phonetic` nếu không chắc — để trống còn hơn sai.

### 2. Soạn file JSON
Ghi ra một file tạm (vd `tmp-deck.json` ở gốc dự án) theo đúng định dạng dưới đây.
Tham khảo đầy đủ ở `public/deck-template.json`.

```json
{
  "deck": {
    "name": "Unit 16: Sức khoẻ",
    "description": "24 từ vựng chủ đề Sức khoẻ",
    "color": "#10b981",
    "icon": "🩺"
  },
  "cards": [
    {
      "word": "healthy",
      "meaning": "khoẻ mạnh",
      "partOfSpeech": "adjective",
      "phonetic": "/ˈhel.θi/",
      "example": "A healthy diet keeps you strong.",
      "exampleTranslation": "Chế độ ăn lành mạnh giúp bạn khoẻ.",
      "note": null,
      "tags": ["health"],
      "wordForms": { "noun": "health", "adjective": "healthy", "adverb": "healthily" }
    }
  ]
}
```

**Field thẻ** (chỉ `word` + `meaning` bắt buộc, còn lại tuỳ chọn):
`word`, `meaning`, `partOfSpeech`, `rootWord`, `rootWordMeaning`, `phonetic`,
`example`, `exampleTranslation`, `note`, `tags` (mảng ≤ 10), `wordForms`/`wordFormMeanings`
(các khoá `noun`/`verb`/`adjective`/`adverb`). Tối đa 1000 thẻ/deck.

### 3. Chạy import
```bash
pnpm add:deck tmp-deck.json
```
Script validate bằng Zod (báo lỗi rõ nếu sai field), tạo deck + thẻ, giữ thứ tự theo file.

### 4. Cập nhật note quan hệ giữa các từ chéo deck
Sau khi thêm từ mới, kiểm tra quan hệ của chúng với từ ở deck khác. Có **2 loại note**
(lưu chung trong field `note`, mỗi loại một dòng marker riêng):

- `📚 Cùng họ từ` — **word family**: derivation (đổi từ loại) hoặc từ ghép cùng gốc.
- `🔗 Từ liên quan` — **đồng nghĩa / cùng trường nghĩa** (vd `chance`↔`opportunity`).

Mở `scripts/add-wordfamily-notes.ts`, thêm cụm mới vào mảng tương ứng (mỗi cụm =
danh sách `word` chính xác, lowercase):
- Word family → thêm vào `FAMILIES`, vd `["healthy", "unhealthy", "health"]`.
- Từ liên quan → thêm vào `RELATED`, vd `["chef", "cook"]` (đầu bếp).

Rồi chạy lại (idempotent — tự xoá dòng marker cũ, chỉ ghi cụm chéo ≥ 2 deck):
```bash
pnpm notes:wordfamily          # DRY-RUN, xem trước
APPLY=1 pnpm notes:wordfamily  # ghi thật vào field note
```
Note hiện dạng `📚 Cùng họ từ: engineering (n) – Unit 2` lúc học. Quy ước:
- **Word family**: A = derivation (luôn thêm), B = từ ghép cùng gốc (`roommate`↔`room`).
- **Từ liên quan**: ưu tiên đồng nghĩa / cùng trường nghĩa rõ ràng; có thể là cặp đối
  lập gần (`modern`↔`traditional`). Tránh nhóm quá rộng gây nhiễu.
- **Trùng từ y hệt khác deck** (cùng `word`, cùng nghĩa) — KHÔNG phải word family;
  báo người dùng cân nhắc xoá bớt, đừng ghi note.
- Cẩn thận **dương tính giả** cùng chữ nhưng khác gốc (vd `career`≠`care`,
  `generous`≠`general`) — không gom.

### 5. Đồng bộ seed + dọn dẹp
```bash
pnpm data:export        # cập nhật prisma/seed-data.json từ DB
```
Rồi **xoá file tạm** `tmp-deck.json`.

### 6. Xác minh
Báo lại cho người dùng: tên deck, số thẻ đã tạo. Có thể kiểm tra nhanh:
```bash
npx tsx --env-file=.env -e 'import {PrismaClient} from "@prisma/client"; const p=new PrismaClient(); p.deck.findFirst({where:{name:{contains:"Unit 16"}},include:{_count:{select:{cards:true}}}}).then(d=>{console.log(d?.name, d?._count.cards);return p.$disconnect()})'
```

## Lưu ý
- DB là **PostgreSQL** (`DATABASE_URL`), không phải SQLite. Mọi script đọc DB phải chạy kèm `--env-file=.env` (npm script `add:deck` đã có sẵn).
- Có thể tạo thêm **truyện chêm** cho deck mới bằng pattern trong `scripts/seed-stories.ts` (markup `[[word|nghĩa]]`, mỗi từ khớp `card.word`).
- App ở chế độ 1 người dùng — không cần auth.
- KHÔNG đọc/ghi `.env`.
