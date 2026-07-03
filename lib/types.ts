export interface Deck {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  // JSON string các cột tùy chỉnh dạng bảng (parse bằng lib/custom-columns)
  customColumns: string;
  // Thời điểm đánh dấu "đã học xong" (null = chưa). Dùng cho khóa tuần tự.
  learnedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Một bản ghi hoàn thành dạng bài tập (best-accuracy). Trả về từ endpoint ghi nhận.
export interface DeckActivityRecord {
  activity: string;
  bestAccuracy: number | null;
}

// Thông tin deck rút gọn dùng chung khi hiển thị nguồn.
export interface DeckRef {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

// Một lượt làm bài trong "Lịch sử làm bài" (timeline).
export interface AttemptHistoryItem {
  id: string;
  deck: DeckRef;
  activity: string;
  accuracy: number | null;
  totalCount: number;
  wrongCount: number;
  createdAt: string;
}

// Một thẻ trong danh sách "Câu sai cần ôn" (đã cộng dồn qua các lượt).
export interface WrongCardItem {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string | null;
  phonetic: string | null;
  deck: DeckRef;
  wrongCount: number;
  lastWrongAt: string;
}

export interface HistoryData {
  attempts: AttemptHistoryItem[];
  wrongCards: WrongCardItem[];
}

// Trạng thái một dạng bài tập khả dụng của deck (server tính, dùng cho thanh progress).
export interface DeckExerciseStatus {
  key: string;
  label: string;
  scored: boolean;
  done: boolean;
  bestAccuracy: number | null;
  // ID các thẻ làm sai ở lần gần nhất (để đánh dấu "lần trước bạn sai từ này")
  wrongCardIds: string[];
}

export interface DeckWithCounts extends Deck {
  _count: { cards: number; stories: number };
  due: number;
  newCount: number;
  // Trạng thái suy diễn (server tính từ learnedAt + thứ tự Unit)
  learned: boolean;
  locked: boolean;
  // Chỉ có ở chi tiết deck: các dạng bài tập khả dụng + cờ đã làm hết.
  exercises?: DeckExerciseStatus[];
  exercisesDone?: boolean;
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
  // JSON string nghĩa từng dạng từ: {"noun":"vẻ đẹp","adjective":"đẹp",...}
  wordFormMeanings: string | null;
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

// Story kèm tên deck + số từ chêm — dùng cho danh sách và trang đọc tất cả
export interface StoryListItem extends Story {
  _count: { storyCards: number };
  deck: { id: string; name: string };
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
