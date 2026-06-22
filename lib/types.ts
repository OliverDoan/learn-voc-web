export interface Deck {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeckWithCounts extends Deck {
  _count: { cards: number; stories: number };
  due: number;
  newCount: number;
}

export interface Card {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  partOfSpeech: string | null;
  // Từ gốc + loại từ, vd "progress (noun, verb)"
  rootWord: string | null;
  // Nghĩa tiếng Việt của từ gốc
  rootWordMeaning: string | null;
  phonetic: string | null;
  example: string | null;
  exampleTranslation: string | null;
  note: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  tags: string;
  // JSON string các dạng từ: {"noun":"beauty","adjective":"beautiful",...}
  wordForms: string | null;
  // JSON array string: ["happy","glad"]
  synonyms: string | null;
  antonyms: string | null;
  favorite: boolean;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  state: string;
  lapses: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  deckId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  audioUrl: string | null;
  readCount: number;
  lastReadAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoryWithCards extends Story {
  storyCards: Array<{
    id: string;
    cardId: string;
    order: number;
    card: Card;
  }>;
}

export interface DailyStat {
  id: string;
  date: string;
  cardsReviewed: number;
  cardsLearned: number;
  correctCount: number;
  totalCount: number;
  timeSpentSec: number;
}

export interface UserProgress {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  dailyGoal: number;
  freezeTokens: number;
}
