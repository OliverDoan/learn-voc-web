# 📚 Vocabulary Learning Web App — Specification

> **Mục tiêu**: Xây dựng một web app cá nhân để ôn từ vựng hiệu quả, kết hợp Spaced Repetition (SRS), nhiều dạng bài tập, thống kê chi tiết và gamification.

---

## 1. Tech Stack

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Framework | **Next.js 14+ (App Router) + TypeScript** | Fullstack 1 repo, deploy Vercel free |
| Styling | **Tailwind CSS + shadcn/ui** | UI đẹp, component sẵn, customize được |
| State | **Zustand** | Nhẹ, dễ dùng cho client state |
| Data fetching | **TanStack Query** | Cache, optimistic update |
| Database | **SQLite + Prisma** (local) hoặc **Supabase** (cloud) | Type-safe ORM |
| Auth (optional) | **NextAuth** với Google provider | Nếu muốn deploy public |
| Animation | **Framer Motion** | Card flip, transitions mượt |
| Charts | **Recharts** | Dashboard thống kê |
| Icons | **Lucide React** | Đồng bộ với shadcn |
| TTS | **Web Speech API** (browser native) | Miễn phí, không cần API key |
| Dictionary API | **Free Dictionary API** (`api.dictionaryapi.dev`) | Lấy nghĩa + audio tự động |
| Deploy | **Vercel** | Free tier đủ dùng |

---

## 2. Database Schema (Prisma)

```prisma
model Deck {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#3b82f6")
  icon        String?  // emoji
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  cards       Card[]
}

model Card {
  id          String   @id @default(cuid())
  deckId      String
  deck        Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)

  // Nội dung
  word        String
  meaning     String   // nghĩa tiếng Việt
  partOfSpeech String? // noun, verb, adj...
  phonetic    String?  // IPA
  example     String?
  exampleTranslation String?
  note        String?
  imageUrl    String?
  audioUrl    String?
  tags        String[] // ["business", "B2"]

  // SRS fields (thuật toán SM-2)
  easeFactor  Float    @default(2.5)
  interval    Int      @default(0)   // số ngày tới lần ôn tiếp
  repetitions Int      @default(0)   // số lần ôn liên tiếp đúng
  nextReviewDate DateTime @default(now())
  state       CardState @default(NEW) // NEW, LEARNING, REVIEW, MATURE, SUSPENDED
  lapses      Int      @default(0)   // số lần quên

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  reviewLogs  ReviewLog[]
}

enum CardState {
  NEW
  LEARNING
  REVIEW
  MATURE
  SUSPENDED
}

model ReviewLog {
  id          String   @id @default(cuid())
  cardId      String
  card        Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  rating      Int      // 1=Again, 2=Hard, 3=Good, 4=Easy
  reviewedAt  DateTime @default(now())
  timeTakenMs Int      // thời gian phản hồi
  previousInterval Int
  newInterval Int
}

model DailyStat {
  id              String   @id @default(cuid())
  date            DateTime @unique
  cardsReviewed   Int      @default(0)
  cardsLearned    Int      @default(0)   // từ MỚI đã học
  correctCount    Int      @default(0)
  totalCount      Int      @default(0)
  timeSpentSec    Int      @default(0)
  xpEarned        Int      @default(0)
}

model UserProgress {
  id              String   @id @default("singleton") // chỉ 1 record vì cá nhân dùng
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastStudyDate   DateTime?
  totalXp         Int      @default(0)
  level           Int      @default(1)
  dailyGoal       Int      @default(20)  // mục tiêu từ/ngày
  freezeTokens    Int      @default(2)   // streak freeze
}

model Achievement {
  id          String   @id
  unlockedAt  DateTime @default(now())
}

// ⭐ Truyện chêm (Code-switching story) — học từ qua ngữ cảnh
model Story {
  id          String   @id @default(cuid())
  deckId      String
  deck        Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)

  title       String
  content     String   @db.Text  // nội dung truyện có markup từ chêm: "Tôi đi [[apple|quả táo]] và..."
  imageUrl    String?  // hình minh họa
  audioUrl    String?  // file audio đọc truyện (optional, có thể TTS)

  // Tracking học truyện
  readCount   Int      @default(0)
  lastReadAt  DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Liên kết tới các card được chêm trong truyện
  storyCards  StoryCard[]
}

model StoryCard {
  id        String @id @default(cuid())
  storyId   String
  story     Story  @relation(fields: [storyId], references: [id], onDelete: Cascade)
  cardId    String
  card      Card   @relation(fields: [cardId], references: [id], onDelete: Cascade)
  order     Int    // thứ tự xuất hiện trong truyện

  @@unique([storyId, cardId])
}
```

> Cập nhật `Deck`: thêm `stories Story[]`
> Cập nhật `Card`: thêm `storyCards StoryCard[]`

---

## 3. SRS Algorithm — SM-2 (Anki-style)

```typescript
// File: lib/srs.ts
interface SRSInput {
  rating: 1 | 2 | 3 | 4;  // Again / Hard / Good / Easy
  easeFactor: number;     // mặc định 2.5
  interval: number;       // ngày
  repetitions: number;
}

interface SRSOutput {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  newState: CardState;
}

export function calculateNextReview(input: SRSInput): SRSOutput {
  let { rating, easeFactor, interval, repetitions } = input;

  if (rating === 1) {
    // Again — quên, reset
    repetitions = 0;
    interval = 1; // ôn lại sau 1 ngày (hoặc 10 phút nếu LEARNING)
  } else {
    // Hard / Good / Easy
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    repetitions += 1;

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Hard giảm interval
    if (rating === 2) interval = Math.max(1, Math.round(interval * 1.2));
    // Easy tăng interval
    if (rating === 4) interval = Math.round(interval * 1.3);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  // Xác định state
  let newState: CardState = 'LEARNING';
  if (interval >= 21) newState = 'MATURE';
  else if (repetitions >= 1) newState = 'REVIEW';

  return { easeFactor, interval, repetitions, nextReviewDate, newState };
}
```

**Rule lựa chọn card cho session hôm nay:**
1. Lấy hết card có `nextReviewDate <= today` (review queue)
2. Thêm tối đa N card NEW (theo daily goal, default 20)
3. Trộn ngẫu nhiên hoặc theo state (new → learning → review)

---

## 4. Cấu trúc thư mục

```
/app
  /(dashboard)
    /page.tsx                 # Trang chủ - Dashboard
    /decks
      /page.tsx               # Danh sách decks
      /[deckId]
        /page.tsx             # Chi tiết deck + list cards
        /edit/page.tsx        # Edit deck
    /study
      /[deckId]/page.tsx      # Màn hình học (flashcard)
      /quiz/[deckId]/page.tsx # Quiz nhiều dạng
    /stats/page.tsx           # Thống kê chi tiết
    /achievements/page.tsx    # Huy hiệu
    /settings/page.tsx
  /api
    /cards/route.ts           # CRUD card
    /decks/route.ts
    /review/route.ts          # POST kết quả ôn
    /stats/route.ts
    /import/route.ts          # Import CSV
    /dictionary/route.ts      # Proxy tới Free Dictionary API

/components
  /flashcard/
    Flashcard.tsx             # Card lật 3D
    RatingButtons.tsx         # 4 nút Again/Hard/Good/Easy
  /quiz/
    MultipleChoice.tsx
    TypingQuiz.tsx
    ListeningQuiz.tsx
    MatchingGame.tsx
  /dashboard/
    StreakBadge.tsx
    DailyProgress.tsx
    Heatmap.tsx
    StatsChart.tsx
  /deck/
    DeckCard.tsx
    AddCardDialog.tsx
    ImportDialog.tsx
  /ui/                        # shadcn components

/lib
  /srs.ts                     # Thuật toán SM-2
  /tts.ts                     # Web Speech API wrapper
  /dictionary.ts              # Fetch định nghĩa
  /db.ts                      # Prisma client
  /xp.ts                      # Tính XP, level
  /achievements.ts            # Logic mở khóa

/stores
  /studySession.ts            # Zustand: state session hiện tại
  /userProgress.ts

/prisma
  /schema.prisma
```

---

## 5. Chi tiết các màn hình

### 5.1 Dashboard (Trang chủ)
**Components hiển thị:**
- **Header**: lời chào theo giờ + avatar
- **Streak badge** (🔥 X ngày liên tiếp) — animation khi tăng
- **Daily progress bar**: X/20 từ hôm nay
- **3 card lớn**:
  - Cần ôn: N từ → nút "Bắt đầu ôn"
  - Từ mới: M từ chưa học
  - Mục tiêu hôm nay: progress %
- **Quick stats**: Total words, Mature words, Accuracy 7 ngày
- **Heatmap** GitHub-style 365 ngày
- **Danh sách deck** dạng grid card có màu

### 5.2 Màn hình Study (Flashcard mode)
- **Layout center**:
  - Progress bar trên cùng (3/20)
  - Card lớn ở giữa — front: từ + phonetic + loa 🔊
  - Click hoặc Space để lật → meaning + example + image
  - **4 nút rating**: Again (đỏ) / Hard (cam) / Good (xanh) / Easy (xanh đậm)
  - Hiển thị interval dự kiến trên mỗi nút: "Again: 1d, Hard: 3d..."
- **Keyboard shortcut**: Space lật, 1/2/3/4 rating
- **Animation**: Framer Motion card flip 3D + slide ra khi rating

### 5.3 Quiz mode (chọn 1 trong 4 dạng)

**A. Multiple Choice**
- Hiển thị nghĩa → chọn 1 trong 4 từ
- Hoặc ngược lại: từ → 4 nghĩa
- Sai thì highlight đáp án đúng

**B. Typing**
- Hiển thị nghĩa → gõ từ
- Levenshtein distance ≤ 2 vẫn pass (sai chính tả nhẹ)
- Show diff khi sai

**C. Listening**
- TTS đọc từ → user gõ lại
- Nút "Nghe lại" tối đa 3 lần

**D. Matching Game**
- Grid 6 cặp: 6 từ bên trái, 6 nghĩa bên phải
- Click 2 ô để match, đúng thì ẩn, sai thì lắc
- Tính thời gian → leaderboard cá nhân

### 5.4 Thêm/Sửa từ
- Input từ → debounce 500ms → gọi Dictionary API → auto-fill phonetic, meaning (gợi ý), audio
- Field: word, meaning, part of speech, phonetic, example, note, tags, image
- Button "Generate example with AI" (tùy chọn, gọi Claude API)

### 5.5 Stats page
- **Tổng quan**: 4 metric card (Tổng từ, Đã thuộc, Streak hiện tại, Streak dài nhất)
- **Biểu đồ cột**: số từ ôn theo ngày (7d / 30d / 90d / 1y)
- **Pie chart**: phân bố state (New / Learning / Review / Mature)
- **Line chart**: accuracy theo thời gian
- **Bảng**: top 10 từ hay quên (sort by lapses)
- **Heatmap** 365 ngày

### 5.6 Achievements
- Grid huy hiệu (locked/unlocked với hiệu ứng grayscale)
- Ví dụ:
  - 🌱 First Step — học từ đầu tiên
  - 💯 Century — 100 từ
  - 🔥 On Fire — streak 7 ngày
  - 🏆 Marathon — streak 30 ngày
  - 🧠 Brain Master — 500 từ mature
  - ⚡ Speed Demon — hoàn thành quiz dưới 30s
  - 🎯 Perfectionist — 50 lần review liên tiếp đúng

---

## 6. ⭐ Tính năng Truyện chêm (Code-switching Story)

> **Phương pháp**: Mỗi unit (24 từ chẳng hạn) sẽ có 1 truyện ngắn tiếng Việt, trong đó các từ cần học được "chêm" bằng tiếng Anh. Kèm 1 hình minh họa để tạo neo trí nhớ. Đây là cách học cực hiệu quả vì gắn từ vào ngữ cảnh + cảm xúc + hình ảnh.

### 6.1 Cú pháp markup từ chêm

Lưu nội dung truyện dạng plain text với markup `[[word|nghĩa]]`:

```
Sáng nay tôi [[wake up|thức dậy]] lúc 6 giờ, cảm thấy rất [[exhausted|kiệt sức]]
vì hôm qua đi [[hiking|leo núi]] với nhóm bạn. Tôi quyết định pha một ly
[[coffee|cà phê]] và ngồi ngoài [[balcony|ban công]] ngắm bình minh.
```

Khi render:
- `[[wake up|thức dậy]]` → highlight **wake up** màu primary, hover/tap hiện tooltip "thức dậy"
- Click vào từ → mở mini-card popup hiển thị: phonetic, audio, ví dụ, nghĩa đầy đủ
- Có thể "đánh dấu đã thuộc" ngay từ trong truyện

### 6.2 Tạo truyện (Editor)

**Workflow:**
1. Trong trang deck, click "Tạo truyện mới"
2. Chọn các card sẽ chêm (multi-select từ list 24 từ)
3. Editor có 2 mode:
   - **Markdown mode**: gõ trực tiếp `[[word|nghĩa]]`
   - **Rich mode**: gõ truyện tiếng Việt → bôi đen từ → nhấn nút "Chêm từ" → chọn card từ dropdown → tự động insert markup
4. Upload ảnh minh họa (drag-drop) — lưu vào `/public/uploads/` hoặc Supabase Storage
5. Preview real-time bên phải
6. **AI assist** (optional): nút "Tạo truyện bằng AI" — gửi list 24 từ + prompt → Claude API gen truyện chêm phù hợp

**UI Editor đề xuất:**
```
┌──────────────────────────┬──────────────────────────┐
│ EDITOR                   │ PREVIEW                  │
│ ┌──────────────────────┐ │ ┌──────────────────────┐ │
│ │ [Image upload]       │ │ │  [Image displayed]   │ │
│ └──────────────────────┘ │ └──────────────────────┘ │
│                          │                          │
│ Title: ___________       │ # Title                  │
│                          │                          │
│ Sáng nay tôi [[wake up|  │ Sáng nay tôi **wake up** │
│ thức dậy]] lúc 6 giờ...  │ lúc 6 giờ...             │
│                          │                          │
│ [Chêm từ ▼] [AI gen]     │  Words used: 5/24 ✓      │
└──────────────────────────┴──────────────────────────┘
```

### 6.3 Màn hình đọc truyện (Story View)

**Layout:**
- Top: hình minh họa full-width (max-height 300px)
- Tiêu đề + meta (số từ chêm, lần đọc)
- Toggle controls:
  - 🔊 **Đọc to** (TTS toàn bài, có highlight đang đọc đến đâu)
  - 👁️ **Hiện/ẩn nghĩa** — toggle hiện hết tooltip nghĩa Việt
  - 🎯 **Chế độ kiểm tra** — ẩn từ chêm (chỉ hiện gạch chân) → click để hiện
- Nội dung truyện:
  - Từ chêm hiển thị **bold + màu primary + underline dotted**
  - Hover/tap → tooltip nhỏ hiện nghĩa
  - Long-press hoặc click → mở Card Detail Modal (full info)
- Bottom: nút "Đã đọc xong" → cộng XP + tăng readCount

### 6.4 Chế độ học tích hợp Story + Flashcard

Sau khi đọc truyện, app tự đề xuất:
1. **Ôn nhanh** các từ trong truyện → mini flashcard session
2. **Fill-in-the-blank quiz**: hiện truyện với từ chêm bị ẩn, user gõ vào
3. **Recall quiz**: hiện hình minh họa → liệt kê các từ nhớ được

### 6.5 AI Generate Story (tính năng "wow")

**Prompt template gửi Claude API:**
```typescript
const prompt = `
Tạo một truyện ngắn tiếng Việt (200-300 từ) theo phương pháp "truyện chêm",
trong đó CHÊM TIẾNG ANH các từ sau vào ngữ cảnh tự nhiên:

Danh sách từ: ${words.map(w => `${w.word} (${w.meaning})`).join(', ')}

Yêu cầu:
- Sử dụng markup [[word|nghĩa tiếng Việt]] cho mỗi từ chêm
- Mỗi từ xuất hiện đúng 1 lần
- Văn phong tự nhiên, dễ hình dung
- Có cốt truyện rõ ràng (mở-thân-kết)
- Chủ đề: ${theme || 'cuộc sống hàng ngày'}

Trả về JSON:
{
  "title": "...",
  "content": "...",
  "imagePrompt": "mô tả ngắn để gen ảnh minh họa"
}
`;
```

Có thể kết hợp **DALL-E / Stable Diffusion API** để auto-gen hình minh họa từ `imagePrompt`.

### 6.6 Cấu trúc data flow

```
Deck (Unit 5: Daily life - 24 từ)
├── Cards (24 từ)
│   ├── wake up
│   ├── exhausted
│   └── ...
└── Stories
    ├── Story 1: "Buổi sáng yên bình" (chêm 12 từ)
    └── Story 2: "Chuyến đi cuối tuần" (chêm 12 từ còn lại)
```

**Best practice gợi ý cho user:**
- Mỗi truyện chêm 8-15 từ là vừa (quá nhiều khó đọc)
- 24 từ/unit → 2-3 truyện
- Mỗi từ nên xuất hiện ở ít nhất 1 truyện

---

## 7. Gamification

### XP System
| Hành động | XP |
|-----------|-----|
| Review đúng (Good) | +5 |
| Review đúng (Easy) | +7 |
| Review đúng (Hard) | +3 |
| Review sai (Again) | +1 |
| Học từ MỚI | +10 |
| Hoàn thành daily goal | +50 |
| Maintain streak | +20 |

### Level
- `level = floor(sqrt(totalXp / 100)) + 1`
- Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, Level 4: 900 XP...

### Streak Rules
- Reset nếu bỏ qua 1 ngày (không học ít nhất 1 từ)
- **Streak Freeze**: được 2 token/tháng, tự động dùng nếu miss

---

## 8. Yêu cầu UI/UX

- **Dark mode** mặc định + toggle light mode
- **Responsive** (mobile-first vì học từ vựng trên điện thoại nhiều)
- **Animations**: subtle, không overdo (Framer Motion)
- **Empty states** đẹp cho mọi list (illustration + CTA)
- **Loading**: skeleton thay vì spinner
- **Toast notifications** cho mọi action (sonner)
- **Keyboard shortcuts** đầy đủ — show modal `?` để xem list
- **Haptic feedback** trên mobile khi rating

### Design tokens
- Primary: `#3b82f6` (blue-500) — có thể đổi
- Success (Good/Easy): green
- Warning (Hard): orange
- Danger (Again): red
- Background dark: `#0a0a0a` / `#171717`
- Font: Inter cho UI, JetBrains Mono cho phonetic

---

## 9. Tính năng phụ (Nice to have)

- **Import CSV/JSON**: dạng `word,meaning,example` (tương thích Anki export)
- **Export** ra CSV để backup
- **Tìm kiếm** global (Cmd+K) — search trong tất cả deck
- **Filter cards** theo state, tag, độ khó
- **Bulk actions**: chọn nhiều card → đổi deck/xóa
- **Hint mode**: hiển thị chữ cái đầu khi quên
- **Reverse cards**: tự sinh card ngược (nghĩa → từ)
- **PWA**: cài như app, học offline

---

## 10. Roadmap triển khai

### Week 1 — Foundation
- [ ] Setup Next.js + Prisma + Tailwind + shadcn
- [ ] Database schema + migrations
- [ ] CRUD Deck + Card UI
- [ ] Dictionary API integration

### Week 2 — Core learning
- [ ] SRS algorithm
- [ ] Flashcard study screen + rating
- [ ] Daily queue logic
- [ ] Multiple choice quiz

### Week 3 — ⭐ Truyện chêm + Stats
- [ ] Story model + CRUD API
- [ ] Story editor với markup `[[word|meaning]]`
- [ ] Story view với tooltip hover/tap
- [ ] Fill-in-the-blank quiz từ story
- [ ] Dashboard + stats charts
- [ ] Heatmap component

### Week 4 — More quiz + Gamification
- [ ] Typing, Listening, Matching quiz
- [ ] Streak, XP, Level system
- [ ] Achievements
- [ ] Dark mode + responsive polish
- [ ] Import/Export

### Week 5+ — Advanced
- [ ] AI-generated story (Claude API)
- [ ] AI-generated illustration (DALL-E/SD)
- [ ] AI-generated examples cho từng card
- [ ] PWA setup
- [ ] Performance optimization

---

## 11. Acceptance Criteria (Phase 1 MVP)

✅ Tạo được deck và thêm từ thủ công
✅ Tự fill nghĩa/phonetic từ Dictionary API
✅ Flashcard hoạt động với 4 rating buttons
✅ SRS schedule đúng theo SM-2
✅ Quiz multiple choice hoạt động
✅ **Tạo & đọc truyện chêm với hình minh họa**
✅ **Tooltip nghĩa khi hover/tap vào từ chêm**
✅ Dashboard hiển thị daily progress + streak
✅ Heatmap 365 ngày
✅ Dark mode
✅ Responsive mobile

---

## 12. Prompt mẫu để gen từng phần

> Khi build, bạn có thể tách prompt theo file. Ví dụ:
>
> **Prompt 1**: "Setup Next.js 14 project with Prisma SQLite, Tailwind, shadcn/ui. Implement the schema from section 2 of the spec."
>
> **Prompt 2**: "Implement the SRS algorithm in `lib/srs.ts` based on section 3, plus unit tests."
>
> **Prompt 3**: "Build the Flashcard study screen as described in section 5.2, with Framer Motion card flip and keyboard shortcuts."
>
> **Prompt 4**: "Build the Dashboard page with streak badge, daily progress, heatmap, and deck grid."

---

**Notes cho dev:**
- Vì chỉ cá nhân dùng → có thể skip auth ban đầu, hardcode `userId = "me"`
- SQLite đủ dùng cho cá nhân, sau scale lên Postgres dễ
- Dùng `date-fns` cho mọi date manipulation
- Mọi API mutation nên invalidate TanStack Query cache
