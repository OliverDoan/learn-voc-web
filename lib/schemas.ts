import { z } from "zod";

export const deckCreateSchema = z.object({
  name: z.string().trim().min(1, "Tên không được trống").max(80),
  description: z.string().trim().max(300).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Màu phải dạng hex #RRGGBB")
    .default("#3b82f6"),
  icon: z.string().max(8).optional().nullable(),
  // JSON cột tùy chỉnh dạng bảng — lưu dạng chuỗi, parse khi đọc
  customColumns: z.string().max(200_000).optional(),
});

export const deckUpdateSchema = deckCreateSchema.partial();

export type DeckCreateInput = z.infer<typeof deckCreateSchema>;
export type DeckUpdateInput = z.infer<typeof deckUpdateSchema>;

export const wordFormsSchema = z
  .object({
    noun: z.string().trim().max(120).optional().nullable(),
    verb: z.string().trim().max(120).optional().nullable(),
    adjective: z.string().trim().max(120).optional().nullable(),
    adverb: z.string().trim().max(120).optional().nullable(),
  })
  .partial();

export type WordFormsInput = z.infer<typeof wordFormsSchema>;

// Nghĩa tiếng Việt cho từng dạng từ — cùng cấu trúc, cho phép chuỗi dài hơn.
export const wordFormMeaningsSchema = z
  .object({
    noun: z.string().trim().max(200).optional().nullable(),
    verb: z.string().trim().max(200).optional().nullable(),
    adjective: z.string().trim().max(200).optional().nullable(),
    adverb: z.string().trim().max(200).optional().nullable(),
  })
  .partial();

export type WordFormMeaningsInput = z.infer<typeof wordFormMeaningsSchema>;

export const cardCreateSchema = z.object({
  deckId: z.string().min(1),
  word: z.string().trim().min(1, "Từ không được trống").max(120),
  meaning: z.string().trim().min(1, "Nghĩa không được trống").max(500),
  partOfSpeech: z.string().trim().max(30).optional().nullable(),
  rootWord: z.string().trim().max(120).optional().nullable(),
  rootWordMeaning: z.string().trim().max(200).optional().nullable(),
  phonetic: z.string().trim().max(80).optional().nullable(),
  example: z.string().trim().max(500).optional().nullable(),
  exampleTranslation: z.string().trim().max(500).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  audioUrl: z.string().url().optional().nullable().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  wordForms: wordFormsSchema.optional().nullable(),
  wordFormMeanings: wordFormMeaningsSchema.optional().nullable(),
  synonyms: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  antonyms: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
});

export const cardUpdateSchema = cardCreateSchema
  .partial()
  .omit({ deckId: true })
  .extend({
    favorite: z.boolean().optional(),
    // Bỏ .default([]) của cardCreateSchema: khi update mà không gửi field,
    // phải là undefined (không động tới) thay vì [] (vô tình xoá sạch dữ liệu cũ).
    tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    synonyms: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
    antonyms: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  });

export const cardImportItemSchema = z.object({
  word: z.string().trim().min(1).max(120),
  meaning: z.string().trim().min(1).max(500),
  partOfSpeech: z.string().trim().max(30).optional().nullable(),
  rootWord: z.string().trim().max(120).optional().nullable(),
  rootWordMeaning: z.string().trim().max(200).optional().nullable(),
  phonetic: z.string().trim().max(80).optional().nullable(),
  example: z.string().trim().max(500).optional().nullable(),
  exampleTranslation: z.string().trim().max(500).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  wordForms: wordFormsSchema.optional().nullable(),
  wordFormMeanings: wordFormMeaningsSchema.optional().nullable(),
});

export const cardImportSchema = z.object({
  deckId: z.string().min(1),
  cards: z.array(cardImportItemSchema).min(1, "Không có từ nào để import").max(1000),
});

// Import nguyên deck mới: deck metadata + cards
export const deckImportSchema = z.object({
  deck: deckCreateSchema,
  cards: z.array(cardImportItemSchema).min(1, "Không có từ nào để import").max(1000),
});

export type CardImportItemInput = z.infer<typeof cardImportItemSchema>;
export type CardImportInput = z.infer<typeof cardImportSchema>;
export type DeckImportInput = z.infer<typeof deckImportSchema>;

export type CardCreateInput = z.infer<typeof cardCreateSchema>;
export type CardUpdateInput = z.infer<typeof cardUpdateSchema>;

// Thao tác trên thùng rác: khôi phục hoặc xoá vĩnh viễn
export const trashActionSchema = z.object({
  action: z.enum(["restore", "purge"]),
  ids: z.array(z.string().min(1)).min(1, "Không có thẻ nào được chọn").max(1000),
});

export type TrashActionInput = z.infer<typeof trashActionSchema>;

export const reviewSchema = z.object({
  cardId: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  timeTakenMs: z.number().int().nonnegative().max(60 * 60 * 1000).default(0),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// Ảnh truyện: ảnh tải lên (data URL base64, đã resize) hoặc URL ngoài.
// Giới hạn ~3MB chuỗi để tránh payload quá lớn.
const STORY_IMAGE_MAX_LENGTH = 3_000_000;

const storyImageSchema = z
  .string()
  .max(STORY_IMAGE_MAX_LENGTH, "Ảnh quá lớn")
  .refine(
    (v) => v === "" || v.startsWith("data:image/") || /^https?:\/\//.test(v),
    "Ảnh phải là ảnh tải lên hoặc URL hợp lệ",
  )
  .optional()
  .nullable();

export const storyCreateSchema = z.object({
  deckId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(5000),
  imageUrl: storyImageSchema,
  audioUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const storyUpdateSchema = storyCreateSchema.partial().omit({ deckId: true });

export type StoryCreateInput = z.infer<typeof storyCreateSchema>;
export type StoryUpdateInput = z.infer<typeof storyUpdateSchema>;

// Avatar lưu dạng data URL base64 (đã resize 256px) hoặc URL ngoài.
// Giới hạn ~2MB chuỗi để tránh payload quá lớn.
const AVATAR_MAX_LENGTH = 2_000_000;

export const progressUpdateSchema = z.object({
  dailyGoal: z.number().int().min(1).max(200).optional(),
  freezeTokens: z.number().int().min(0).max(10).optional(),
  displayName: z.string().trim().max(50, "Tên tối đa 50 ký tự").nullable().optional(),
  bio: z.string().trim().max(280, "Giới thiệu tối đa 280 ký tự").nullable().optional(),
  avatarUrl: z
    .string()
    .max(AVATAR_MAX_LENGTH, "Ảnh quá lớn")
    .refine(
      (v) => v === "" || v.startsWith("data:image/") || /^https?:\/\//.test(v),
      "Avatar phải là ảnh tải lên hoặc URL hợp lệ",
    )
    .nullable()
    .optional(),
});

export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;

export const bulkCardsSchema = z.object({
  action: z.enum(["delete", "move", "suspend", "unsuspend", "tag"]),
  ids: z.array(z.string().min(1)).min(1, "Phải chọn ít nhất 1 từ").max(500),
  targetDeckId: z.string().min(1).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
});

export type BulkCardsInput = z.infer<typeof bulkCardsSchema>;

// Sắp xếp lại thứ tự thẻ trong 1 deck: orderedIds theo đúng thứ tự mới
export const cardReorderSchema = z.object({
  deckId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1, "Danh sách trống").max(2000),
});

export type CardReorderInput = z.infer<typeof cardReorderSchema>;
