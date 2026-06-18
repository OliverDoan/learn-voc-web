import type { GrammarLevel, GrammarTopic } from "./types";
import { GRAMMAR_TOPICS_A } from "./topics-a";
import { GRAMMAR_TOPICS_B } from "./topics-b";
import { GRAMMAR_TOPICS_C } from "./topics-c";

export * from "./types";

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  ...GRAMMAR_TOPICS_A,
  ...GRAMMAR_TOPICS_B,
  ...GRAMMAR_TOPICS_C,
];

export function getGrammarTopic(id: string): GrammarTopic | undefined {
  return GRAMMAR_TOPICS.find((t) => t.id === id);
}

export function grammarTopicsByLevel(level: GrammarLevel): GrammarTopic[] {
  return GRAMMAR_TOPICS.filter((t) => t.level === level);
}
