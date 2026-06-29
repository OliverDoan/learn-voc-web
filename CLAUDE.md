# Vocabulary Learning Web App

> Web app cá nhân ôn từ vựng với Spaced Repetition (SRS), nhiều dạng quiz, truyện chêm, gamification.
> Spec gốc: `vocab-app-spec.md`

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (client), TanStack Query (server cache)
- **DB**: PostgreSQL (Neon) + Prisma — connection qua `DATABASE_URL` (file `prisma/dev.db` SQLite cũ đã bỏ, không dùng nữa)
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **TTS**: Web Speech API (native)
- **Dictionary**: Free Dictionary API (`api.dictionaryapi.dev`)
- **Toast**: sonner
- **Date**: date-fns
- **Package manager**: pnpm

## Commands

```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # ESLint
pnpm prisma:migrate   # prisma migrate dev
pnpm prisma:studio    # prisma studio
pnpm test             # Vitest tests
```

## Single-user mode

App này dùng cá nhân nên SKIP auth. Hardcode `userId = "me"` ở tầng API nếu cần. `UserProgress` là singleton (`id = "singleton"`).

## Folder Structure

```
app/
  (dashboard)/
    page.tsx                  # Dashboard
    decks/page.tsx            # Danh sách decks
    decks/[deckId]/page.tsx   # Chi tiết deck + cards
    study/[deckId]/page.tsx   # Flashcard study
    quiz/[deckId]/page.tsx    # Quiz nhiều dạng
    stats/page.tsx            # Thống kê
    stories/[storyId]/page.tsx # Đọc truyện chêm
  api/
    decks/route.ts            # CRUD deck
    cards/route.ts            # CRUD card
    review/route.ts           # POST kết quả ôn
    stats/route.ts            # Thống kê
    dictionary/route.ts       # Proxy Dictionary API
    stories/route.ts          # CRUD truyện
components/
  flashcard/                  # Flashcard, RatingButtons
  quiz/                       # MultipleChoice, TypingQuiz, ...
  dashboard/                  # StreakBadge, DailyProgress, Heatmap
  deck/                       # DeckCard, AddCardDialog
  story/                      # StoryEditor, StoryView, TokenTooltip
  ui/                         # shadcn components
lib/
  srs.ts                      # SM-2 algorithm
  tts.ts                      # Web Speech API wrapper
  dictionary.ts               # Fetch định nghĩa
  db.ts                       # Prisma client singleton
  achievements.ts             # Logic mở khóa
  story-parser.ts             # Parse [[word|nghĩa]] markup
stores/
  studySession.ts             # Zustand: session hiện tại
prisma/
  schema.prisma
```

## Database Schema (key models)

Xem `vocab-app-spec.md` section 2. Tóm tắt models:

- `Deck` — danh mục từ
- `Card` — từng từ (SRS fields: easeFactor, interval, repetitions, nextReviewDate, state, lapses)
- `CardState` enum: `NEW | LEARNING | REVIEW | MATURE | SUSPENDED`
- `ReviewLog` — lịch sử ôn
- `DailyStat` — thống kê ngày
- `UserProgress` — singleton: profile (displayName/avatarUrl/bio), streak, dailyGoal, freezeTokens
- `Achievement` — huy hiệu mở khóa
- `Story` — truyện chêm (content có markup `[[word|nghĩa]]`)
- `StoryCard` — link Story ↔ Card

> `tags`/`synonyms`/`antonyms` lưu dạng JSON string (parse khi đọc) cho gọn — giữ từ thời SQLite, vẫn dùng vậy trên Postgres.

## SRS Algorithm (SM-2)

File `lib/srs.ts`. Input: `{ rating: 1|2|3|4, easeFactor, interval, repetitions }` → Output: `{ easeFactor, interval, repetitions, nextReviewDate, newState }`.

Quy tắc:
- `rating === 1` (Again): reset repetitions=0, interval=1
- Else: tính theo SM-2, bound easeFactor ≥ 1.3
- `interval >= 21` → `MATURE`, else nếu `repetitions ≥ 1` → `REVIEW`, else `LEARNING`

Daily queue: lấy card `nextReviewDate ≤ now` + tối đa N card NEW theo `dailyGoal`.

## Story markup

Cú pháp: `[[word|nghĩa]]`. Parser tách thành tokens: plain text hoặc word token.

Ví dụ: `Tôi [[apple|quả táo]]` → `[{type:"text", text:"Tôi "}, {type:"word", word:"apple", meaning:"quả táo"}]`

Render: word token = `<button class="font-bold text-primary underline-dotted">apple</button>` với tooltip nghĩa.

## Conventions

- **Tiếng Việt** cho UI, error message, comment khi phù hợp
- **Immutability**: dùng spread, Prisma trả về object mới
- **Validation**: Zod cho mọi user input (frontend + API)
- **Error handling**: try/catch ở API route, log chi tiết, trả về JSON `{ error: string }`
- **Toast**: dùng sonner cho mọi action success/error
- **Cache**: TanStack Query `invalidateQueries` sau mỗi mutation
- **Theme**: dark mode mặc định
- **Date**: dùng `date-fns`, không tự format
- **Files**: 200-400 line typical, max 800
- **Test**: Vitest cho `lib/srs.ts` và utility functions, target 80%+

## Restricted Files

- KHÔNG đọc/ghi `.env*` (trừ `.env.example`)
- Khi thêm env mới: cập nhật `.env.example` + `lib/env.ts` + báo user

## Phase Roadmap

- ✅ **Phase 0**: Setup Next.js + deps + Prisma schema + migration
- ✅ **Phase 1**: CRUD Deck/Card + Dictionary API + UI list/detail
- ✅ **Phase 2**: SRS algorithm (15 tests) + Flashcard study + daily queue
- ✅ **Phase 3**: Quiz multiple choice + typing + listening
- ✅ **Phase 4**: Story (truyện chêm) — editor + view + fill-in-blank quiz
- ✅ **Phase 5**: Dashboard + stats charts + heatmap 365 ngày + achievements
- 🔄 **Phase 6 — IELTS module** (band 5.0 – 6.5)
  - ✅ 6.1 Foundation: trang `/ielts` overview + 4 sub-page guide (Listening / Reading / Writing / Speaking) + `lib/ielts-content.ts`
  - ⏳ 6.2 Reading practice: schema `ReadingPassage` + `ReadingQuestion`, MCQ / T-F-NG / Matching
  - ⏳ 6.3 Listening practice: schema `ListeningTest` + audio storage, fill-in-blank + MCQ
  - ⏳ 6.4 Writing practice: `WritingPrompt` + `WritingSubmission`, AI chấm (Claude API)
  - ⏳ 6.5 Speaking practice: `SpeakingPrompt` + `SpeakingRecording`, MediaRecorder + AI chấm

## Quick start

```bash
pnpm install
pnpm prisma:migrate    # Init DB nếu chưa có
pnpm db:seed           # Tạo deck mẫu "Daily Life" + truyện
pnpm dev               # http://localhost:3000
pnpm test              # 32 unit tests pass
```

## Còn thiếu (nice-to-have, chưa làm)

- Matching game quiz (3/4 dạng đã có)
- Import/Export CSV
- AI generate story (Claude API)
- DALL-E / image gen
- PWA setup
- Search global (Cmd+K)
- Reverse cards
