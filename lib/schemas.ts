import { z } from "zod";

export const deckCreateSchema = z.object({
  name: z.string().trim().min(1, "Tên không được trống").max(80),
  description: z.string().trim().max(300).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Màu phải dạng hex #RRGGBB")
    .default("#3b82f6"),
  icon: z.string().max(8).optional().nullable(),
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

export const cardCreateSchema = z.object({
  deckId: z.string().min(1),
  word: z.string().trim().min(1, "Từ không được trống").max(120),
  meaning: z.string().trim().min(1, "Nghĩa không được trống").max(500),
  partOfSpeech: z.string().trim().max(30).optional().nullable(),
  rootWord: z.string().trim().max(120).optional().nullable(),
  phonetic: z.string().trim().max(80).optional().nullable(),
  example: z.string().trim().max(500).optional().nullable(),
  exampleTranslation: z.string().trim().max(500).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  audioUrl: z.string().url().optional().nullable().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  wordForms: wordFormsSchema.optional().nullable(),
});

export const cardUpdateSchema = cardCreateSchema.partial().omit({ deckId: true });

export const cardImportItemSchema = z.object({
  word: z.string().trim().min(1).max(120),
  meaning: z.string().trim().min(1).max(500),
  partOfSpeech: z.string().trim().max(30).optional().nullable(),
  rootWord: z.string().trim().max(120).optional().nullable(),
  phonetic: z.string().trim().max(80).optional().nullable(),
  example: z.string().trim().max(500).optional().nullable(),
  exampleTranslation: z.string().trim().max(500).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  wordForms: wordFormsSchema.optional().nullable(),
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

export const reviewSchema = z.object({
  cardId: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  timeTakenMs: z.number().int().nonnegative().max(60 * 60 * 1000).default(0),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const storyCreateSchema = z.object({
  deckId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(5000),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  audioUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const storyUpdateSchema = storyCreateSchema.partial().omit({ deckId: true });

export type StoryCreateInput = z.infer<typeof storyCreateSchema>;
export type StoryUpdateInput = z.infer<typeof storyUpdateSchema>;

export const progressUpdateSchema = z.object({
  dailyGoal: z.number().int().min(1).max(200).optional(),
  freezeTokens: z.number().int().min(0).max(10).optional(),
});

export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;

export const bulkCardsSchema = z.object({
  action: z.enum(["delete", "move", "suspend", "unsuspend", "tag"]),
  ids: z.array(z.string().min(1)).min(1, "Phải chọn ít nhất 1 từ").max(500),
  targetDeckId: z.string().min(1).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
});

export type BulkCardsInput = z.infer<typeof bulkCardsSchema>;
