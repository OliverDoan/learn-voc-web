import type { GrammarLevel, GrammarTopic } from "./types";
import { GRAMMAR_TOPICS_A } from "./topics-a";
import { GRAMMAR_TOPICS_B } from "./topics-b";
import { GRAMMAR_TOPICS_C } from "./topics-c";
import { GRAMMAR_TOPICS_POS } from "./topics-pos";
import { GRAMMAR_TOPICS_TENSES } from "./topics-tenses";
import { GRAMMAR_TOPICS_CLAUSES } from "./topics-clauses";

export * from "./types";

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  ...GRAMMAR_TOPICS_A,
  ...GRAMMAR_TOPICS_B,
  ...GRAMMAR_TOPICS_C,
  ...GRAMMAR_TOPICS_POS,
  ...GRAMMAR_TOPICS_TENSES,
  ...GRAMMAR_TOPICS_CLAUSES,
];

/**
 * Cấu trúc 20 chương theo đúng thứ tự sách ngữ pháp (chương 20 "Key/Đáp án" bỏ qua).
 * Mỗi chương gom 1 hoặc nhiều topic (vd: chương Tenses gom nhiều thì).
 */
export interface GrammarChapter {
  num: number;
  title: string; // tiếng Anh
  titleVi: string;
  topicIds: string[];
}

export const GRAMMAR_CHAPTERS: GrammarChapter[] = [
  { num: 1, title: "Nouns", titleVi: "Danh từ", topicIds: ["nouns"] },
  { num: 2, title: "Article", titleVi: "Mạo từ", topicIds: ["articles"] },
  { num: 3, title: "Pronouns", titleVi: "Đại từ", topicIds: ["pronouns"] },
  { num: 4, title: "Quantifiers", titleVi: "Từ định lượng", topicIds: ["quantifiers"] },
  { num: 5, title: "Adjectives", titleVi: "Tính từ", topicIds: ["adjectives"] },
  { num: 6, title: "Adverbs", titleVi: "Trạng từ", topicIds: ["adverbs"] },
  { num: 7, title: "Prepositions", titleVi: "Giới từ", topicIds: ["prepositions"] },
  { num: 8, title: "Verbs", titleVi: "Động từ", topicIds: ["verbs"] },
  { num: 9, title: "Modal verbs", titleVi: "Động từ khuyết thiếu", topicIds: ["modal-verbs"] },
  {
    num: 10,
    title: "Tenses",
    titleVi: "Các thì",
    topicIds: [
      "present-simple",
      "present-continuous",
      "present-perfect",
      "present-perfect-continuous",
      "past-simple",
      "past-continuous",
      "past-perfect",
      "past-perfect-continuous",
      "future-simple",
      "future-continuous",
    ],
  },
  { num: 11, title: "Conjunctions", titleVi: "Liên từ", topicIds: ["conjunctions"] },
  { num: 12, title: "Questions", titleVi: "Câu hỏi", topicIds: ["questions"] },
  { num: 13, title: "Tag questions", titleVi: "Câu hỏi đuôi", topicIds: ["tag-questions"] },
  { num: 14, title: "Passive voice", titleVi: "Câu bị động", topicIds: ["passive-voice"] },
  { num: 15, title: "Relative clause", titleVi: "Mệnh đề quan hệ", topicIds: ["relative-clauses"] },
  { num: 16, title: "Conditional sentences", titleVi: "Câu điều kiện", topicIds: ["conditionals"] },
  { num: 17, title: "Comparisons", titleVi: "So sánh", topicIds: ["comparatives-superlatives"] },
  { num: 18, title: "Wishes", titleVi: "Câu ước", topicIds: ["wishes"] },
  { num: 19, title: "Reported speech", titleVi: "Câu tường thuật", topicIds: ["reported-speech"] },
];

export function getGrammarTopic(id: string): GrammarTopic | undefined {
  return GRAMMAR_TOPICS.find((t) => t.id === id);
}

export function grammarTopicsByLevel(level: GrammarLevel): GrammarTopic[] {
  return GRAMMAR_TOPICS.filter((t) => t.level === level);
}

/** Trả về các chương kèm danh sách topic đã resolve, theo đúng thứ tự sách. */
export function grammarChaptersWithTopics(): Array<{
  chapter: GrammarChapter;
  topics: GrammarTopic[];
}> {
  return GRAMMAR_CHAPTERS.map((chapter) => ({
    chapter,
    topics: chapter.topicIds
      .map((id) => getGrammarTopic(id))
      .filter((t): t is GrammarTopic => Boolean(t)),
  })).filter((c) => c.topics.length > 0);
}
