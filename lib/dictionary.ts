const BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

const MAX_RELATED = 12;

export interface DictionaryDefinition {
  definition: string;
  example?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: DictionaryMeaning[];
  synonyms: string[];
  antonyms: string[];
}

interface RawPhonetic {
  text?: string;
  audio?: string;
}

interface RawDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface RawMeaning {
  partOfSpeech: string;
  definitions: RawDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface RawEntry {
  word: string;
  phonetic?: string;
  phonetics?: RawPhonetic[];
  meanings: RawMeaning[];
}

/** Gom synonyms hoặc antonyms từ toàn bộ entry (mức meaning + definition), dedupe, bỏ chính từ. */
function collectRelated(
  entries: RawEntry[],
  key: "synonyms" | "antonyms",
  word: string,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const base = word.trim().toLowerCase();

  const add = (list: string[] | undefined) => {
    if (!list) return;
    for (const raw of list) {
      const value = raw.trim();
      const lower = value.toLowerCase();
      if (!value || lower === base || seen.has(lower)) continue;
      seen.add(lower);
      result.push(value);
      if (result.length >= MAX_RELATED) return;
    }
  };

  for (const entry of entries) {
    for (const meaning of entry.meanings ?? []) {
      add(meaning[key]);
      for (const def of meaning.definitions ?? []) add(def[key]);
      if (result.length >= MAX_RELATED) return result;
    }
  }
  return result;
}

export async function lookupWord(word: string): Promise<DictionaryResult | null> {
  const trimmed = word.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(trimmed)}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RawEntry[] | { title?: string };
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    const phonetic =
      entry.phonetic ??
      entry.phonetics?.find((p) => p.text)?.text;
    const audioUrl = entry.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio;

    return {
      word: entry.word,
      phonetic,
      audioUrl,
      meanings: entry.meanings.map((m) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.slice(0, 3).map((d) => ({
          definition: d.definition,
          example: d.example,
        })),
      })),
      synonyms: collectRelated(data, "synonyms", entry.word),
      antonyms: collectRelated(data, "antonyms", entry.word),
    };
  } catch {
    return null;
  }
}
