export interface Deck {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
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
  phonetic: string | null;
  example: string | null;
  exampleTranslation: string | null;
  note: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  tags: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  state: string;
  lapses: number;
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
  xpEarned: number;
}

export interface UserProgress {
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalXp: number;
  level: number;
  dailyGoal: number;
  freezeTokens: number;
}
