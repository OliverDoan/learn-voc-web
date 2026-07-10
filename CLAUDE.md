# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Vocabulary Learning Web App

> Web app cá nhân ôn từ vựng với Spaced Repetition (SRS), nhiều dạng quiz, truyện chêm, gamification.
> Spec gốc: `vocab-app-spec.md`

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (server cache, qua `hooks/`) + React local state. `stores/` hiện trống — KHÔNG còn dùng Zustand dù một số deps cũ còn trong package.json.
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
pnpm dev                       # Dev server
pnpm build                     # prisma generate + migrate deploy + next build (build CHẠY migrate!)
pnpm lint                      # ESLint
pnpm prisma:migrate            # prisma migrate dev (tạo migration khi đổi schema)
pnpm prisma:studio             # prisma studio
pnpm test                      # Vitest (chạy 1 lần)
pnpm test:watch                # Vitest watch
pnpm test lib/__tests__/srs.test.ts   # Chạy 1 file test
pnpm vitest run -t "tên test"         # Chạy 1 test theo tên
```

### Data / seed scripts (đều dùng `tsx --env-file=.env scripts/*.ts`)

```bash
pnpm db:seed          # Seed deck + truyện mẫu
pnpm add:deck         # Thêm deck từ script
pnpm import:vocab     # Import bộ từ vựng
pnpm gen:examples     # Sinh câu ví dụ (AI)
pnpm gen:synonyms     # Sinh đồng nghĩa (AI)
pnpm gen:root-meanings# Sinh nghĩa từ gốc (AI)
pnpm data:export      # Xuất toàn bộ data ra file
pnpm data:load        # Nạp lại data từ file
pnpm sync:card-order  # Đồng bộ thứ tự thẻ
```

> Các script AI (`gen:*`) gọi Claude API — cần key trong `.env`. Đọc script tương ứng trong `scripts/` trước khi chạy.

## Single-user mode

App này dùng cá nhân nên SKIP auth. Hardcode `userId = "me"` ở tầng API nếu cần. `UserProgress` là singleton (`id = "singleton"`).

## Architecture (big picture)

Luồng dữ liệu **DB-backed** (deck/card/story/review/progress):

```
Component ─▶ hook (hooks/use-*.ts, TanStack Query) ─▶ lib/api-client.ts (apiFetch/apiPost/apiPatch/apiDelete)
          ─▶ app/api/**/route.ts (validate Zod từ lib/schemas.ts) ─▶ lib/db.ts (Prisma singleton) ─▶ Postgres
```

- **Component KHÔNG gọi `fetch` trực tiếp** — luôn qua hook trong `hooks/`. Hook nào cũng bọc TanStack Query quanh `api-client`.
- Mỗi mutation `invalidateQueries` các query key liên quan (key khai báo ngay trong file hook, vd `ALL_WORDS_KEY`, `TRASH_KEY`).
- API route handler: validate input bằng Zod (`lib/schemas.ts`) → thao tác Prisma → trả JSON. Lỗi trả `{ error: string }`.

Luồng **nội dung tĩnh** (KHÔNG dùng DB) — pattern quan trọng, nhiều tính năng "tham khảo" chỉ là dữ liệu TS thuần trong `lib/`, render bởi 1 page client:

- `lib/grammar/*` → `/grammar` (19 chương ngữ pháp)
- `lib/ielts-content.ts` → `/ielts` + 4 sub-page
- `lib/word-formation.ts`, `lib/word-forms.ts` → `/word-formation`
- `lib/confusing-words.ts` → `/confusing-words` (Từ dễ lẫn)
- `lib/mistakes-data.ts` → `/mistakes` (Xem lỗi sai — mảng chỉnh tay)
- `lib/dialect-data.ts`, `lib/focus-themes.ts`

> Thêm một trang "tham khảo" mới = thêm 1 file dữ liệu trong `lib/` + 1 page client + 1 mục trong `components/nav.tsx`. Không đụng DB/API. Lịch sử "từ sai khi kiểm tra" (`lib/test-history.ts`) lưu ở **localStorage** theo deck, cũng không dùng DB.

## Folder Structure

```
app/(dashboard)/    # Mọi trang (dashboard, decks, study, quiz, flashcards, pronounce,
                    # story-fill, stories, stats, grammar, ielts, word-formation, word-roots,
                    # confusing-words, mistakes, favorites, history, search, trash, settings)
app/focus/          # Chế độ Pomodoro toàn màn hình (ngoài layout dashboard)
app/api/**/route.ts # Route handlers REST (cards, decks, stories, review, study, stats,
                    # progress, search, weak-words, history, dictionary proxy)
hooks/              # TANG DATA: use-cards, use-decks, use-stories, use-progress, use-study,
                    # use-history, use-weak-words, use-pomodoro, use-speech-recognition...
components/         # Theo domain: deck/ quiz/ flashcard/ story/ dashboard/ grammar/ ielts/
                    # mistakes/ focus/ search/ settings/ + ui/ (shadcn) + nav.tsx, command-palette.tsx
lib/                # srs.ts, db.ts (Prisma singleton), api-client.ts, schemas.ts (Zod),
                    # tts.ts, dictionary.ts, story-parser.ts, achievements.ts + dữ liệu tĩnh (trên)
prisma/schema.prisma
scripts/            # Script tsx cho seed / import / gen bằng AI / export-load
```

## Database Schema (key models)

Xem `vocab-app-spec.md` section 2. Tóm tắt models:

- `Deck` — danh mục từ (`learned`, `locked`, `exercisesDone` → khoá/mở deck & cổng bài tập)
- `DeckActivity` — nhật ký hoạt động trong deck
- `ExerciseAttempt` — lượt làm từng dạng bài tập của deck (gate cho "đánh dấu học xong")
- `Card` — từng từ (SRS fields: easeFactor, interval, repetitions, nextReviewDate, state, lapses)
- `CardState` enum: `NEW | LEARNING | REVIEW | MATURE | SUSPENDED`
- `ReviewLog` — lịch sử ôn
- `DailyStat` — thống kê ngày
- `UserProgress` — singleton: profile (displayName/avatarUrl/bio), streak, dailyGoal, freezeTokens
- `Achievement` — huy hiệu mở khóa
- `Story` — truyện chêm (content có markup `[[word|nghĩa]]`)
- `StoryCard` — link Story ↔ Card

> **Deck locking**: deck bị `locked` cho đến khi hoàn thành các Unit trước; nút "Đánh dấu học xong" chỉ bật khi `exercisesDone`. Xem `lib/deck-progress.ts`, `lib/deck-activities.ts`, `components/deck/deck-exercise-progress.tsx`.

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
pnpm test              # unit tests (11 file trong lib/__tests__)
```

## Còn thiếu (nice-to-have, chưa làm)

- Matching game quiz (3/4 dạng đã có)
- AI generate story (Claude API)
- DALL-E / image gen
- Reverse cards

> Search global (Cmd+K, `command-palette.tsx`), Import/Export (dialog trong `components/deck/`) và PWA (`components/pwa-register.tsx`) ĐÃ làm.
